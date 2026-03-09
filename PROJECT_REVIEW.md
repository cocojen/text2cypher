# GraphRAG Practice - 프로젝트 종합 평가

> 평가일: 2025년 | 평가 범위: 백엔드, 프론트엔드, 인프라 전체

---

## 1. 프로젝트 개요 및 목적성 평가

### 프로젝트 정체성

| 항목 | 내용 |
|------|------|
| **프로젝트명** | GraphRAG Practice |
| **실제 기능** | Text2Cypher 기반 자연어 → Cypher 변환 및 그래프 시각화 |
| **대상 사용자** | Neo4j 입문자, 그래프 DB 학습자 |
| **핵심 가치** | 자연어로 그래프 DB를 질의하고, 결과를 시각적으로 확인 |

### 목적성 평가: ⭐⭐⭐⭐ (4/5)

**명확한 점:**
- "자연어 → Cypher 쿼리 → 그래프 시각화"라는 파이프라인이 일관되게 구현됨
- 조직도 시드 데이터(40명, 4부문, 5본부, 13팀)로 즉시 체험 가능
- Docker Compose 한 줄로 전체 환경 구동 → 진입 장벽 최소화

**네이밍 괴리 지적:**
- "GraphRAG"라는 이름은 Microsoft의 GraphRAG(지식 그래프 기반 RAG)와 혼동을 줄 수 있음
- 실제 구현은 RAG(Retrieval-Augmented Generation)보다는 **Text2Cypher**(자연어→쿼리 변환)에 가까움
- 벡터 임베딩, 문서 청킹, 리트리벌 파이프라인 등 RAG 핵심 요소가 없음
- 보다 정확한 이름: `neo4j-nl-explorer`, `graph-query-playground` 등

---

## 2. 기술 스택 평가

| 계층 | 기술 | 버전 | 적절성 | 비고 |
|------|------|------|--------|------|
| **백엔드 프레임워크** | FastAPI | 0.129+ | ✅ 우수 | 비동기 지원, 자동 OpenAPI 문서 |
| **그래프 DB** | Neo4j Community | 5.x | ✅ 우수 | 학습 목적에 적합 |
| **LLM (로컬)** | Ollama | 0.6+ | ✅ 우수 | 무료, 오프라인 사용 가능 |
| **LLM (클라우드)** | AWS Bedrock | - | ✅ 좋음 | Claude 모델 지원 |
| **프론트엔드** | React | 19.2 | ✅ 최신 | 최신 버전 활용 |
| **타입 시스템** | TypeScript | 5.9 | ✅ 우수 | strict 모드 활성화 |
| **2D 시각화** | Cytoscape.js | 3.33 | ✅ 우수 | 그래프 시각화 업계 표준 |
| **3D 시각화** | react-force-graph-3d | 1.29 | ✅ 좋음 | Three.js 기반 인터랙티브 |
| **CSS** | Tailwind CSS | 4.2 | ✅ 우수 | 유틸리티 우선 |
| **빌드 도구** | Vite | 7.3 | ✅ 최신 | 빠른 HMR |
| **컨테이너** | Docker Compose | - | ✅ 우수 | 3서비스 오케스트레이션 |
| **패키지 관리** | UV (Python) | - | ✅ 현대적 | 빠른 의존성 해결 |

**이중 LLM 프로바이더 평가:**
- Ollama(로컬) + Bedrock(클라우드) 조합은 유연성이 뛰어남
- 설정 파일 변경만으로 전환 가능 (`LLM_PROVIDER=ollama|bedrock`)
- 단, 프로바이더 추상화가 `if-else` 수준 → 새 프로바이더 추가 시 확장성 제한

---

## 3. 아키텍처 평가

### 3.1 백엔드 아키텍처: 3계층 구조

```
routers/          → API 엔드포인트 (chat, graph, schema)
  ↓
services/         → 비즈니스 로직 (chat_service, neo4j_service, llm_client)
  ↓
prompts/schemas/  → 프롬프트 템플릿 + Pydantic 스키마
```

