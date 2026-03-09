from fastapi import APIRouter

from app.dependencies import get_neo4j_driver
from app.services.schema_service import SchemaService

router = APIRouter(prefix="/api/schema", tags=["schema"])


def _get_service() -> SchemaService:
    return SchemaService(get_neo4j_driver())


@router.get("/labels")
def get_labels():
    """노드 레이블 목록"""
    return {"labels": _get_service().get_labels()}


@router.get("/relationship-types")
def get_relationship_types():
    """관계 타입 목록"""
    return {"types": _get_service().get_relationship_types()}


@router.get("/node-details")
def get_node_details():
    """노드 타입별 개수 + 속성"""
    svc = _get_service()
    return {
        "counts": svc.get_node_counts(),
        "properties": svc.get_node_properties(),
    }


@router.get("/relationship-details")
def get_relationship_details():
    """관계 타입 + 속성"""
    svc = _get_service()
    return {
        "types": svc.get_relationship_types(),
        "properties": svc.get_relationship_properties(),
    }


@router.get("/full")
def get_full_schema():
    """전체 스키마 텍스트 (LLM 프롬프트용)"""
    return {"schema": _get_service().get_full_schema_text()}


@router.get("/full-details")
def get_full_details():
    """스키마 전체 상세 (프론트엔드 시각화용)"""
    svc = _get_service()
    counts = svc.get_node_counts()
    node_props = {}
    try:
        node_props = svc.get_node_properties()
    except Exception:
        pass

    rel_types = svc.get_relationship_types()
    rel_props = {}
    try:
        rel_props = svc.get_relationship_properties()
    except Exception:
        pass

    # 관계 패턴 + 건수
    patterns = []
    driver = get_neo4j_driver()
    with driver.session() as session:
        try:
            result = session.run(
                "MATCH (a)-[r]->(b) "
                "WITH labels(a)[0] AS from_label, type(r) AS rel_type, labels(b)[0] AS to_label "
                "RETURN from_label, rel_type, to_label, count(*) AS count "
                "ORDER BY count DESC"
            )
            patterns = [
                {
                    "from_label": record["from_label"],
                    "rel_type": record["rel_type"],
                    "to_label": record["to_label"],
                    "count": record["count"],
                }
                for record in result
            ]
        except Exception:
            pass

    total_nodes = sum(counts.values())
    total_rels = sum(p["count"] for p in patterns)

    return {
        "summary": {
            "total_nodes": total_nodes,
            "total_relationships": total_rels,
            "node_type_count": len(counts),
            "relationship_type_count": len(rel_types),
        },
        "node_types": {
            "counts": counts,
            "properties": node_props,
        },
        "relationship_types": {
            "types": rel_types,
            "properties": rel_props,
        },
        "relationship_patterns": patterns,
    }
