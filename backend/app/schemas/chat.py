from typing import Any

from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str


class CypherRequest(BaseModel):
    cypher: str


class ChatResponse(BaseModel):
    question: str
    cypher: str
    raw_results: list[dict[str, Any]]
    answer: str


class CypherResponse(BaseModel):
    cypher: str
    results: list[dict[str, Any]]
