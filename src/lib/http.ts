/**
 * HTTP 함수 with auto token refresh
 * - 401 에러 시 자동으로 token refresh
 * - 중복 refresh 요청 방지
 * - 제네릭 타입으로 타입 안전성 보장
 */

type HttpOptions = RequestInit;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error?: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

/**
 * HTTP 요청을 수행하고 자동으로 토큰 갱신
 * @template T - 응답 데이터의 타입
 * @param url - 요청할 URL
 * @param options - RequestInit 옵션
 * @returns Response 객체
 *
 * @example
 * ```
 * const response = await http('/api/login', { method: 'POST', body: JSON.stringify({...}) });
 * const data: LoginResponse = await response.json();
 *
 * // 또는 helper 함수 사용
 * const data = await httpJson<LoginResponse>('/api/login', {...});
 * ```
 */
async function http(url: string, options: HttpOptions = {}): Promise<Response> {
  let response = await fetch(url, options);

  // 401 Unauthorized - token 갱신 필요
  if (response.status === 401) {
    // /api/refresh 자체는 intercept 하지 않음
    if (url.includes("/api/refresh")) {
      return response;
    }

    // 이미 refresh 중인 경우 queue에 추가
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: async () => {
            try {
              const retryResponse = await fetch(url, options);
              resolve(retryResponse);
            } catch (error) {
              reject(error);
            }
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      // Token refresh
      const refreshResponse = await fetch("/api/refresh", {
        method: "POST",
      });

      if (refreshResponse.ok) {
        // Refresh 성공
        processQueue();
        // 원래 요청 재시도
        response = await fetch(url, options);
      } else {
        // Refresh 실패 - 서버에서 쿠키 삭제
        await fetch("/api/logout", { method: "POST" });
        processQueue(new Error("Token refresh failed"));
      }
    } catch (error) {
      // Refresh 에러 발생 - 서버에서 쿠키 삭제
      await fetch("/api/logout", { method: "POST" });
      processQueue(error);
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}

/**
 * HTTP 요청을 수행하고 자동으로 JSON을 파싱
 * @template T - 응답 데이터의 타입
 * @param url - 요청할 URL
 * @param options - RequestInit 옵션
 * @returns 파싱된 JSON 데이터
 *
 * @example
 * ```
 * const data = await httpJson<LoginResponse>('/api/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email, password }),
 * });
 * ```
 */
export async function httpJson<T>(
  url: string,
  options: HttpOptions = {}
): Promise<T> {
  const response = await http(url, options);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export default http;
