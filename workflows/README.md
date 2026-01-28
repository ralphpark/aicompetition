# n8n 워크플로우 백업

## 파일 목록

| 파일명 | 워크플로우 | ID | 상태 |
|--------|-----------|-----|------|
| 00_token_manager.json | 0. TradeLocker Token Manager | 3WFyNJcSs1iDE0Rz | 활성 |
| 01_market_data_collector.json | 1. Market Data Collector | Caw7nQa2w9LAfWyJ | 활성 |
| 02_ai_decision_engine.json | 2. AI Decision Engine | XtBTh8nVgKcFEizV | 활성 |
| 03_virtual_portfolio_manager.json | 3. Virtual Portfolio Manager | uf0rOZGoYuCKhMek | 비활성(호출용) |
| 04_trade_execution.json | 4. Trade Execution | 5bb1OZByz68VWaK8 | 활성 |
| 05_trading_hours_manager.json | 5. Trading Hours Manager | PBNBPJ7Q2n88JgoE | 비활성(호출용) |
| 06_error_alert_system.json | 6. Error Alert System | s90lTAdKG3PBwk39 | 비활성(에러시) |

## 사용 방법

### 로컬에서 수정 후 n8n에 업로드

1. JSON 파일 수정
2. n8n 웹 UI → 워크플로우 열기 → ... 메뉴 → Import from URL/File
3. 또는 Claude Code에서 MCP로 업데이트:
   ```
   n8n_update_full_workflow 사용
   ```

### n8n에서 다운로드

1. n8n 웹 UI → 워크플로우 열기
2. ... 메뉴 → Download
3. 이 폴더에 저장

### 부분 업데이트 (노드 단위)

Claude Code에서 `n8n_update_partial_workflow` 사용:
- addNode, removeNode, updateNode
- addConnection, removeConnection
- enable/disableNode

## 주의사항

- **credentials**: JSON에 포함된 credentials ID는 환경별로 다를 수 있음
- **API 키**: Supabase API 키가 포함되어 있으므로 외부 공유 금지
- **버전 관리**: git으로 변경 이력 관리 권장

## 백업 날짜

2026-01-28
