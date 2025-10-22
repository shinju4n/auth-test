#!/bin/bash

# 테스트 코드 생성/삭제 스크립트
# 사용법:
#   ./generate-test-code.sh create [security|performance|solid|all]
#   ./generate-test-code.sh clean

set -e

COMMAND=${1:-create}
TEST_TYPE=${2:-all}
OUTPUT_FILE="src/test-code.tsx"

# 테스트 파일 삭제
if [ "$COMMAND" = "clean" ]; then
  if [ -f "$OUTPUT_FILE" ]; then
    rm -f "$OUTPUT_FILE"
    echo "✅ 테스트 파일 삭제 완료: $OUTPUT_FILE"
  else
    echo "ℹ️  테스트 파일이 존재하지 않음: $OUTPUT_FILE"
  fi
  exit 0
fi

# 테스트 파일 생성
echo "🔨 테스트 코드 생성 중... (타입: $TEST_TYPE)"

# src 디렉토리 확인
mkdir -p src

case $TEST_TYPE in
  security)
    cat > "$OUTPUT_FILE" << 'EOF'
// 🔴 Critical - 보안 취약점 테스트 코드

// XSS 취약점
export function UserProfile({ username }: { username: string }) {
  return <div dangerouslySetInnerHTML={{ __html: username }} />;
}

// 하드코딩된 API 키
export const API_KEY = "sk-1234567890abcdef";
export const SECRET_TOKEN = "my-secret-token-12345";
EOF
    ;;

  performance)
    cat > "$OUTPUT_FILE" << 'EOF'
// 🟠 High - 성능 이슈 테스트 코드

import { useState, useEffect } from 'react';

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
EOF
    ;;

  solid)
    cat > "$OUTPUT_FILE" << 'EOF'
// 🟠 High - SOLID 원칙 위반 테스트 코드

import { useState } from 'react';

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
EOF
    ;;

  all)
    cat > "$OUTPUT_FILE" << 'EOF'
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
EOF
    ;;

  *)
    echo "❌ 잘못된 테스트 타입: $TEST_TYPE"
    echo "사용법: ./generate-test-code.sh create [security|performance|solid|all]"
    exit 1
    ;;
esac

echo "✅ 테스트 파일 생성 완료: $OUTPUT_FILE"
echo ""
echo "📝 다음 단계:"
echo "  1. git add $OUTPUT_FILE"
echo "  2. git commit -m 'test: add test code for AI review'"
echo "  3. git push"
echo ""
echo "🧹 삭제: ./generate-test-code.sh clean"
