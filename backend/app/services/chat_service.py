import json
import re
from typing import Any

from neo4j import Driver

from app.prompts.answer_generation import ANSWER_GENERATION_PROMPT
from app.prompts.text2cypher import TEXT2CYPHER_PROMPT
from app.schemas.chat import ChatResponse
from app.services.llm_client import chat_completion
from app.services.neo4j_service import Neo4jService
from app.services.schema_service import SchemaService


class ChatService:
    def __init__(self, driver: Driver):
        self.driver = driver
        self.neo4j_service = Neo4jService(driver)
        self.schema_service = SchemaService(driver)

    def ask(self, question: str) -> ChatResponse:
        """자연어 질문 → Cypher 생성 → 실행 → 자연어 답변"""
        # 1. 스키마 추출
        schema_text = self.schema_service.get_full_schema_text()

        # 2. Cypher 생성
        cypher = self._generate_cypher(question, schema_text)

        # 3. Cypher 실행
        try:
            raw_results = self.neo4j_service.run_read_cypher(cypher)
        except Exception as e:
            raw_results = []
            return ChatResponse(
                question=question,
                cypher=cypher,
                raw_results=[],
                answer=f"Cypher 실행 오류: {e}",
            )

        # 4. 자연어 답변 생성
        answer = self._generate_answer(question, cypher, raw_results)

        return ChatResponse(
            question=question,
            cypher=cypher,
            raw_results=raw_results,
            answer=answer,
        )

    def _generate_cypher(self, question: str, schema_text: str) -> str:
        """LLM을 통해 Cypher 쿼리 생성"""
        prompt = TEXT2CYPHER_PROMPT.format(schema=schema_text, question=question)

        cypher = chat_completion(
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=512,
        )

        # 마크다운 코드 블록 제거
        cypher = re.sub(r"```(?:cypher)?\s*", "", cypher)
        cypher = re.sub(r"```\s*$", "", cypher)
        # thinking 태그 제거 (qwen3 모델 대응)
        cypher = re.sub(r"<think>.*?</think>", "", cypher, flags=re.DOTALL)
        return cypher.strip()

    def _generate_answer(self, question: str, cypher: str, results: list[dict[str, Any]]) -> str:
        """LLM을 통해 자연어 답변 생성"""
        results_text = json.dumps(results, ensure_ascii=False, default=str)
        prompt = ANSWER_GENERATION_PROMPT.format(
            question=question,
            cypher=cypher,
            results=results_text,
        )

        answer = chat_completion(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1024,
        )

        # thinking 태그 제거
        answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL)
        return answer.strip()
