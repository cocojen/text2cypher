"""주식/금융 그래프 추가 시드 — 실제 기업 기반 소규모 데모

원자재 → 기업 → 자회사 → 투자사로 이어지는 이종(異種) 다단계 관계를 그래프로
표현한다. "금값 상승 → 금광/제련사 → 자회사 → 그 자회사에 투자한 곳"처럼
SQL의 재귀 CTE로는 다루기 힘든 영향 전파·최단 경로 질문을 보여주기 위한 데이터.

⚠️ 투자/지분 관계는 대체로 공개 정보 기반이지만, stake(지분%)와 impact(영향 방향)
   값은 데모용 예시값이며 투자 조언이 아니다.

기존 시드(데모테크 조직도, IT개발부)와 섞이지 않도록 전용 라벨을 사용한다.
  노드 라벨: Commodity, Corp, Fund, Sector, Country
  관계 타입: AFFECTS, OWNS, INVESTS_IN, SUPPLIES, IN_SECTOR, LISTED_IN

실행 방법:
  docker compose exec backend uv run seed_stocks.py   # CLI
  POST /api/graph/seed-stocks                          # API (프론트엔드 버튼)
"""

from neo4j import Driver

# 이 시드가 관리하는 라벨 (재실행 시 이 라벨들만 삭제 → 다른 데이터 보존)
LABELS = ["Commodity", "Corp", "Fund", "Sector", "Country"]

SECTORS = ["금·비철금속", "반도체", "2차전지", "배터리소재", "철강", "완성차", "정유"]
COUNTRIES = ["한국", "미국", "캐나다", "대만"]
COMMODITIES = ["금", "구리", "니켈", "리튬", "원유"]

# 기업: (이름, 업종, 상장국)
CORPS = [
    ("Barrick Gold", "금·비철금속", "캐나다"),
    ("Newmont", "금·비철금속", "미국"),
    ("고려아연", "금·비철금속", "한국"),
    ("영풍", "금·비철금속", "한국"),
    ("켐코", "배터리소재", "한국"),          # 고려아연 자회사 (황산니켈)
    ("삼성전자", "반도체", "한국"),
    ("삼성디스플레이", "반도체", "한국"),      # 삼성전자 자회사
    ("SK하이닉스", "반도체", "한국"),
    ("SK스퀘어", "반도체", "한국"),          # SK하이닉스 지주
    ("TSMC", "반도체", "대만"),
    ("LG에너지솔루션", "2차전지", "한국"),
    ("삼성SDI", "2차전지", "한국"),
    ("포스코홀딩스", "철강", "한국"),         # 지주
    ("포스코퓨처엠", "배터리소재", "한국"),
    ("에코프로", "배터리소재", "한국"),        # 지주격
    ("에코프로비엠", "배터리소재", "한국"),
    ("현대차", "완성차", "한국"),
    ("기아", "완성차", "한국"),
    ("SK이노베이션", "정유", "한국"),
    ("S-Oil", "정유", "한국"),
]

# 투자사/펀드: (이름, 국가)
FUNDS = [
    ("국민연금", "한국"),
    ("BlackRock", "미국"),
    ("Vanguard", "미국"),
    ("미래에셋자산운용", "한국"),
    ("한국투자신탁운용", "한국"),
]

# 원자재 → 기업 영향: (원자재, 기업, 방향)  '+' 수혜 / '-' 원가부담 등 악재
AFFECTS = [
    ("금", "Barrick Gold", "+"),
    ("금", "Newmont", "+"),
    ("금", "고려아연", "+"),
    ("구리", "고려아연", "+"),
    ("니켈", "켐코", "+"),
    ("니켈", "LG에너지솔루션", "-"),
    ("니켈", "삼성SDI", "-"),
    ("리튬", "포스코홀딩스", "+"),
    ("리튬", "에코프로비엠", "-"),
    ("원유", "SK이노베이션", "+"),
    ("원유", "S-Oil", "+"),
    ("원유", "현대차", "-"),
]

# 모회사 → 자회사 지분: (모회사, 자회사, 지분%)  ※ 지분값은 예시
OWNS = [
    ("삼성전자", "삼성디스플레이", 85),
    ("포스코홀딩스", "포스코퓨처엠", 59),
    ("에코프로", "에코프로비엠", 45),
    ("현대차", "기아", 34),
    ("고려아연", "켐코", 35),
    ("SK스퀘어", "SK하이닉스", 20),
    ("영풍", "고려아연", 25),
]

# 펀드 → 기업 투자: (펀드, 기업)
INVESTS_IN = [
    ("국민연금", "삼성전자"),
    ("국민연금", "SK하이닉스"),
    ("국민연금", "포스코홀딩스"),
    ("국민연금", "현대차"),
    ("국민연금", "기아"),
    ("국민연금", "고려아연"),
    ("국민연금", "LG에너지솔루션"),
    ("BlackRock", "삼성전자"),
    ("BlackRock", "TSMC"),
    ("BlackRock", "Newmont"),
    ("BlackRock", "Barrick Gold"),
    ("Vanguard", "Newmont"),
    ("Vanguard", "Barrick Gold"),
    ("Vanguard", "삼성전자"),
    ("Vanguard", "TSMC"),
    ("미래에셋자산운용", "에코프로비엠"),
    ("미래에셋자산운용", "포스코퓨처엠"),
    ("미래에셋자산운용", "삼성SDI"),
    ("한국투자신탁운용", "고려아연"),
    ("한국투자신탁운용", "켐코"),
]

