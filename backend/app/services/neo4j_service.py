from typing import Any

from neo4j import Driver

from app.schemas.graph import (
    GraphData,
    NodeResponse,
    RelationshipResponse,
)


class Neo4jService:
    def __init__(self, driver: Driver):
        self.driver = driver

    def get_full_graph(self) -> GraphData:
        """전체 그래프 데이터 조회 (시각화용)"""
        with self.driver.session() as session:
            node_result = session.run(
                "MATCH (n) RETURN elementId(n) AS id, labels(n) AS labels, properties(n) AS props"
            )
            nodes = [
                NodeResponse(
                    id=record["id"],
                    label=record["labels"][0] if record["labels"] else "Node",
                    properties=dict(record["props"]),
                )
                for record in node_result
            ]

            rel_result = session.run(
                "MATCH (a)-[r]->(b) "
                "RETURN elementId(r) AS id, type(r) AS type, "
                "elementId(a) AS source, elementId(b) AS target, "
                "properties(r) AS props"
            )
            relationships = [
                RelationshipResponse(
                    id=record["id"],
                    type=record["type"],
                    source_id=record["source"],
                    target_id=record["target"],
                    properties=dict(record["props"]),
                )
                for record in rel_result
            ]

            return GraphData(nodes=nodes, relationships=relationships)

    def create_node(self, label: str, properties: dict[str, Any]) -> NodeResponse:
        """노드 생성"""
        with self.driver.session() as session:
            result = session.run(
                f"CREATE (n:`{_sanitize_label(label)}` $props) "
                "RETURN elementId(n) AS id, labels(n) AS labels, properties(n) AS props",
                props=properties,
            )
            record = result.single()
            return NodeResponse(
                id=record["id"],
                label=record["labels"][0],
                properties=dict(record["props"]),
            )

    def update_node(self, node_id: str, label: str | None, properties: dict[str, Any]) -> NodeResponse:
        """노드 수정 (속성 업데이트, 레이블 변경 시 APOC 필요)"""
        with self.driver.session() as session:
            if label:
                # 기존 레이블 제거 후 새 레이블 설정
                session.run(
                    "MATCH (n) WHERE elementId(n) = $eid "
                    "WITH n, labels(n) AS old_labels "
                    "CALL apoc.create.removeLabels(n, old_labels) YIELD node "
                    f"SET node:`{_sanitize_label(label)}`",
                    eid=node_id,
                )
            result = session.run(
                "MATCH (n) WHERE elementId(n) = $eid "
                "SET n += $props "
                "RETURN elementId(n) AS id, labels(n) AS labels, properties(n) AS props",
                eid=node_id,
                props=properties,
            )
            record = result.single()
            if not record:
                raise ValueError(f"Node {node_id} not found")
            return NodeResponse(
                id=record["id"],
                label=record["labels"][0] if record["labels"] else "Node",
                properties=dict(record["props"]),
            )

    def delete_node(self, node_id: str) -> bool:
        """노드 삭제 (연결된 관계도 함께 삭제)"""
        with self.driver.session() as session:
            result = session.run(
                "MATCH (n) WHERE elementId(n) = $eid DETACH DELETE n RETURN count(*) AS cnt",
                eid=node_id,
            )
            record = result.single()
            return record["cnt"] > 0

    def create_relationship(
        self, source_id: str, target_id: str, rel_type: str, properties: dict[str, Any]
    ) -> RelationshipResponse:
        """관계 생성"""
        with self.driver.session() as session:
            result = session.run(
                "MATCH (a), (b) "
                "WHERE elementId(a) = $src AND elementId(b) = $tgt "
                f"CREATE (a)-[r:`{_sanitize_label(rel_type)}` $props]->(b) "
                "RETURN elementId(r) AS id, type(r) AS type, "
                "elementId(a) AS source, elementId(b) AS target, "
                "properties(r) AS props",
                src=source_id,
                tgt=target_id,
                props=properties,
            )
            record = result.single()
            if not record:
                raise ValueError("Source or target node not found")
            return RelationshipResponse(
                id=record["id"],
                type=record["type"],
                source_id=record["source"],
                target_id=record["target"],
                properties=dict(record["props"]),
            )

    def update_relationship(
        self, rel_id: str, rel_type: str | None, properties: dict[str, Any]
    ) -> RelationshipResponse:
        """관계 수정 (타입 변경 시 삭제 후 재생성)"""
        with self.driver.session() as session:
            if rel_type:
                result = session.run(
                    "MATCH (a)-[r]->(b) WHERE elementId(r) = $eid "
                    "WITH a, b, r, properties(r) AS old_props "
                    "DELETE r "
                    f"CREATE (a)-[nr:`{_sanitize_label(rel_type)}`]->(b) "
                    "SET nr = old_props SET nr += $props "
                    "RETURN elementId(nr) AS id, type(nr) AS type, "
                    "elementId(a) AS source, elementId(b) AS target, "
                    "properties(nr) AS props",
                    eid=rel_id,
                    props=properties,
                )
            else:
                result = session.run(
                    "MATCH (a)-[r]->(b) WHERE elementId(r) = $eid "
                    "SET r += $props "
                    "RETURN elementId(r) AS id, type(r) AS type, "
                    "elementId(a) AS source, elementId(b) AS target, "
                    "properties(r) AS props",
                    eid=rel_id,
                    props=properties,
                )
            record = result.single()
            if not record:
                raise ValueError(f"Relationship {rel_id} not found")
            return RelationshipResponse(
                id=record["id"],
                type=record["type"],
                source_id=record["source"],
                target_id=record["target"],
                properties=dict(record["props"]),
            )

    def delete_relationship(self, rel_id: str) -> bool:
        """관계 삭제"""
        with self.driver.session() as session:
            result = session.run(
                "MATCH ()-[r]->() WHERE elementId(r) = $eid DELETE r RETURN count(*) AS cnt",
                eid=rel_id,
            )
            record = result.single()
            return record["cnt"] > 0

    def clear_all(self) -> dict[str, Any]:
        """전체 노드 및 관계 삭제"""
        with self.driver.session() as session:
            result = session.run("MATCH (n) DETACH DELETE n RETURN count(n) AS cnt")
            record = result.single()
            return {"ok": True, "deleted_nodes": record["cnt"]}

    def run_read_cypher(self, cypher: str) -> list[dict[str, Any]]:
        """읽기 전용 Cypher 실행"""
        with self.driver.session() as session:
            result = session.run(cypher)
            return [_serialize_record(record) for record in result]


def _sanitize_label(label: str) -> str:
    """레이블/타입명에서 위험한 문자 제거"""
    return "".join(c for c in label if c.isalnum() or c == "_")


def _serialize_record(record) -> dict[str, Any]:
    """Neo4j 레코드를 JSON 직렬화 가능한 dict로 변환"""
    data = {}
    for key in record.keys():
        val = record[key]
        if hasattr(val, "items"):
            data[key] = dict(val)
        elif hasattr(val, "__iter__") and not isinstance(val, str):
            data[key] = list(val)
        else:
            data[key] = val
    return data
