from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.dependencies import close_neo4j_driver, get_neo4j_driver
from app.routers import chat, graph, schema


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작 시 Neo4j 연결 확인
    driver = get_neo4j_driver()
    driver.verify_connectivity()
    yield
    # 종료 시 연결 해제
    close_neo4j_driver()


app = FastAPI(title="GraphRAG Practice", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graph.router)
app.include_router(schema.router)
app.include_router(chat.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
