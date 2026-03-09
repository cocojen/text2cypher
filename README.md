# GraphRAG Practice

**그래프 데이터베이스(Neo4j)가 처음이신가요?** 이 프로젝트와 함께 Labeled Property Graph의 핵심 개념을 직접 만져보며 익혀보세요.

가상 기업의 조직도 데이터를 Neo4j에 넣고, 자연어로 질문하면 LLM이 Cypher 쿼리를 자동 생성해서 답변합니다. 그래프 시각화, 노드/관계 편집까지 한 화면에서 체험할 수 있습니다.

### 이런 질문을 해볼 수 있어요

- "서버개발팀에 누가 있어?"
- "김철수의 보고 라인을 보여줘"
- "기술부문 소속 팀 목록 알려줘"
- "CTO에게 보고하는 사람은 누구야?"

## Architecture

```
┌─────────────┐     HTTP      ┌─────────────────┐     Bolt      ┌──────────┐
│   React     │  ──────────►  │    FastAPI       │  ──────────►  │  Neo4j   │
│  Cytoscape  │  ◄──────────  │  (Text2Cypher)   │  ◄──────────  │  Graph   │
└─────────────┘    JSON       └────────┬────────┘    Cypher     └──────────┘
  :3000                                │
                                       │ API Call
                                       ▼
                              ┌─────────────────┐
                              │   LLM Provider   │
                              │ ┌─────┐ ┌─────┐ │
                              │ │Ollama│ │ AWS │ │
                              │ │Local │ │ BR  │ │
                              │ └─────┘ └─────┘ │
                              └─────────────────┘
```

**Flow:** 자연어 질문 → LLM이 Cypher 생성 → Neo4j 실행 → LLM이 결과를 자연어로 변환

## Tech Stack

| Layer | Technology | Description |
|-------|-----------|-------------|
| **Frontend** | React 19 + TypeScript | UI 프레임워크 |
| **Graph Visualization** | Cytoscape.js | 인터랙티브 그래프 렌더링 |
| **Styling** | Tailwind CSS 4 | 유틸리티 기반 스타일링 |
| **Bundler** | Vite 7 | 빌드 및 개발 서버 |
| **Backend** | FastAPI | REST API 서버 |
| **Database** | Neo4j 5 Community | 그래프 데이터베이스 |
| **LLM (Option A)** | Ollama | 로컬 LLM (qwen3-coder 등) |
| **LLM (Option B)** | AWS Bedrock | Claude Sonnet |
| **Package Manager** | uv / npm | Python / Node.js 의존성 관리 |

## Prerequisites

시작하기 전에 다음 도구가 설치되어 있어야 합니다:

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — Neo4j, 백엔드, 프론트엔드를 한 번에 실행
- **[Ollama](https://ollama.com/)** — 로컬 LLM 실행 (기본 LLM 프로바이더)

> AWS Bedrock을 사용하는 경우 Ollama 대신 AWS CLI 인증 설정이 필요합니다.

## Quick Start (Docker 권장)

> **Docker 사용을 권장합니다.** Neo4j 설치나 환경 설정 없이 한 줄로 전체 스택을 실행할 수 있습니다.

### 1. 환경 변수 설정

```bash
cp .env.example .env
# 필요 시 .env 파일을 수정합니다 (LLM 프로바이더 등)
```

### 2. Ollama 모델 다운로드

```bash
ollama pull qwen3-coder:30b
```

> Ollama가 실행 중이어야 합니다. AWS Bedrock을 사용하는 경우 이 단계를 건너뛰세요.

### 3. 실행

```bash
docker compose up -d
```

3개 서비스가 시작됩니다:

| 서비스 | URL | 설명 |
|--------|-----|------|
| **Frontend** | http://localhost:3000 | 웹 UI |
| **Backend** | http://localhost:8000 | FastAPI 서버 |
| **Neo4j Browser** | http://localhost:7474 | 그래프 DB 관리 (neo4j / graphrag123) |

### 4. 시드 데이터 삽입

```bash
docker compose exec backend uv run seed.py
```

이제 http://localhost:3000 에서 자연어로 질문할 수 있습니다.

## LLM Provider 설정

`.env` 파일의 `LLM_PROVIDER` 값으로 사용할 LLM을 선택합니다. `ollama` 또는 `bedrock` 중 하나를 지정하세요.

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `LLM_PROVIDER` | LLM 프로바이더 선택 (`ollama` / `bedrock`) | `ollama` |

### Ollama (로컬, 기본값)

로컬에서 무료로 LLM을 실행합니다. GPU가 있으면 빠르게 동작합니다.

**1) Ollama 설치 및 모델 다운로드**

