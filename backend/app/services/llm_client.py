import ollama
import boto3

from app.config import settings

# Bedrock 클라이언트 (lazy 초기화)
_bedrock_client = None


def _get_bedrock_client():
    global _bedrock_client
    if _bedrock_client is None:
        _bedrock_client = boto3.client(
            "bedrock-runtime",
            region_name=settings.aws_region,
        )
    return _bedrock_client


def chat_completion(
    messages: list[dict],
    temperature: float = 0,
    max_tokens: int = 512,
) -> str:
    """LLM 프로바이더에 따라 ollama 또는 bedrock으로 채팅 완성 요청"""
    if settings.llm_provider == "bedrock":
        return _chat_bedrock(messages, temperature, max_tokens)
    return _chat_ollama(messages, temperature, max_tokens)


def _chat_ollama(
    messages: list[dict],
    temperature: float,
    max_tokens: int,
) -> str:
    """Ollama를 통한 채팅 완성"""
    client = ollama.Client(host=settings.ollama_base_url)
    response = client.chat(
        model=settings.ollama_model,
        messages=messages,
        options={"temperature": temperature, "num_predict": max_tokens},
    )
    return response.message.content.strip()


def _chat_bedrock(
    messages: list[dict],
    temperature: float,
    max_tokens: int,
) -> str:
    """AWS Bedrock Converse API를 통한 채팅 완성"""
    client = _get_bedrock_client()

    # ollama 형식 메시지를 Bedrock converse 형식으로 변환
    bedrock_messages = []
    for msg in messages:
        bedrock_messages.append({
            "role": msg["role"],
            "content": [{"text": msg["content"]}],
        })

    response = client.converse(
        modelId=settings.bedrock_model_id,
        messages=bedrock_messages,
        inferenceConfig={
            "temperature": temperature,
            "maxTokens": max_tokens,
        },
    )

    return response["output"]["message"]["content"][0]["text"].strip()
