from fastapi import APIRouter, HTTPException

from app.dependencies import get_neo4j_driver
from app.schemas.chat import ChatRequest, ChatResponse, CypherRequest, CypherResponse
from app.services.chat_service import ChatService
from app.services.neo4j_service import Neo4jService

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/ask", response_model=ChatResponse)
def ask(body: ChatRequest):
    """자연어 질의 → Cypher 생성 → 실행 → 자연어 응답"""
    service = ChatService(get_neo4j_driver())
    try:
        return service.ask(body.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cypher", response_model=CypherResponse)
def run_cypher(body: CypherRequest):
    """Cypher 직접 실행 (읽기 전용)"""
    neo4j_service = Neo4jService(get_neo4j_driver())
    try:
        results = neo4j_service.run_read_cypher(body.cypher)
        return CypherResponse(cypher=body.cypher, results=results)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
