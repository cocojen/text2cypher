"""IT개발부 조직도 추가 시드

기존 시드 데이터(데모테크)는 건드리지 않고, IT개발부 서브트리만 삽입·갱신한다.
여러 번 실행해도 IT개발부만 지웠다가 다시 만들어 중복이 생기지 않는다.

노드 라벨: Department, Team, Person
관계 타입: PART_OF, BELONGS_TO, REPORTS_TO

Person 속성:
  - name  : 한글 이름
  - level : 직위 (팀장 / 부부장 / 팀원) — BELONGS_TO.role 과 동일 의미
  - grade : 직급 (2급, 3급, 4급, G1, G2, G3)
  - job   : 담당 업무

실행 방법:
  docker compose exec backend uv run seed_it.py   # CLI
  POST /api/graph/seed-it                          # API (프론트엔드 버튼)
"""

from neo4j import Driver

DEPARTMENT = "IT개발부"

# 부서 조직도 데이터 (팀 → 팀원)
TEAMS: list[dict] = [
    {
        "teamName": "트레이딩시스템개발팀",
        "members": [
            {"name": "최재영", "level": "2급", "post": "팀장", "job": "Project Manage"},
            {"name": "김영주", "level": "G2", "post": "팀원", "job": "국내, 해외주식 매매시스템 개발"},
            {"name": "김진훈", "level": "3급", "post": "팀원", "job": "국내시세 및 투자정보/실시간 시세 전송/해외주식/해외파생 투자정보 부분 개발"},
            {"name": "배효진", "level": "3급", "post": "팀원", "job": "(국내/해외) 파생주문 개발"},
            {"name": "송민석", "level": "3급", "post": "팀원", "job": "자동매매, 국내외FIX, 프로그램매매, 대내/대외채널통합시스템관리(EAI/MCG)"},
            {"name": "이창우", "level": "3급", "post": "팀원", "job": "해외프로젝트, 접속서버, INFOWAY 미들웨어, CYMON 모니터링, 앱위변조, 카카오증권"},
            {"name": "이현우", "level": "3급", "post": "팀원", "job": "국내,해외 주식 주문업무 개발"},
            {"name": "임동진", "level": "3급", "post": "팀원", "job": "대외접속(주문/시세/이체/소액결제/AGENT) 업무개발"},
            {"name": "최수영", "level": "3급", "post": "팀원", "job": "시세/투자정보(국내/해외주식/해외파생), 실시간시세, 검색엔진, 인도네시아 만디리/태국 브알루앙 유지보수"},
            {"name": "황소정", "level": "4급", "post": "팀원", "job": "국내, 해외파생 주문시스템 개발"},
        ],
    },
    {
        "teamName": "금융솔루션개발팀",
        "members": [
            {"name": "장덕주", "level": "3급", "post": "팀장", "job": "계좌, 고객정보, 공공 마이데이터 (전산개발)"},
            {"name": "김선호", "level": "G1", "post": "부부장", "job": "주식/채권/파생/CM 매매 & 투자정보 총괄"},
            {"name": "이현래", "level": "2급", "post": "팀원", "job": "상품판매/상품개발/출납/권리/유가증권"},
            {"name": "기세희", "level": "3급", "post": "팀원", "job": "출납,대출,소액결제,뱅킹 개발"},
            {"name": "엄일섭", "level": "4급", "post": "팀원", "job": "상품,유가,감사/컴플,관리회계,소액결제 서비스 개발"},
            {"name": "최재광", "level": "4급", "post": "팀원", "job": "계좌, 고객정보 서비스 개발"},
            {"name": "신명주", "level": "G3", "post": "팀원", "job": "출납 개발"},
        ],
    },
    {
        "teamName": "모바일시스템개발팀",
        "members": [
            {"name": "송영식", "level": "2급", "post": "팀장", "job": "모바일 업무 화면 개발 (안드로이드 사이보스터치/크레온모바일)"},
            {"name": "김정문", "level": "G2", "post": "팀원", "job": "MTS iOS 개발"},
            {"name": "김진국", "level": "G2", "post": "팀원", "job": "MTS iOS 개발"},
            {"name": "유지현", "level": "G2", "post": "팀원", "job": "안드로이드 개발"},
            {"name": "이가애", "level": "G2", "post": "팀원", "job": "안드로이드 개발"},
            {"name": "조원삼", "level": "G2", "post": "팀원", "job": ""},
            {"name": "박승열", "level": "3급", "post": "팀원", "job": "안드로이드 MTS개발"},
            {"name": "이현주", "level": "3급", "post": "팀원", "job": "HTS 차트/전략/검색,사이보스트레이더,해외시스템 개발, MTS 아이폰/차트/종목검색 개발"},
            {"name": "임동욱", "level": "3급", "post": "팀원", "job": "모바일 안드로이드 및 업무화면 개발"},
            {"name": "서수호", "level": "4급", "post": "팀원", "job": "아이폰 개발"},
            {"name": "오세빈", "level": "G3", "post": "팀원", "job": "아이폰 개발"},
            {"name": "유준용", "level": "G3", "post": "팀원", "job": ""},
        ],
    },
    {
        "teamName": "경영지원시스템개발팀",
        "members": [
            {"name": "강은정", "level": "3급", "post": "팀장", "job": "재무,자금,예산,세무,일반관리(급여,총무,인사,우리사주)"},
            {"name": "양훈지", "level": "G1", "post": "팀원", "job": "대내외 정보 데이터 개발 및 분석솔루션(D3F, DP, R 등) 활용 담당"},
            {"name": "변석환", "level": "2급", "post": "팀원", "job": "재무/관리회계/컴플/RM/CM 본지점서비스개발, 계좌/신탁/퇴직연금 대고객서비스개발"},
            {"name": "손춘기", "level": "3급", "post": "팀원", "job": "경영 및 영업정보"},
            {"name": "정진철", "level": "3급", "post": "팀원", "job": "CM업무개발(주식, 국내(해외)채권, 국내(해외)장외파생), 관리회계"},
            {"name": "최은지", "level": "G3", "post": "팀원", "job": ""},
        ],
    },
    {
        "teamName": "WM시스템개발팀",
        "members": [
            {"name": "염희중", "level": "3급", "post": "팀장", "job": "금융상품,공통업무,방카슈랑스,신탁/퇴직연금"},
            {"name": "김준영", "level": "G2", "post": "팀원", "job": "퇴직연금 개발"},
            {"name": "이석현", "level": "3급", "post": "팀원", "job": "IT자산관리업무 기획 및 개발, 전사 전략사업개발, 자산영업 특화서비스개발"},
            {"name": "김민호", "level": "4급", "post": "팀원", "job": "신탁개발"},
            {"name": "박예지", "level": "G3", "post": "팀원", "job": ""},
        ],
    },
    {
        "teamName": "연계채널시스템개발팀",
        "members": [
            {"name": "임경택", "level": "2급", "post": "팀장", "job": "신규 비즈니스 연계 어플리케이션 기획 및 개발, WTS 및 프레임웍 개발"},
            {"name": "최진수", "level": "G1", "post": "팀원", "job": "WTS 개발"},
            {"name": "강수지", "level": "G2", "post": "팀원", "job": "WTS"},
            {"name": "서강현", "level": "G2", "post": "팀원", "job": "HTS 개발"},
            {"name": "이명원", "level": "G2", "post": "팀원", "job": "HTS 개발"},
            {"name": "조현지", "level": "G2", "post": "팀원", "job": ""},
            {"name": "허영주", "level": "G2", "post": "팀원", "job": ""},
            {"name": "김남근", "level": "3급", "post": "팀원", "job": "사이보스채널개발"},
            {"name": "이동희", "level": "3급", "post": "팀원", "job": "사이보스/크레온 채널 개발, MTS 안드로이드 개발"},
        ],
    },
]