**평가: ⭐⭐⭐⭐ (4/5)**
- 관심사 분리가 명확함
- 각 라우터가 단일 서비스에 의존하는 깔끔한 구조
- 프롬프트를 별도 모듈로 관리하여 유지보수 용이
- 약 843줄의 간결한 코드 — 학습 목적에 적합한 규모

### 3.2 프론트엔드 아키텍처: Custom Hook 패턴

```
App.tsx           → 상태 관리 허브 (useState 10개)
  ├── components/ → UI 컴포넌트 (chat, graph, schema, common)
  ├── hooks/      → 비즈니스 로직 (useGraph, useChat)
  ├── api/        → 백엔드 통신 계층 (axios)
  └── types/      → TypeScript 인터페이스
```

**평가: ⭐⭐⭐⭐ (4/5)**
- 커스텀 훅으로 데이터 로직 분리
- API 계층이 독립적으로 존재
- 타입 정의가 체계적

### 3.3 인프라 아키텍처: Docker Compose

```
docker-compose.yml
  ├── neo4j       → 그래프 DB (7474, 7687)
  ├── backend     → FastAPI (8000)
  └── frontend    → React + Nginx (3000)
```

**평가: ⭐⭐⭐⭐⭐ (5/5)**
- 헬스체크 설정 포함
- 볼륨 관리로 데이터 영속성 보장
- 멀티스테이지 빌드로 프론트엔드 이미지 경량화
- `docker compose up` 한 줄로 전체 환경 구동

---

## 4. 코드 품질 평가

### 4.1 백엔드 코드 품질

#### 장점
| 항목 | 설명 | 위치 |
|------|------|------|
| **입력 살균** | `_sanitize_label()`로 레이블명에서 위험 문자 제거 | `services/neo4j_service.py` |
| **Pydantic 스키마** | 요청/응답 모델 타입 검증 | `schemas/` |
| **프롬프트 품질** | 7개 Few-shot 예시, 전략별 쿼리 가이드 | `prompts/text2cypher.py` |
| **답변 생성 구조** | 질문 유형별(조회/추천/집계) 응답 가이드 | `prompts/answer_generation.py` |
| **LLM thinking 태그 제거** | CoT 모델(Qwen3 등)의 `<think>` 태그 정리 | `services/chat_service.py` |
| **Lazy 초기화** | Bedrock 미사용 시 AWS SDK 미로드 | `services/llm_client.py` |
| **설정 관리** | Pydantic Settings + .env 지원 | `config.py` |

#### 약점
| 항목 | 심각도 | 설명 | 위치 |
|------|--------|------|------|
| **테스트 0개** | 🔴 | 단위/통합 테스트 전무 | 프로젝트 전체 |
| **로깅 없음** | 🔴 | structlog 등 로깅 프레임워크 미적용 | 전체 서비스 |
| **Exception 광범위 catch** | 🟠 | `except Exception as e`로 모든 에러 동일 처리 | `routers/chat.py` |
| **타임아웃 미설정** | 🟠 | Ollama, Bedrock, Neo4j 호출에 타임아웃 없음 | `services/llm_client.py` |
| **에러 메시지 노출** | 🟠 | `detail=str(e)`로 내부 에러 직접 반환 | `routers/chat.py` |
| **기본 비밀번호 하드코딩** | 🟡 | `neo4j_password: str = "graphrag123"` | `config.py` |
| **LLM 설정 하드코딩** | 🟡 | temperature, max_tokens 값이 코드에 고정 | `services/chat_service.py` |

### 4.2 프론트엔드 코드 품질

#### 장점
| 항목 | 설명 | 위치 |
|------|------|------|
| **strict TypeScript** | `strict: true`, `noUnusedLocals`, `noUnusedParameters` | `tsconfig.app.json` |
| **컴포넌트 설계** | 기능별 디렉토리 분리 (chat, graph, schema, common) | `src/components/` |
| **2D/3D 시각화** | Cytoscape.js + react-force-graph-3d 이중 뷰 | `GraphCanvas.tsx`, `GraphCanvas3D.tsx` |
| **Custom Hook 패턴** | `useGraph`, `useChat`으로 로직 분리 | `src/hooks/` |
| **API 계층 분리** | axios 기반 독립 API 모듈 | `src/api/` |
| **메모이제이션** | `useMemo`, `useCallback`, `useRef` 적절히 활용 | 컴포넌트 전반 |
| **다중 레이아웃** | cose-bilkent, circle, grid, concentric, breadthfirst | `GraphToolbar.tsx` |

