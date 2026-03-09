from fastapi import APIRouter, HTTPException

from app.dependencies import get_neo4j_driver
from app.schemas.graph import (
    GraphData,
    NodeCreate,
    NodeResponse,
    NodeUpdate,
    RelationshipCreate,
    RelationshipResponse,
    RelationshipUpdate,
)
from app.services.neo4j_service import Neo4jService

router = APIRouter(prefix="/api/graph", tags=["graph"])


def _get_service() -> Neo4jService:
    return Neo4jService(get_neo4j_driver())


@router.get("/data", response_model=GraphData)
def get_graph_data():
    """전체 그래프 조회 (시각화용)"""
    return _get_service().get_full_graph()


@router.post("/nodes", response_model=NodeResponse, status_code=201)
def create_node(body: NodeCreate):
    """노드 생성"""
    return _get_service().create_node(body.label, body.properties)


@router.put("/nodes/{node_id}", response_model=NodeResponse)
def update_node(node_id: str, body: NodeUpdate):
    """노드 수정"""
    try:
        return _get_service().update_node(node_id, body.label, body.properties)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/nodes/{node_id}")
def delete_node(node_id: str):
    """노드 삭제"""
    deleted = _get_service().delete_node(node_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
    return {"ok": True}


@router.post("/relationships", response_model=RelationshipResponse, status_code=201)
def create_relationship(body: RelationshipCreate):
    """관계 생성"""
    try:
        return _get_service().create_relationship(
            body.source_id, body.target_id, body.type, body.properties
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/relationships/{rel_id}", response_model=RelationshipResponse)
def update_relationship(rel_id: str, body: RelationshipUpdate):
    """관계 수정"""
    try:
        return _get_service().update_relationship(rel_id, body.type, body.properties)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/relationships/{rel_id}")
def delete_relationship(rel_id: str):
    """관계 삭제"""
    deleted = _get_service().delete_relationship(rel_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Relationship {rel_id} not found")
    return {"ok": True}


@router.delete("/all")
def clear_all():
    """전체 노드 및 관계 삭제"""
    return _get_service().clear_all()


@router.post("/seed")
def seed_data():
    """시드 데이터 삽입"""
    from seed import seed

    result = seed(get_neo4j_driver())
    return {"ok": True, "nodes": result["nodes"], "relationships": result["relationships"]}
