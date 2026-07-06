from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "graphrag123"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3-coder:30b"

    # LLM 프로바이더 선택: "ollama" | "bedrock" | "gemini"
    llm_provider: str = "ollama"

    # Bedrock 설정
    aws_region: str = "ap-northeast-2"
    bedrock_model_id: str = "anthropic.claude-sonnet-4-20250514-v1:0"

    # Google Gemini 설정
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    model_config = {"env_file": "../.env"}


settings = Settings()