#### 약점
| 항목 | 심각도 | 설명 | 위치 |
|------|--------|------|------|
| **테스트 0개** | 🔴 | Vitest/Jest 미설정, 테스트 파일 없음 | 프로젝트 전체 |
| **App.tsx 상태 과다** | 🟠 | useState 10개가 최상위에 집중 | `App.tsx` |
| **에러 처리 미흡** | 🟠 | `alert()` 사용, Error Boundary 없음 | 컴포넌트 전반 |
| **반응형 부족** | 🟡 | 모바일(<640px) 레이아웃 미고려, 터치 이벤트 미지원 | 전체 UI |
| **접근성(a11y) 부재** | 🟡 | aria-label 미사용, focus trap 없음, 키보드 탐색 미흡 | 다이얼로그, 그래프 캔버스 |
| **에러 바운더리 없음** | 🟡 | React 에러 캐칭 미구현 | 전체 |

---

## 5. 보안 평가

### 기본 방어 (구현됨)

| 방어 수단 | 구현 | 위치 |
|----------|------|------|
| 레이블 살균 | `_sanitize_label()` — 알파벳/숫자/언더스코어만 허용 | `neo4j_service.py` |
| 입력 검증 | Pydantic BaseModel로 요청 바디 타입 체크 | `schemas/` |
| CORS 설정 | 특정 origin만 허용 (`localhost:5173`, `localhost:3000`) | `main.py` |
| 쿼리 매개변수화 | Neo4j 드라이버의 파라미터 바인딩 사용 | `neo4j_service.py` |

### 보안 위험

| 위험 | 심각도 | 설명 | 위치 |
|------|--------|------|------|
| **Cypher 쓰기 차단 없음** | 🔴 심각 | `run_read_cypher()`가 CREATE/DELETE/SET 등 쓰기 키워드를 검증하지 않음. LLM이 생성한 Cypher가 데이터를 변경할 수 있음 | `neo4j_service.py`, `chat_service.py` |
| **인증 전무** | 🔴 심각 | 모든 API 엔드포인트가 인증 없이 접근 가능 | 전체 라우터 |
| **DELETE /all 무방비** | 🔴 심각 | `DELETE /api/graph/all` — 권한 검사 없이 전체 데이터 삭제 가능 | `routers/graph.py` |
| **POST /seed 무방비** | 🟠 높음 | `POST /api/graph/seed` — 누구나 시드 데이터 주입 가능 | `routers/graph.py` |
| **에러 메시지 정보 유출** | 🟠 높음 | `HTTPException(detail=str(e))` — 스택 트레이스 포함 가능 | `routers/chat.py` |
| **Rate Limiting 없음** | 🟡 중간 | API 남용(LLM 과다 호출) 방지 기능 없음 | 전체 |

---

## 6. 오픈소스 준비도

| 항목 | 상태 | 비고 |
|------|------|------|
| LICENSE (MIT) | ✅ | 표준 MIT 라이선스 |
| README.md | ✅ | 아키텍처, 설치 가이드, 기술 스택 포함 |
| .env.example | ✅ | Ollama/Bedrock 설정 예시 |
| .gitignore | ✅ | .env, node_modules, __pycache__ 등 |
| Docker Compose | ✅ | 3서비스 완전 구성 |
| Dockerfile (BE) | ✅ | Python 3.11-slim + UV |
| Dockerfile (FE) | ✅ | 멀티스테이지 빌드 + Nginx |
| 시드 데이터 | ✅ | 40명 가상 조직도 |
| CONTRIBUTING.md | ❌ | 기여 가이드라인 없음 |
| CODE_OF_CONDUCT.md | ❌ | 행동 강령 없음 |
| CI/CD (GitHub Actions) | ❌ | 자동 테스트/빌드 파이프라인 없음 |
| 테스트 코드 | ❌ | 백엔드/프론트엔드 모두 0% |
| 스크린샷/데모 | ❌ | README에 참조만 있고 실제 이미지 없음 |
| CHANGELOG.md | ❌ | 버전 관리 문서 없음 |
| SECURITY.md | ❌ | 보안 취약점 보고 절차 없음 |
| API 문서 | ⚠️ | FastAPI 자동 생성 Swagger만 존재, 별도 문서 없음 |