# 공급 관계: (공급사, 고객사, 품목)
SUPPLIES = [
    ("포스코퓨처엠", "LG에너지솔루션", "양극재"),
    ("에코프로비엠", "삼성SDI", "양극재"),
    ("켐코", "LG에너지솔루션", "황산니켈"),
    ("LG에너지솔루션", "현대차", "배터리"),
    ("삼성SDI", "현대차", "배터리"),
    ("삼성디스플레이", "삼성전자", "디스플레이 패널"),
]


def seed_stocks(driver: Driver) -> dict[str, int]:
    """주식/금융 그래프를 삽입·갱신한다 (다른 시드 데이터는 보존)."""
    with driver.session() as session:
        # 1. 기존 금융 서브그래프만 제거 (전용 라벨 기준)
        label_pred = " OR ".join(f"n:{lbl}" for lbl in LABELS)
        session.run(f"MATCH (n) WHERE {label_pred} DETACH DELETE n")

        # 2. 기본 노드 생성
        session.run("UNWIND $names AS nm CREATE (:Sector {name: nm})", names=SECTORS)
        session.run("UNWIND $names AS nm CREATE (:Country {name: nm})", names=COUNTRIES)
        session.run("UNWIND $names AS nm CREATE (:Commodity {name: nm})", names=COMMODITIES)

        # 3. 기업 노드 + 업종/상장국 연결
        session.run(
            """
            UNWIND $corps AS c
              CREATE (co:Corp {name: c.name})
              WITH co, c
              MATCH (s:Sector {name: c.sector})
              MATCH (n:Country {name: c.country})
              CREATE (co)-[:IN_SECTOR]->(s)
              CREATE (co)-[:LISTED_IN]->(n)
            """,
            corps=[{"name": n, "sector": s, "country": c} for n, s, c in CORPS],
        )

        # 4. 펀드 노드 + 국가 연결
        session.run(
            """
            UNWIND $funds AS f
              CREATE (fund:Fund {name: f.name})
              WITH fund, f
              MATCH (n:Country {name: f.country})
              CREATE (fund)-[:LISTED_IN]->(n)
            """,
            funds=[{"name": n, "country": c} for n, c in FUNDS],
        )

        # 5. 원자재 → 기업 영향
        session.run(
            """
            UNWIND $rows AS r
              MATCH (cm:Commodity {name: r.commodity})
              MATCH (co:Corp {name: r.corp})
              CREATE (cm)-[:AFFECTS {impact: r.impact}]->(co)
            """,
            rows=[{"commodity": c, "corp": co, "impact": im} for c, co, im in AFFECTS],
        )

        # 6. 모회사 → 자회사 지분
        session.run(
            """
            UNWIND $rows AS r
              MATCH (p:Corp {name: r.parent})
              MATCH (s:Corp {name: r.sub})
              CREATE (p)-[:OWNS {stake: r.stake}]->(s)
            """,
            rows=[{"parent": p, "sub": s, "stake": st} for p, s, st in OWNS],
        )

        # 7. 펀드 → 기업 투자
        session.run(
            """
            UNWIND $rows AS r
              MATCH (f:Fund {name: r.fund})
              MATCH (co:Corp {name: r.corp})
              CREATE (f)-[:INVESTS_IN]->(co)
            """,
            rows=[{"fund": f, "corp": c} for f, c in INVESTS_IN],
        )

        # 8. 공급 관계
        session.run(
            """
            UNWIND $rows AS r
              MATCH (a:Corp {name: r.supplier})
              MATCH (b:Corp {name: r.customer})
              CREATE (a)-[:SUPPLIES {item: r.item}]->(b)
            """,
            rows=[{"supplier": a, "customer": b, "item": i} for a, b, i in SUPPLIES],
        )

        # 9. 집계
        counts = session.run(
            f"""
            MATCH (n) WHERE {label_pred}
            WITH count(n) AS nodes
            MATCH ()-[r:AFFECTS|OWNS|INVESTS_IN|SUPPLIES|IN_SECTOR|LISTED_IN]->()
            RETURN nodes, count(r) AS rels
            """
        ).single()

        return {"nodes": counts["nodes"], "relationships": counts["rels"]}


if __name__ == "__main__":
    from neo4j import GraphDatabase

    from app.config import settings

    driver = GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )
    try:
        result = seed_stocks(driver)
        print(
            f"주식 그래프 시드 완료 — 노드 {result['nodes']}개, 관계 {result['relationships']}개"
        )
    finally:
        driver.close()
