#!/bin/bash

# AI 코드 리뷰 분석 스크립트
# 사용법: ./analyze-code-review.sh <before-sha> <after-sha>

set -e

# 설정 파일 로드
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/settings.env"

BEFORE_SHA=${1}
AFTER_SHA=${2}

echo "AI 코드 리뷰 분석: $BEFORE_SHA → $AFTER_SHA"

# 원격 브랜치 최신화
git fetch origin || true

# 환경변수에서 제외 패턴 로드 (파이프로 구분된 문자열을 배열로 변환)
IFS='|' read -ra EXCLUDE_PATTERNS <<< "$EXCLUDE_PATTERNS"

# git diff로 변경된 파일 가져오기
CHANGED_FILES=$(git diff --name-only $BEFORE_SHA..$AFTER_SHA)

# 필터링된 파일 목록
FILTERED_FILES=""
for file in $CHANGED_FILES; do
  SKIP=false

  # 제외 패턴 체크
  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ $file == $pattern ]]; then
      SKIP=true
      break
    fi
  done

  if [ "$SKIP" = false ]; then
    FILTERED_FILES="$FILTERED_FILES $file"
  fi
done

echo "리뷰 대상 파일: $FILTERED_FILES"

if [ -z "$FILTERED_FILES" ]; then
  echo "리뷰할 파일 없음"
  echo "[]" > review_comments.json
  exit 0
fi

# 각 파일별 diff 수집
ALL_DIFFS=""
for file in $FILTERED_FILES; do
  FILE_DIFF=$(git diff $BEFORE_SHA..$AFTER_SHA -- "$file")

  ALL_DIFFS="$ALL_DIFFS

=== 파일: $file ===
$FILE_DIFF
"
done

# 프롬프트 템플릿 로드
PROMPT_TEMPLATE=$(cat "$SCRIPT_DIR/../prompts/code-review.txt")

# 프롬프트 조합
PROMPT="$PROMPT_TEMPLATE

**코드 변경사항**:
$ALL_DIFFS"

echo "Gemini AI에게 리뷰 요청 중..."

# Gemini CLI로 분석 실행 (설정값 사용)
REVIEW_RESULT=$(gemini -m $MODEL_NAME -p "$PROMPT")

echo "=== AI 리뷰 결과 ==="
echo "$REVIEW_RESULT"
echo "===================="

# JSON 추출 (```json ... ``` 형태로 올 수 있음)
# 파일로 저장하여 처리
echo "$REVIEW_RESULT" > /tmp/review_raw.txt

# Python을 사용한 안전한 JSON 추출 및 검증
REVIEW_JSON=$(python3 << 'PYTHON_SCRIPT'
import re
import sys
import json

try:
    with open('/tmp/review_raw.txt', 'r', encoding='utf-8') as f:
        content = f.read()

    json_str = None

    # 1. ```json ... ``` 블록에서 추출 시도
    # DOTALL 플래그로 줄바꿈 포함, non-greedy 매칭
    match = re.search(r'```json\s*\n(.*?)\n```', content, re.DOTALL)

    if match:
        json_str = match.group(1)
    # 2. [ 로 시작하는 JSON 배열 찾기
    elif content.strip().startswith('['):
        json_str = content.strip()
    # 3. 전체에서 JSON 배열 패턴 찾기
    else:
        match = re.search(r'\[[\s\S]*\]', content)
        if match:
            json_str = match.group(0)

    # JSON 유효성 검증 및 재직렬화 (이스케이프 처리)
    if json_str:
        try:
            # JSON 파싱 테스트
            parsed = json.loads(json_str)
            # 유효한 JSON으로 재출력 (이스케이프 처리됨)
            print(json.dumps(parsed, ensure_ascii=False, indent=2))
        except json.JSONDecodeError as e:
            print(f"JSON 파싱 에러: {e}", file=sys.stderr)
            print('[]')
    else:
        print('[]')

except Exception as e:
    print(f"예외 발생: {e}", file=sys.stderr)
    print('[]')
PYTHON_SCRIPT
)

# 빈 결과 처리
if [ -z "$REVIEW_JSON" ] || [ "$REVIEW_JSON" = "null" ]; then
  echo "⚠️  JSON 추출 실패, 빈 배열로 대체"
  REVIEW_JSON="[]"
fi

# 디버깅 출력
echo "=== 추출된 JSON 크기: $(echo "$REVIEW_JSON" | wc -c) bytes ==="
echo "=== 첫 300자 미리보기 ==="
echo "$REVIEW_JSON" | head -c 300
echo "..."
echo "======================="

# JSON 파일로 저장 후 유효성 검사
echo "$REVIEW_JSON" > /tmp/review_temp.json

# JSON 유효성 검사
if jq empty /tmp/review_temp.json 2>/dev/null; then
  cp /tmp/review_temp.json review_comments.json
  echo "✅ 리뷰 코멘트 생성 완료"

  # 요약 출력
  COMMENT_COUNT=$(jq 'length' review_comments.json)
  echo "📊 총 $COMMENT_COUNT개 이슈 발견"
else
  echo "⚠️  유효하지 않은 JSON 응답, 빈 배열로 대체"
  echo "[]" > review_comments.json

  # 디버깅: jq 에러 출력
  echo "=== jq 에러 메시지 ==="
  jq empty /tmp/review_temp.json 2>&1 || true
  echo "===================="
fi

# GitHub Actions output (선택)
if [ -n "$GITHUB_OUTPUT" ]; then
  COMMENT_COUNT=$(cat review_comments.json | jq 'length')
  echo "comment_count=$COMMENT_COUNT" >> "$GITHUB_OUTPUT"
fi