```bash
ollama pull qwen3-coder:30b
```

**2) `.env` 설정**

```bash
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3-coder:30b
```

> **Docker 사용 시:** `OLLAMA_BASE_URL`을 `http://host.docker.internal:11434`로 변경해야 합니다. Docker 컨테이너 내부에서 호스트의 Ollama에 접근하기 위한 설정입니다. (`docker compose up`으로 실행하면 `docker-compose.yml`에서 자동으로 오버라이드되므로 `.env`는 수정하지 않아도 됩니다.)

### AWS Bedrock

AWS의 관리형 LLM 서비스를 사용합니다. 별도 GPU 없이도 Claude 등 고성능 모델을 사용할 수 있습니다.

**1) AWS CLI 인증 설정**

```bash
aws configure
# 또는 환경 변수: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
```

**2) `.env` 설정**

```bash
LLM_PROVIDER=bedrock
AWS_REGION=ap-northeast-2
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-20250514-v1:0
```

## 개발 환경 (Docker 없이)

Docker 없이 직접 실행하려면:

```bash
# Neo4j
docker compose up neo4j -d

# 백엔드
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000

# 시드 데이터
uv run seed.py

# 프론트엔드 (별도 터미널)
cd frontend
npm install
npm run dev    # http://localhost:5173
```

## Seed Data

시드 스크립트가 가상 기업 **데모테크**의 조직도 그래프를 생성합니다 (40명, 4부문, 5본부, 13팀).

```
Company (데모테크)
├── Division (기술부문, 서비스부문, 경영관리부문, 컴플라이언스부문)
│   └── Department (개발본부, 기술연구센터, 서비스운영본부, ...)
│       └── Team (서버개발팀, 앱개발팀, 프로덕트팀, ...)
│           └── Person (40명)
│               ├── ─[:BELONGS_TO {role}]─► Team / Department / Division / Company
│               └── ─[:REPORTS_TO]─► Person (상위자)
```

## Features

- **자연어 질의** — 한국어/영어로 질문하면 Cypher를 자동 생성하여 답변
- **Cypher 직접 실행** — Cypher 쿼리를 직접 입력하여 실행
- **그래프 시각화** — Cytoscape.js 기반 인터랙티브 그래프 렌더링
- **노드/관계 CRUD** — UI에서 직접 그래프 데이터 추가·수정·삭제
- **스키마 탐색** — 현재 그래프의 노드 레이블, 관계 타입, 속성 조회
- **쿼리 결과 하이라이트** — 챗봇 결과에 해당하는 노드를 그래프에서 강조
- **분할 화면** — 그래프 + 챗봇을 동시에 보는 Split View 지원

<!-- 스크린샷: 아래 이미지 경로에 캡처를 넣으면 README에 표시됩니다 -->
<!-- 예: 그래프 시각화 화면, 챗봇 질의 화면, 스키마 탐색 화면 등 -->

| 그래프 시각화 | 자연어 챗봇 |
|:---:|:---:|
| ![그래프 시각화](docs/screenshots/graph-view.png) | ![챗봇 화면](docs/screenshots/chat-view.png) |

| 스키마 탐색 | 분할 화면 |
|:---:|:---:|
| ![스키마 탐색](docs/screenshots/schema-view.png) | ![분할 화면](docs/screenshots/split-view.png) |

## License

MIT