---

## 7. 부족한 점 요약 (5가지 핵심)

### 1. 테스트 부재 — 신뢰도의 근본적 결함
백엔드·프론트엔드 모두 **테스트 코드가 0개**. 단위 테스트, 통합 테스트, E2E 테스트 모두 없음. 오픈소스 프로젝트의 신뢰 기반이 되는 테스트 커버리지가 전무하여, 기여자가 변경 후 회귀를 검증할 수 없음.

### 2. 보안 기초 미비 — 인증·인가 전무
모든 API가 인증 없이 노출되어 있으며, 특히 `DELETE /api/graph/all`은 전체 데이터를 삭제하는 파괴적 엔드포인트임에도 권한 검사가 없음. LLM이 생성한 Cypher에 대한 쓰기 작업 검증도 없어, 자연어 질문을 통한 의도치 않은 데이터 변경 가능성 존재.

### 3. 에러 처리·로깅 체계 부재
`except Exception as e`로 모든 에러를 동일하게 처리하고, 로깅 프레임워크가 없어 운영 중 문제 추적 불가. 프론트엔드는 `alert()`로 에러를 표시하며 Error Boundary도 없음. 외부 서비스(LLM, Neo4j) 호출에 타임아웃이 설정되지 않아 무한 대기 가능.

### 4. "GraphRAG" 네이밍과 실제 기능의 괴리
프로젝트명이 "GraphRAG"이지만, 실제로는 RAG(검색 증강 생성)의 핵심 요소인 벡터 임베딩, 문서 청킹, 리트리벌 파이프라인이 없음. 구현된 기능은 Text2Cypher(자연어→쿼리 변환)로, 네이밍이 사용자에게 오해를 줄 수 있음.

### 5. 커뮤니티·기여 인프라 부재
CONTRIBUTING.md, CODE_OF_CONDUCT.md, Issue/PR 템플릿, CI/CD 파이프라인이 모두 없음. README에 참조된 스크린샷도 실제 파일이 존재하지 않음. 외부 기여자가 프로젝트에 참여하기 위한 기본 인프라가 갖춰지지 않음.

---

## 8. 개선 권장사항

### P0 — 즉시 수정 (보안·안정성)

| # | 항목 | 설명 |
|---|------|------|
| 1 | **Cypher 쓰기 차단** | `chat_service.py`에서 LLM 생성 Cypher에 `CREATE`, `DELETE`, `SET`, `MERGE`, `REMOVE`, `DROP` 키워드가 포함되면 실행 차단 |
| 2 | **파괴적 API 보호** | `DELETE /api/graph/all`, `POST /api/graph/seed`에 최소한의 인증(API Key 등) 추가 |
| 3 | **에러 메시지 정제** | 프로덕션 환경에서 `str(e)` 대신 일반화된 에러 메시지 반환, 상세 에러는 로그에만 기록 |
| 4 | **LLM 호출 타임아웃** | Ollama/Bedrock 호출에 30초 타임아웃 설정 |

### P1 — 단기 개선 (코드 품질)

| # | 항목 | 설명 |
|---|------|------|
| 5 | **로깅 시스템 도입** | `structlog` 또는 Python 기본 `logging`으로 요청/응답/에러 추적 |
| 6 | **백엔드 테스트 작성** | pytest 기반 단위 테스트 — 최소 핵심 서비스(chat_service, neo4j_service) 커버 |
| 7 | **프론트엔드 테스트 작성** | Vitest + React Testing Library로 커스텀 훅·주요 컴포넌트 테스트 |
| 8 | **에러 처리 표준화** | 커스텀 예외 클래스 정의, HTTP 상태 코드 구체화 (400/502/503 등 구분) |
| 9 | **App.tsx 상태 분리** | Context API 또는 Zustand로 상태 분산, Props drilling 감소 |

