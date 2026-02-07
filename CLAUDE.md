# AI Trading Arena Project (v3.0)

## 프로젝트 개요

9개의 AI 모델이 실시간으로 BTC 트레이딩 경쟁을 벌이는 웹 애플리케이션.
게이미피케이션 요소(레이싱, 업적, 리더보드)로 AI 트레이딩 의사결정을 시각화.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| 스타일링 | Tailwind CSS 4 + Framer Motion |
| 상태관리 | Zustand |
| UI 컴포넌트 | Radix UI + Recharts |
| 백엔드 | Supabase (PostgreSQL + Auth + Realtime) |
| 자동화 | n8n (7개 워크플로우) |

## 디렉토리 구조

```
/Users/ralphpark/n8n/
├── ai-trading-arena/          # Next.js 웹 애플리케이션
│   ├── src/
│   │   ├── app/               # 페이지 라우트
│   │   ├── components/        # React 컴포넌트
│   │   │   ├── racing/        # 레이싱 시각화
│   │   │   ├── gamification/  # 게임 요소
│   │   │   ├── charts/        # 차트 컴포넌트
│   │   │   ├── decision/      # 트레이딩 결정 UI
│   │   │   └── ui/            # 기본 UI 컴포넌트
│   │   ├── hooks/             # 커스텀 훅
│   │   ├── stores/            # Zustand 스토어
│   │   ├── lib/               # 유틸리티
│   │   └── types/             # TypeScript 타입
│   └── public/                # 정적 파일
│
├── workflows/                 # n8n 워크플로우 JSON
├── claude-proxy/              # Claude API 프록시
├── gemini-proxy/              # Gemini API 프록시
├── openai-proxy/              # OpenAI API 프록시
└── docs/                      # 문서 및 세션 로그
```

## 명령어

### Frontend (ai-trading-arena/)
```bash
cd ai-trading-arena
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
```

### 프록시 서버
```bash
# Claude Proxy (포트 3001)
cd claude-proxy && node server-v3.js

# Gemini Proxy (포트 3002)
cd gemini-proxy && node server.js

# OpenAI Proxy (포트 3003)
cd openai-proxy && node server.js
```

## n8n 워크플로우

| 파일 | 역할 | 실행 주기 |
|------|------|-----------|
| 00_token_manager.json | TradeLocker 토큰 갱신 | 30분 |
| 01_market_data_collector.json | 시장 데이터 수집 | 15분 |
| 02_ai_decision_engine.json | 9개 AI 모델 의사결정 | 15분 |
| 03_virtual_portfolio_manager.json | 가상 포트폴리오 관리 | 이벤트 |
| 04_trade_execution.json | 거래 실행 | 이벤트 |
| 05_trading_hours_manager.json | 거래 시간 관리 | 1분 |
| 06_error_alert_system.json | 에러 알림 (Telegram) | 이벤트 |

## AI 모델 (9개)

| 모델 | 프로바이더 | API |
|------|-----------|-----|
| GPT-5.2 | OpenAI | 프록시 |
| Claude-Sonnet | Anthropic | 프록시 |
| Gemini-3.0-Pro | Google | Vertex AI |
| DeepSeek | DeepSeek | 직접 |
| Mistral | OpenRouter | 직접 |
| GROK-4.1 | OpenRouter | 직접 |
| Kimi-k2 | Groq | 직접 |
| Qwen3-32B | Groq | 직접 |
| MiMo-V2 | OpenRouter | 직접 |

## 코딩 컨벤션

### 파일/폴더 네이밍
- React 컴포넌트: PascalCase (`UserProfile.tsx`)
- 유틸리티/훅: camelCase (`useMarketData.ts`)
- 상수: UPPER_SNAKE_CASE

### 컴포넌트 구조
- 컴포넌트당 하나의 파일
- Props 타입은 컴포넌트 파일 상단에 정의
- 훅은 `src/hooks/`에 분리

### 스타일링
- Tailwind CSS 유틸리티 클래스 사용
- 복잡한 스타일은 `cn()` 함수로 병합
- 애니메이션은 Framer Motion 사용

## 데이터베이스 (Supabase)

### 주요 테이블
- `ai_models` - AI 모델 정보
- `trading_decisions` - 트레이딩 의사결정
- `trade_analyses` - 거래 분석 결과
- `market_data` - 시장 데이터
- `model_winning_patterns` - 학습 패턴

### Realtime 구독
- `trading_decisions` 테이블 변경 감지
- `ai_models` 성과 업데이트 감지

## 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 홈 - AI 모델 경쟁 대시보드 |
| `/live` | 실시간 트레이딩 뷰 |
| `/leaderboard` | 모델 성과 순위표 |
| `/models/[id]` | 개별 모델 상세 |
| `/community` | 커뮤니티 제안/투표 |
| `/garden` | 게이미피케이션 정원 |
| `/shop` | 포인트 상점 |

## 환경 변수

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# n8n
N8N_HOST=
N8N_API_KEY=
```

## 참고 문서

- 세션 로그: `docs/session_*.md`
- 변경 이력: `docs/04-report/changelog.md`
- 워크플로우 스크립트: `workflows/*.js`
