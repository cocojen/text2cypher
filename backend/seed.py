"""데모테크 조직도 시드 — As-Is (간소화 버전)

Membership / Role 중간 노드를 제거하고,
BELONGS_TO 관계의 프로퍼티(role)로 소속·역할을 표현한다.

노드 라벨: Company, Division, Department, Team, Person
관계 타입: PART_OF, BELONGS_TO, REPORTS_TO
"""

from neo4j import Driver


def seed(driver: Driver) -> dict[str, int]:
    """As-Is 시드 데이터 삽입 (40명, 간소화 패턴)"""
    with driver.session() as session:
        # 기존 데이터 전체 삭제
        session.run("MATCH (n) DETACH DELETE n")

        # ── 1. 회사 + 부문 + 본부 + 팀 조직 구조 ──
        session.run("""
        CREATE (company:Company {name: '데모테크', founded: '2021'})

        CREATE (techDiv:Division {name: '기술부문'})
        CREATE (svcDiv:Division {name: '서비스부문'})
        CREATE (mgDiv:Division {name: '경영관리부문'})
        CREATE (crDiv:Division {name: '컴플라이언스부문'})

        CREATE (devDept:Department {name: '개발본부'})
        CREATE (techLab:Department {name: '기술연구센터'})
        CREATE (svcDept:Department {name: '서비스운영본부'})
        CREATE (mgDept:Department {name: '경영지원본부'})
        CREATE (riskDept:Department {name: '리스크관리본부'})

        CREATE (prodTeam:Team {name: '프로덕트팀'})
        CREATE (beTeam:Team {name: '서버개발팀'})
        CREATE (feTeam:Team {name: '웹개발팀'})
        CREATE (mobTeam:Team {name: '앱개발팀'})
        CREATE (aiTeam:Team {name: 'AI연구팀'})
        CREATE (infraTeam:Team {name: '인프라팀'})
        CREATE (dataTeam:Team {name: '데이터분석팀'})
        CREATE (secTeam:Team {name: '보안팀'})
        CREATE (qaTeam:Team {name: 'QA팀'})
        CREATE (svcPlanTeam:Team {name: '서비스기획팀'})
        CREATE (opsTeam:Team {name: '운영팀'})
        CREATE (mktTeam:Team {name: '마케팅팀'})
        CREATE (adminTeam:Team {name: '총무팀'})

        CREATE (techDiv)-[:PART_OF]->(company)
        CREATE (svcDiv)-[:PART_OF]->(company)
        CREATE (mgDiv)-[:PART_OF]->(company)
        CREATE (crDiv)-[:PART_OF]->(company)

        CREATE (devDept)-[:PART_OF]->(techDiv)
        CREATE (techLab)-[:PART_OF]->(techDiv)
        CREATE (svcDept)-[:PART_OF]->(svcDiv)
        CREATE (mgDept)-[:PART_OF]->(mgDiv)
        CREATE (riskDept)-[:PART_OF]->(crDiv)

        CREATE (prodTeam)-[:PART_OF]->(devDept)
        CREATE (beTeam)-[:PART_OF]->(devDept)
        CREATE (feTeam)-[:PART_OF]->(devDept)
        CREATE (mobTeam)-[:PART_OF]->(devDept)
        CREATE (aiTeam)-[:PART_OF]->(techLab)
        CREATE (infraTeam)-[:PART_OF]->(techLab)
        CREATE (dataTeam)-[:PART_OF]->(techLab)
        CREATE (secTeam)-[:PART_OF]->(techLab)
        CREATE (qaTeam)-[:PART_OF]->(techLab)
        CREATE (svcPlanTeam)-[:PART_OF]->(svcDept)
        CREATE (opsTeam)-[:PART_OF]->(svcDept)
        CREATE (mktTeam)-[:PART_OF]->(mgDept)
        CREATE (adminTeam)-[:PART_OF]->(mgDept)
        """)

        # ── 2. 경영진 (4명) ──
        session.run("""
        MATCH (c:Company {name: '데모테크'})

        CREATE (ceo:Person {name: '김민수', name_en: 'David', title: '대표이사', level: 'C-Level'})
        CREATE (audit:Person {name: '이정훈', name_en: 'Robert', title: '감사', level: 'C-Level'})
        CREATE (ne1:Person {name: '최영수', name_en: 'Thomas', title: '비상무이사', level: 'C-Level'})
        CREATE (ne2:Person {name: '박진우', name_en: 'Daniel', title: '비상무이사', level: 'C-Level'})

        CREATE (ceo)-[:BELONGS_TO {role: '대표이사'}]->(c)
        CREATE (audit)-[:BELONGS_TO {role: '감사'}]->(c)
        CREATE (ne1)-[:BELONGS_TO {role: '비상무이사'}]->(c)
        CREATE (ne2)-[:BELONGS_TO {role: '비상무이사'}]->(c)
        """)

        # ── 3. 부문장 (4명) ──

        # 정하준 — 기술부문장 겸 개발본부장 겸 기술연구센터장
        session.run("""
        MATCH (techDiv:Division {name: '기술부문'})
        MATCH (devDept:Department {name: '개발본부'})
        MATCH (techLab:Department {name: '기술연구센터'})

        CREATE (alex:Person {name: '정하준', name_en: 'Alex', title: 'CTO / CPO', level: '부문장'})
        CREATE (alex)-[:BELONGS_TO {role: '부문장'}]->(techDiv)
        CREATE (alex)-[:BELONGS_TO {role: '본부장'}]->(devDept)
        CREATE (alex)-[:BELONGS_TO {role: '본부장'}]->(techLab)
        """)

        # 한도현 — 서비스부문장 겸 서비스운영본부장
        session.run("""
        MATCH (svcDiv:Division {name: '서비스부문'})
        MATCH (svcDept:Department {name: '서비스운영본부'})

        CREATE (brian:Person {name: '한도현', name_en: 'Brian', title: '부문장', level: '부문장'})
        CREATE (brian)-[:BELONGS_TO {role: '부문장'}]->(svcDiv)
        CREATE (brian)-[:BELONGS_TO {role: '본부장'}]->(svcDept)
        """)

        # 오세진 — 경영관리부문장
        session.run("""
        MATCH (mgDiv:Division {name: '경영관리부문'})

        CREATE (chris:Person {name: '오세진', name_en: 'Chris', title: '부문장', level: '부문장'})
        CREATE (chris)-[:BELONGS_TO {role: '부문장'}]->(mgDiv)
        """)

        # 윤태호 — 컴플라이언스부문장 (준법감시인)
        session.run("""
        MATCH (crDiv:Division {name: '컴플라이언스부문'})

        CREATE (sean:Person {name: '윤태호', name_en: 'Sean', title: '준법감시인', level: '부문장'})
        CREATE (sean)-[:BELONGS_TO {role: '부문장', additional_role: '준법감시인'}]->(crDiv)
        """)

        # ── 4. 담당 (1명) ──
        session.run("""
        MATCH (svcDiv:Division {name: '서비스부문'})

        CREATE (victor:Person {name: '임지호', name_en: 'Victor', title: '서비스사업 담당', level: '담당'})
        CREATE (victor)-[:BELONGS_TO {role: '담당'}]->(svcDiv)
        """)

        # ── 5. 본부장 (2명) ──
        session.run("""
        MATCH (mgDept:Department {name: '경영지원본부'})

        CREATE (martin:Person {name: '구본철', name_en: 'Martin', title: '본부장', level: '본부장'})
        CREATE (martin)-[:BELONGS_TO {role: '본부장'}]->(mgDept)
        """)

        session.run("""
        MATCH (riskDept:Department {name: '리스크관리본부'})

        CREATE (philip:Person {name: '양현석', name_en: 'Philip', title: '본부장', level: '본부장'})
        CREATE (philip)-[:BELONGS_TO {role: '본부장'}]->(riskDept)
        """)

        # ── 6. 팀장 + 팀원 ──

        # 프로덕트팀 (3명)
        session.run("""
        MATCH (t:Team {name: '프로덕트팀'})

        CREATE (noah:Person {name: '배성호', name_en: 'Noah', title: '프로덕트 오너', level: '팀장'})
        CREATE (lily:Person {name: '김서연', name_en: 'Lily', title: '프로덕트 디자이너', level: '팀원'})
        CREATE (chloe:Person {name: '이하은', name_en: 'Chloe', title: '프로덕트 디자이너', level: '팀원'})

        CREATE (noah)-[:BELONGS_TO {role: '팀장'}]->(t)
        CREATE (lily)-[:BELONGS_TO {role: '팀원'}]->(t)
        CREATE (chloe)-[:BELONGS_TO {role: '팀원'}]->(t)
        """)

        # 서버개발팀 (5명)
        session.run("""
        MATCH (t:Team {name: '서버개발팀'})

        CREATE (eric:Person {name: '장우진', name_en: 'Eric', title: '서버개발 팀장', level: '팀장'})
        CREATE (oscar:Person {name: '이태현', name_en: 'Oscar', title: '백엔드 엔지니어', level: '팀원'})
        CREATE (henry:Person {name: '박준서', name_en: 'Henry', title: '백엔드 엔지니어', level: '팀원'})
        CREATE (dylan:Person {name: '강민혁', name_en: 'Dylan', title: '백엔드 엔지니어', level: '팀원'})
        CREATE (olivia:Person {name: '신유진', name_en: 'Olivia', title: '백엔드 엔지니어', level: '팀원'})

        CREATE (eric)-[:BELONGS_TO {role: '팀장'}]->(t)
        CREATE (oscar)-[:BELONGS_TO {role: '팀원'}]->(t)
        CREATE (henry)-[:BELONGS_TO {role: '팀원'}]->(t)
        CREATE (dylan)-[:BELONGS_TO {role: '팀원'}]->(t)
        CREATE (olivia)-[:BELONGS_TO {role: '팀원'}]->(t)
        """)

        # 웹개발팀 (1명)
        session.run("""
        MATCH (t:Team {name: '웹개발팀'})

        CREATE (amy:Person {name: '최수빈', name_en: 'Amy', title: '프론트엔드 엔지니어', level: '팀원'})
        CREATE (amy)-[:BELONGS_TO {role: '팀원'}]->(t)
        """)

        # 앱개발팀 (4명)
        session.run("""
        MATCH (t:Team {name: '앱개발팀'})

        CREATE (kevin:Person {name: '송민재', name_en: 'Kevin', title: '모바일 팀장', level: '팀장'})
        CREATE (mason:Person {name: '허재윤', name_en: 'Mason', title: '안드로이드 엔지니어', level: '팀원'})
        CREATE (felix:Person {name: '안상우', name_en: 'Felix', title: '안드로이드 엔지니어', level: '팀원'})
        CREATE (hailey:Person {name: '도유나', name_en: 'Hailey', title: 'iOS 엔지니어', level: '팀원'})

        CREATE (kevin)-[:BELONGS_TO {role: '팀장'}]->(t)
        CREATE (mason)-[:BELONGS_TO {role: '팀원'}]->(t)
        CREATE (felix)-[:BELONGS_TO {role: '팀원'}]->(t)
        CREATE (hailey)-[:BELONGS_TO {role: '팀원'}]->(t)
        """)

        # AI연구팀 (1명)
        session.run("""
        MATCH (t:Team {name: 'AI연구팀'})

        CREATE (sophie:Person {name: '나예진', name_en: 'Sophie', title: 'AI연구 팀장', level: '팀장'})
        CREATE (sophie)-[:BELONGS_TO {role: '팀장'}]->(t)
        """)

        # 인프라팀 (2명)
        session.run("""
        MATCH (t:Team {name: '인프라팀'})

        CREATE (ray:Person {name: '권도윤', name_en: 'Ray', title: '인프라 엔지니어', level: '팀원'})
        CREATE (nina:Person {name: '조하영', name_en: 'Nina', title: '인프라 엔지니어', level: '팀원'})

        CREATE (ray)-[:BELONGS_TO {role: '팀원'}]->(t)
        CREATE (nina)-[:BELONGS_TO {role: '팀원'}]->(t)
        """)

        # 데이터분석팀 (1명)
        session.run("""
        MATCH (t:Team {name: '데이터분석팀'})

        CREATE (logan:Person {name: '문재원', name_en: 'Logan', title: '데이터 엔지니어', level: '팀원'})
        CREATE (logan)-[:BELONGS_TO {role: '팀원'}]->(t)
        """)

        # 보안팀 (2명)
        session.run("""
        MATCH (t:Team {name: '보안팀'})

        CREATE (leo:Person {name: '유승환', name_en: 'Leo', title: 'CISO', level: '팀장'})
        CREATE (ryan:Person {name: '서지민', name_en: 'Ryan', title: '정보보안 매니저', level: '팀원'})

        CREATE (leo)-[:BELONGS_TO {role: '팀장'}]->(t)
        CREATE (ryan)-[:BELONGS_TO {role: '팀원'}]->(t)
        """)

        # QA팀 (1명)
        session.run("""
        MATCH (t:Team {name: 'QA팀'})

        CREATE (sam:Person {name: '엄태경', name_en: 'Sam', title: '품질보증 매니저', level: '팀원'})
        CREATE (sam)-[:BELONGS_TO {role: '팀원'}]->(t)
        """)

        # 서비스기획팀 (3명)
        session.run("""
        MATCH (t:Team {name: '서비스기획팀'})

        CREATE (grace:Person {name: '전소라', name_en: 'Grace', title: '서비스기획 팀장', level: '팀장'})
        CREATE (scott:Person {name: '남현우', name_en: 'Scott', title: '서비스기획 매니저', level: '팀원'})
        CREATE (lucas:Person {name: '류지원', name_en: 'Lucas', title: '서비스기획 매니저', level: '팀원'})

        CREATE (grace)-[:BELONGS_TO {role: '팀장'}]->(t)
        CREATE (scott)-[:BELONGS_TO {role: '팀원'}]->(t)
        CREATE (lucas)-[:BELONGS_TO {role: '팀원'}]->(t)
        """)

        # 운영팀 (2명 + 전소라 겸직 팀장)
        session.run("""
        MATCH (t:Team {name: '운영팀'})
        MATCH (grace:Person {name: '전소라'})

        CREATE (tyler:Person {name: '공영재', name_en: 'Tyler', title: '운영 매니저', level: '팀원'})
        CREATE (ella:Person {name: '진수아', name_en: 'Ella', title: '고객 커뮤니케이션 매니저', level: '팀원'})

        CREATE (grace)-[:BELONGS_TO {role: '팀장'}]->(t)
        CREATE (tyler)-[:BELONGS_TO {role: '팀원'}]->(t)
        CREATE (ella)-[:BELONGS_TO {role: '팀원'}]->(t)
        """)

        # 마케팅팀 (2명)
        session.run("""
        MATCH (t:Team {name: '마케팅팀'})

        CREATE (emma:Person {name: '홍예진', name_en: 'Emma', title: '마케팅 팀장', level: '팀장'})
        CREATE (ian:Person {name: '차윤호', name_en: 'Ian', title: '마케팅 커뮤니케이션 매니저', level: '팀원'})

        CREATE (emma)-[:BELONGS_TO {role: '팀장'}]->(t)
        CREATE (ian)-[:BELONGS_TO {role: '팀원'}]->(t)
        """)

        # 총무팀 (2명, 탁동훈 운영팀 겸직)
        session.run("""
        MATCH (t:Team {name: '총무팀'})
        MATCH (opsTeam:Team {name: '운영팀'})

        CREATE (wendy:Person {name: '오지현', name_en: 'Wendy', title: '총무 매니저', level: '팀원'})
        CREATE (dennis:Person {name: '탁동훈', name_en: 'Dennis', title: '총무 매니저', level: '팀원'})

        CREATE (wendy)-[:BELONGS_TO {role: '팀원'}]->(t)
        CREATE (dennis)-[:BELONGS_TO {role: '팀원'}]->(t)
        CREATE (dennis)-[:BELONGS_TO {role: '팀원'}]->(opsTeam)
        """)

        # ── 7. 보고 관계 (REPORTS_TO) ──

        # 부문장 → 대표이사
        session.run("""
        MATCH (ceo:Person {name: '김민수'})
        MATCH (p:Person) WHERE p.level = '부문장'
        CREATE (p)-[:REPORTS_TO]->(ceo)
        """)

        # 본부장 → 부문장
        session.run("""
        MATCH (martin:Person {name: '구본철'}), (chris:Person {name: '오세진'})
        CREATE (martin)-[:REPORTS_TO]->(chris)
        """)
        session.run("""
        MATCH (philip:Person {name: '양현석'}), (sean:Person {name: '윤태호'})
        CREATE (philip)-[:REPORTS_TO]->(sean)
        """)

        # 담당 → 부문장
        session.run("""
        MATCH (victor:Person {name: '임지호'}), (brian:Person {name: '한도현'})
        CREATE (victor)-[:REPORTS_TO]->(brian)
        """)

        # 팀장 → 본부장/부문장
        session.run("""
        MATCH (alex:Person {name: '정하준'})
        MATCH (p:Person)-[:BELONGS_TO {role: '팀장'}]->(:Team)-[:PART_OF]->(:Department)-[:PART_OF]->(:Division {name: '기술부문'})
        CREATE (p)-[:REPORTS_TO]->(alex)
        """)
        session.run("""
        MATCH (brian:Person {name: '한도현'})
        MATCH (p:Person)-[:BELONGS_TO {role: '팀장'}]->(:Team)-[:PART_OF]->(:Department {name: '서비스운영본부'})
        CREATE (p)-[:REPORTS_TO]->(brian)
        """)
        session.run("""
        MATCH (martin:Person {name: '구본철'})
        MATCH (p:Person)-[:BELONGS_TO {role: '팀장'}]->(:Team)-[:PART_OF]->(:Department {name: '경영지원본부'})
        CREATE (p)-[:REPORTS_TO]->(martin)
        """)

        # 팀원 → 팀장
        session.run("""
        MATCH (member:Person)-[:BELONGS_TO {role: '팀원'}]->(t:Team)<-[:BELONGS_TO {role: '팀장'}]-(leader:Person)
        WITH DISTINCT member, leader
        CREATE (member)-[:REPORTS_TO]->(leader)
        """)

        # ── 노드/관계 수 조회 ──
        count_result = session.run("MATCH (n) RETURN count(n) AS nodes")
        node_count = count_result.single()["nodes"]
        rel_result = session.run("MATCH ()-[r]->() RETURN count(r) AS rels")
        rel_count = rel_result.single()["rels"]

        return {"nodes": node_count, "relationships": rel_count}
