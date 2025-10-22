#!/bin/bash

# PR 설명을 Gemini CLI로 자동 생성하는 스크립트
# 사용법: ./generate-pr-description.sh <target-branch> <source-branch>

set -e

# 설정 파일 로드
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/settings.env"

TARGET_BRANCH=${1:-main}
SOURCE_BRANCH=${2:-dev}

echo "Generating PR description for $SOURCE_BRANCH → $TARGET_BRANCH"

# 원격 브랜치 최신화
git fetch origin $TARGET_BRANCH $SOURCE_BRANCH || true

# dev 브랜치에서 main 브랜치에 없는 커밋만 분석
echo "Analyzing commits: origin/$TARGET_BRANCH..origin/$SOURCE_BRANCH"

# main에 없는 dev의 커밋만 추출 (최신순)
COMMITS=$(git log origin/$TARGET_BRANCH..origin/$SOURCE_BRANCH --oneline)
COMMITS_DETAIL=$(git log origin/$TARGET_BRANCH..origin/$SOURCE_BRANCH --format="### %s%n%b")

echo "Found commits:"
echo "$COMMITS"

if [ -z "$COMMITS" ]; then
  echo "No commits found between $TARGET_BRANCH and $SOURCE_BRANCH"
  exit 1
fi

# diff 내용 가져오기 (main과 dev의 차이)
DIFF_CONTENT=$(git diff origin/$TARGET_BRANCH..origin/$SOURCE_BRANCH)
DIFF_STATS=$(git diff --stat origin/$TARGET_BRANCH..origin/$SOURCE_BRANCH)

# 프롬프트 템플릿 로드
PROMPT_TEMPLATE=$(cat "$SCRIPT_DIR/../prompts/pr-create.txt")

# 언어 설정
if [ "$PR_LANGUAGE" = "ENGLISH" ]; then
  LANGUAGE_INSTRUCTION="Write in English"
else
  LANGUAGE_INSTRUCTION="한글로 작성"
fi

# 템플릿에 변수 치환 (| 구분자 사용)
PROMPT_TEMPLATE=$(echo "$PROMPT_TEMPLATE" | sed "s|{LANGUAGE_INSTRUCTION}|$LANGUAGE_INSTRUCTION|g")

# 프롬프트 조합
PROMPT="$PROMPT_TEMPLATE

커밋 목록 (최신순, 모두 분석 필수):
$COMMITS

커밋 상세 내용 (최신순, 모두 분석 필수):
$COMMITS_DETAIL

변경 파일 통계:
$DIFF_STATS

상세 변경 내용:
$DIFF_CONTENT"

# Gemini CLI로 PR 제목+설명 생성 (설정값 사용)
FULL_RESPONSE=$(gemini -m $MODEL_NAME -p "$PROMPT")

# 제목과 본문 분리
PR_TITLE=$(echo "$FULL_RESPONSE" | grep "^TITLE:" | sed 's/^TITLE: //')
PR_BODY=$(echo "$FULL_RESPONSE" | sed '1,/^---$/d')

# 불완전한 마크다운 코드 블록 제거 (마지막 줄이 ``` 인 경우)
PR_BODY=$(echo "$PR_BODY" | sed -e '$ {' -e '/^```$/d' -e '}')

# GitHub Actions 환경변수로 출력
echo "title=$PR_TITLE" >> "$GITHUB_OUTPUT"
echo "body<<EOF" >> "$GITHUB_OUTPUT"
echo "$PR_BODY" >> "$GITHUB_OUTPUT"
echo "EOF" >> "$GITHUB_OUTPUT"

# 디버깅용 출력
echo "Generated Title: $PR_TITLE"
echo "Generated Body:"
echo "$PR_BODY"
