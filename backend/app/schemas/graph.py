from typing import Any

from pydantic import BaseModel


class NodeCreate(BaseModel):
    label: str
    properties: dict[str, Any] = {}


class NodeUpdate(BaseModel):
    label: str | None = None
    properties: dict[str, Any] = {}


class RelationshipCreate(BaseModel):
    source_id: str
    target_id: str
    type: str
    properties: dict[str, Any] = {}


class RelationshipUpdate(BaseModel):
    type: str | None = None
    properties: dict[str, Any] = {}


class NodeResponse(BaseModel):
    id: str
    label: str
    properties: dict[str, Any]


class RelationshipResponse(BaseModel):
    id: str
    type: str
    source_id: str
    target_id: str
    properties: dict[str, Any]


class GraphData(BaseModel):
    nodes: list[NodeResponse]
    relationships: list[RelationshipResponse]
