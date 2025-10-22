#!/bin/bash

# PR 업데이트 시 새로운 커밋만 분석하는 스크립트
# 사용법: ./analyze-pr-updates.sh <before-sha> <after-sha>

set -e

# 설정 파일 로드
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/settings.env"

BEFORE_SHA=${1}
AFTER_SHA=${2}

echo "Analyzing new commits: $BEFORE_SHA → $AFTER_SHA"

# 원격 브랜치 최신화
git fetch origin || true

# 새로운 커밋만 추출
echo "Extracting new commits..."
NEW_COMMITS=$(git log $BEFORE_SHA..$AFTER_SHA --oneline)
NEW_COMMITS_DETAIL=$(git log $BEFORE_SHA..$AFTER_SHA --format="### %s%n%b")

echo "Found new commits:"
echo "$NEW_COMMITS"

if [ -z "$NEW_COMMITS" ]; then
  echo "No new commits found"
  echo "changes=_변경사항 없음_" >> "$GITHUB_OUTPUT"
  exit 0
fi

# 새로운 커밋의 diff 분석
DIFF_STATS=$(git diff --stat $BEFORE_SHA..$AFTER_SHA)
DIFF_CONTENT=$(git diff $BEFORE_SHA..$AFTER_SHA)

# 프롬프트 템플릿 로드
PROMPT_TEMPLATE=$(cat "$SCRIPT_DIR/../prompts/pr-update.txt")

# 언어 설정
if [ "$PR_LANGUAGE" = "ENGLISH" ]; then
  LANGUAGE_INSTRUCTION="Write in English"
else
  LANGUAGE_INSTRUCTION="한글로 작성"
fi

# 템플릿에 변수 치환
PROMPT_TEMPLATE=$(echo "$PROMPT_TEMPLATE" | sed "s|{LANGUAGE_INSTRUCTION}|$LANGUAGE_INSTRUCTION|g")

# 프롬프트 조합
PROMPT="$PROMPT_TEMPLATE

**추가된 커밋 목록** (최신순):
$NEW_COMMITS

**커밋 상세 내용**:
$NEW_COMMITS_DETAIL

**변경된 파일 통계**:
$DIFF_STATS

**상세 변경 내용** (참고용):
$DIFF_CONTENT"

# Gemini CLI로 분석 실행 (설정값 사용)
ANALYSIS_RESULT=$(gemini -m $MODEL_NAME -p "$PROMPT")

# GitHub Actions 환경변수로 출력
echo "changes<<EOF" >> "$GITHUB_OUTPUT"
echo "$ANALYSIS_RESULT" >> "$GITHUB_OUTPUT"
echo "EOF" >> "$GITHUB_OUTPUT"

# 디버깅용 출력
echo "=== Generated Update Summary ==="
echo "$ANALYSIS_RESULT"
echo "================================"
