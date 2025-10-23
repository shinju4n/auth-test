#!/bin/bash

# AI 답변 생성 스크립트 (Gemini API 직접 호출)
# 사용법: ./ai-reply-direct.sh <commit-sha> <file-path> <line-number> <question>

set -e

# 설정 파일 로드
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/settings.env"

COMMIT_SHA=${1}
FILE_PATH=${2}
LINE_NUMBER=${3}
QUESTION=${4}

echo "AI 답변 생성 중..."
echo "파일: $FILE_PATH:$LINE_NUMBER"
echo "질문: $QUESTION"

# /ai 제거하고 실제 질문만 추출
CLEAN_QUESTION=$(echo "$QUESTION" | sed 's/^\/ai[[:space:]]*//')

# 원본 AI 코멘트 내용
if [ -f "/tmp/parent_comment.txt" ]; then
  PARENT_COMMENT=$(cat /tmp/parent_comment.txt)
else
  PARENT_COMMENT="(원본 코멘트 없음)"
fi

# 해당 파일의 전체 내용 가져오기
if [ -f "$FILE_PATH" ]; then
  # 라인 번호 주변 컨텍스트 추출 (앞뒤 10줄)
  START_LINE=$((LINE_NUMBER - 10))
  END_LINE=$((LINE_NUMBER + 10))

  if [ $START_LINE -lt 1 ]; then
    START_LINE=1
  fi

  CODE_CONTEXT=$(sed -n "${START_LINE},${END_LINE}p" "$FILE_PATH" | cat -n)
else
  CODE_CONTEXT="(파일을 찾을 수 없음)"
fi

# 프롬프트 템플릿 로드
PROMPT_TEMPLATE=$(cat "$SCRIPT_DIR/../prompts/ai-reply.txt")

# 프롬프트 조합
PROMPT="$PROMPT_TEMPLATE

**원본 리뷰 코멘트**:
$PARENT_COMMENT

**해당 코드 (라인 $LINE_NUMBER 주변)**:
\`\`\`
$CODE_CONTEXT
\`\`\`

**개발자의 질문**:
$CLEAN_QUESTION

답변을 작성하세요:"

echo "Gemini API에 답변 요청 중..."

# JSON 이스케이프 처리
ESCAPED_PROMPT=$(echo "$PROMPT" | jq -Rs .)

# Gemini API 직접 호출 (설정값 사용)
API_RESPONSE=$(curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/$MODEL_NAME:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
    \"contents\": [{
      \"parts\": [{
        \"text\": $ESCAPED_PROMPT
      }]
    }],
    \"generationConfig\": {
      \"temperature\": $REPLY_TEMPERATURE,
      \"maxOutputTokens\": $REPLY_MAX_TOKENS
    }
  }")

echo "=== API 응답 ==="
echo "$API_RESPONSE" | jq '.'
echo "=================="

# 응답에서 텍스트 추출
AI_REPLY=$(echo "$API_RESPONSE" | jq -r '.candidates[0].content.parts[0].text // empty')

if [ -z "$AI_REPLY" ]; then
  echo "❌ AI 답변 생성 실패"
  echo "$API_RESPONSE" | jq '.error // .'
  exit 1
fi

echo "=== AI 답변 결과 ==="
echo "$AI_REPLY"
echo "===================="

# 답변 파일로 저장
echo "$AI_REPLY" > ai_reply.txt

echo "✅ AI 답변 생성 완료"
