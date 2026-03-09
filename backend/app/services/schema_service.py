from neo4j import Driver

# 노드 레이블 설명 — LLM이 각 레이블의 의미를 이해하도록
NODE_DESCRIPTIONS: dict[str, str] = {
    "Company": "최상위 회사 조직 (예: 데모테크)",
    "Division": "부문 — 회사 바로 아래 최상위 조직 단위 (예: 기술부문, 경영관리부문)",
    "Department": "본부 — 부문 아래 중간 조직 단위 (예: 개발본부, 기술연구센터)",
    "Team": "팀 — 본부 아래 실무 조직 단위 (예: 서버개발팀, 앱개발팀)",
    "Person": "사람 — 직원. name(한글), name_en(영문), title(직함), level(직급) 속성 보유",
}

# 관계 타입 설명 — LLM이 각 관계의 의미와 방향을 이해하도록
RELATIONSHIP_DESCRIPTIONS: dict[str, str] = {
    "PART_OF": "(하위조직)-[:PART_OF]->(상위조직). 조직 계층 구조. Team→Department→Division→Company 순서",
    "BELONGS_TO": "(Person)-[:BELONGS_TO {role}]->(조직). 사람의 조직 소속. role 프로퍼티로 역할 구분 (대표이사, 부문장, 본부장, 팀장, 팀원 등). 겸직자는 BELONGS_TO 관계가 여러 개",
    "REPORTS_TO": "(Person)-[:REPORTS_TO]->(Person). 보고 관계. 팀원→팀장→본부장→부문장→대표이사 순서",
}


class SchemaService:
    def __init__(self, driver: Driver):
        self.driver = driver

    def get_labels(self) -> list[str]:
        """모든 노드 레이블 조회"""
        with self.driver.session() as session:
            result = session.run("CALL db.labels()")
            return [record["label"] for record in result]

    def get_relationship_types(self) -> list[str]:
        """모든 관계 타입 조회"""
        with self.driver.session() as session:
            result = session.run("CALL db.relationshipTypes()")
            return [record["relationshipType"] for record in result]

    def get_node_properties(self) -> dict[str, list[str]]:
        """레이블별 속성 목록 조회"""
        with self.driver.session() as session:
            result = session.run(
                "CALL db.schema.nodeTypeProperties() "
                "YIELD nodeLabels, propertyName "
                "RETURN nodeLabels, collect(DISTINCT propertyName) AS properties"
            )
            props = {}
            for record in result:
                label = record["nodeLabels"][0] if record["nodeLabels"] else "Unknown"
                props[label] = record["properties"]
            return props

    def get_relationship_properties(self) -> dict[str, list[str]]:
        """관계 타입별 속성 목록 조회"""
        with self.driver.session() as session:
            result = session.run(
                "CALL db.schema.relTypeProperties() "
                "YIELD relType, propertyName "
                "RETURN relType, collect(DISTINCT propertyName) AS properties"
            )
            props = {}
            for record in result:
                # relType 형식: ":`TYPE_NAME`" → 정리
                rel_type = record["relType"].strip(":` ")
                props[rel_type] = record["properties"]
            return props

    def get_node_counts(self) -> dict[str, int]:
        """노드 타입별 개수 조회"""
        with self.driver.session() as session:
            result = session.run(
                "MATCH (n) "
                "RETURN labels(n)[0] AS label, count(*) AS count "
                "ORDER BY count DESC"
            )
            return {record["label"]: record["count"] for record in result}

    def get_full_schema_text(self) -> str:
        """LLM에 전달할 전체 스키마 텍스트 생성 (설명 포함)"""
        labels = self.get_labels()
        rel_types = self.get_relationship_types()

        parts: list[str] = []

        # 노드 레이블 + 설명 + 속성
        parts.append("## Node Labels")
        try:
            node_props = self.get_node_properties()
        except Exception:
            node_props = {}

        for label in labels:
            desc = NODE_DESCRIPTIONS.get(label, "")
            props = node_props.get(label, [])
            line = f"- :{label}"
            if desc:
                line += f" — {desc}"
            if props:
                line += f"\n  properties: {', '.join(props)}"
            parts.append(line)

        # 관계 타입 + 설명 + 속성
        parts.append("\n## Relationship Types")
        try:
            rel_props = self.get_relationship_properties()
        except Exception:
            rel_props = {}

        for rel_type in rel_types:
            desc = RELATIONSHIP_DESCRIPTIONS.get(rel_type, "")
            props = rel_props.get(rel_type, [])
            line = f"- :{rel_type}"
            if desc:
                line += f" — {desc}"
            if props:
                line += f"\n  properties: {', '.join(props)}"
            parts.append(line)

        # 관계 패턴 (실제 데이터 기반)
        with self.driver.session() as session:
            try:
                result = session.run(
                    "MATCH (a)-[r]->(b) "
                    "WITH labels(a)[0] AS from_label, type(r) AS rel_type, labels(b)[0] AS to_label "
                    "RETURN DISTINCT from_label, rel_type, to_label LIMIT 50"
                )
                patterns = [
                    f"(:{record['from_label']})-[:{record['rel_type']}]->(:{record['to_label']})"
                    for record in result
                ]
                if patterns:
                    parts.append("\n## Relationship Patterns (실제 존재하는 연결)")
                    for p in patterns:
                        parts.append(f"  {p}")
            except Exception:
                pass

        # 데이터 개요
        parts.append("\n## Data Overview")
        parts.append("조직 계층: Company → Division → Department → Team (PART_OF로 연결)")
        parts.append("사람 소속: Person -[:BELONGS_TO {role}]-> 조직 (겸직 시 BELONGS_TO 관계 다수)")
        parts.append("보고 체계: 팀원 → 팀장 → 본부장 → 부문장 → 대표이사 (REPORTS_TO)")

        return "\n".join(parts)