### P2 — 중기 개선 (오픈소스 준비)

| # | 항목 | 설명 |
|---|------|------|
| 10 | **스크린샷 추가** | `docs/screenshots/`에 실제 UI 캡처 4종 추가 |
| 11 | **CONTRIBUTING.md 작성** | PR 프로세스, 코드 스타일, 커밋 컨벤션 문서화 |
| 12 | **GitHub Actions 구성** | PR 시 자동 린트·테스트·빌드 실행 |
| 13 | **프로젝트명 재고** | "GraphRAG" → 실제 기능을 반영하는 이름으로 변경 검토 |
| 14 | **Rate Limiting 도입** | FastAPI 미들웨어로 API 호출 빈도 제한 |

### P3 — 장기 개선 (기능·UX)

| # | 항목 | 설명 |
|---|------|------|
| 15 | **반응형 디자인** | 모바일/태블릿 레이아웃 대응, 터치 이벤트 지원 |
| 16 | **접근성(a11y)** | aria-label, focus trap, 키보드 내비게이션, 스크린 리더 지원 |
| 17 | **대규모 그래프 대응** | 페이지네이션, 가상 스크롤링, 노드 수 제한 경고 |
| 18 | **프롬프트 검증 프레임워크** | Few-shot 예시의 정확도 자동 평가 |
| 19 | **LLM 프로바이더 확장** | OpenAI, Google Gemini 등 추가 프로바이더 지원 |

---

## 9. 종합 점수표

| 평가 영역 | 점수 (10점) | 근거 |
|----------|:-----------:|------|
| **목적성·방향성** | 8 | 학습 도구로서 명확한 목표, 네이밍 괴리 감점 |
| **기술 스택 선정** | 9 | 최신·적절한 기술 조합, 이중 LLM 유연성 |
| **아키텍처 설계** | 8 | 3계층 분리 명확, 프론트엔드 Hook 패턴 우수 |
| **백엔드 코드 품질** | 6 | 프롬프트·스키마 우수, 에러 처리·로깅 미흡 |
| **프론트엔드 코드 품질** | 7 | strict TS·컴포넌트 설계 우수, 상태 관리·에러 처리 보완 필요 |
| **보안** | 4 | 기본 살균 존재, 인증·쓰기 차단 전무 |
| **테스트** | 1 | 백엔드·프론트엔드 모두 테스트 0개 |
| **인프라·DevOps** | 8 | Docker Compose 완성도 높음, CI/CD 부재 |
| **문서화** | 7 | README 우수, 기여 가이드·스크린샷 부재 |
| **오픈소스 준비도** | 5 | LICENSE·README는 갖춤, 커뮤니티 인프라 미비 |

### 종합: 6.3 / 10

> **학습용 프로젝트로서는 우수 (8/10)**하나, **오픈소스 공개 프로젝트로서는 보완 필요 (5/10)**.
> P0~P1 항목을 해결하면 7.5+, P2까지 해결하면 8.5+ 수준으로 격상 가능.

---

## 부록: 근거 파일 목록

| 평가 항목 | 근거 파일 |
|-----------|-----------|
| Cypher 인젝션 방어 | `backend/app/services/neo4j_service.py` (`_sanitize_label`) |
| 프롬프트 품질 | `backend/app/prompts/text2cypher.py` (7개 Few-shot) |
| 답변 생성 구조 | `backend/app/prompts/answer_generation.py` |
| LLM 타임아웃 부재 | `backend/app/services/llm_client.py` |
| Cypher 쓰기 미차단 | `backend/app/services/neo4j_service.py` (`run_read_cypher`) |
| 파괴적 API 무방비 | `backend/app/routers/graph.py` (`DELETE /all`) |
| 에러 처리 미흡 | `backend/app/routers/chat.py` |
| 설정 하드코딩 | `backend/app/config.py` |
| 프론트엔드 상태 과다 | `frontend/src/App.tsx` (useState 10개) |
| TypeScript strict 모드 | `frontend/tsconfig.app.json` |
| Docker 구성 | `docker-compose.yml` |
| 오픈소스 기본 문서 | `LICENSE`, `README.md`, `.env.example` |