def seed_it(driver: Driver) -> dict[str, int]:
    """IT개발부 조직도를 삽입·갱신한다 (데모 시드 데이터는 보존)."""
    with driver.session() as session:
        # 1. 기존 IT개발부 서브트리만 제거 (데모테크 데이터는 그대로 둠)
        session.run(
            """
            MATCH (d:Department {name: $dept})
            OPTIONAL MATCH (d)<-[:PART_OF]-(t:Team)
            OPTIONAL MATCH (t)<-[:BELONGS_TO]-(p:Person)
            DETACH DELETE p, t, d
            """,
            dept=DEPARTMENT,
        )

        # 2. 부서 + 팀 + 사람 + 소속(BELONGS_TO) 생성
        session.run(
            """
            CREATE (d:Department {name: $dept})
            WITH d
            UNWIND $teams AS team
              CREATE (t:Team {name: team.teamName})
              CREATE (t)-[:PART_OF]->(d)
              WITH t, team
              UNWIND team.members AS m
                CREATE (p:Person {name: m.name, level: m.post, grade: m.grade, job: m.job})
                CREATE (p)-[:BELONGS_TO {role: m.post}]->(t)
            """,
            dept=DEPARTMENT,
            teams=[
                {
                    "teamName": team["teamName"],
                    "members": [
                        {
                            "name": m["name"],
                            "post": m["post"],
                            "grade": m["level"],
                            "job": m["job"],
                        }
                        for m in team["members"]
                    ],
                }
                for team in TEAMS
            ],
        )

        # 3. 팀 내 보고관계: 팀장이 아닌 구성원(팀원/부부장) → 팀장
        session.run(
            """
            MATCH (d:Department {name: $dept})<-[:PART_OF]-(t:Team)
            MATCH (leader:Person)-[:BELONGS_TO {role: '팀장'}]->(t)
            MATCH (member:Person)-[:BELONGS_TO]->(t)
            WHERE member <> leader
            CREATE (member)-[:REPORTS_TO]->(leader)
            """,
            dept=DEPARTMENT,
        )

        # 4. IT개발부 범위 집계
        counts = session.run(
            """
            MATCH (d:Department {name: $dept})
            OPTIONAL MATCH (d)<-[:PART_OF]-(t:Team)
            OPTIONAL MATCH (t)<-[:BELONGS_TO]-(p:Person)
            RETURN count(DISTINCT t) AS teams, count(DISTINCT p) AS people
            """,
            dept=DEPARTMENT,
        ).single()

        return {"teams": counts["teams"], "people": counts["people"]}


if __name__ == "__main__":
    from neo4j import GraphDatabase

    from app.config import settings

    driver = GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )
    try:
        result = seed_it(driver)
        print(
            f"IT개발부 시드 완료 — 팀 {result['teams']}개, 인원 {result['people']}명"
        )
    finally:
        driver.close()
