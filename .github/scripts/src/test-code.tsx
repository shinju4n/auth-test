// AI 코드 리뷰 테스트 파일
// 다양한 심각도의 이슈를 포함

import { useState, useEffect } from 'react';

// ============================================================================
// 🔴 Critical - 보안 취약점
// ============================================================================

// XSS 취약점
export function UserProfile({ username }: { username: string }) {
  return <div dangerouslySetInnerHTML={{ __html: username }} />;
}

// 하드코딩된 API 키
export const API_KEY = "sk-1234567890abcdef";
export const SECRET_TOKEN = "my-secret-token-12345";

// ============================================================================
// 🟠 High - 성능 이슈
// ============================================================================

// N+1 문제 (useEffect 안에서 반복 API 호출)
export function ProductList({ productIds }: { productIds: string[] }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productIds.forEach(async (id) => {
      const data = await fetch(`/api/products/${id}`);
      setProducts(prev => [...prev, data]);
    });
  }, [productIds]);

  return <div>{products.length} products</div>;
}

// 메모리 누수 (cleanup 없는 이벤트 리스너)
export function WindowResize() {
  const handleResize = () => console.log('resized');

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // cleanup 없음!
  }, []);

  return <div>Window resize tracker</div>;
}

// ============================================================================
// 🟠 High - SOLID 원칙 위반
// ============================================================================

// Single Responsibility 위반 (한 컴포넌트가 너무 많은 일)
export function Dashboard() {
  // 데이터 fetching
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  // 인증 로직
  const [isAuth, setIsAuth] = useState(false);

  // 차트 렌더링 로직
  const renderChart = () => {
    return <div>Chart</div>;
  };

  // 테이블 렌더링 로직
  const renderTable = () => {
    return <table><tbody><tr><td>Data</td></tr></tbody></table>;
  };

  // 폼 제출 로직
  const handleSubmit = () => {
    console.log('submit');
  };

  return (
    <div>
      {renderChart()}
      {renderTable()}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
