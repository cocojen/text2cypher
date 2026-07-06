import ollama
import boto3

from app.config import settings

# Bedrock 클라이언트 (lazy 초기화)
_bedrock_client = None

# Gemini 클라이언트 (lazy 초기화)
_gemini_client = None


def _get_bedrock_client():
    global _bedrock_client
    if _bedrock_client is None:
        _bedrock_client = boto3.client(
            "bedrock-runtime",
            region_name=settings.aws_region,
        )
    return _bedrock_client


def _get_gemini_client():
    global _gemini_client
    if _gemini_client is None:
        from google import genai

        if not settings.gemini_api_key:
            raise RuntimeError(
                "GEMINI_API_KEY가 설정되지 않았습니다. .env에 키를 넣어주세요."
            )
        _gemini_client = genai.Client(api_key=settings.gemini_api_key)
    return _gemini_client


def chat_completion(
    messages: list[dict],
    temperature: float = 0,
    max_tokens: int = 512,
) -> str:
    """LLM 프로바이더에 따라 ollama / bedrock / gemini로 채팅 완성 요청"""
    if settings.llm_provider == "bedrock":
        return _chat_bedrock(messages, temperature, max_tokens)
    if settings.llm_provider == "gemini":
        return _chat_gemini(messages, temperature, max_tokens)
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


def _chat_gemini(
    messages: list[dict],
    temperature: float,
    max_tokens: int,
) -> str:
    """Google Gemini를 통한 채팅 완성"""
    from google.genai import types

    client = _get_gemini_client()

    # ollama 형식 메시지를 Gemini 형식으로 변환
    # system 메시지는 system_instruction으로, 나머지는 contents로
    system_texts = [m["content"] for m in messages if m["role"] == "system"]
    contents = []
    for msg in messages:
        if msg["role"] == "system":
            continue
        role = "model" if msg["role"] == "assistant" else "user"
        contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])])
        )

    config = types.GenerateContentConfig(
        temperature=temperature,
        max_output_tokens=max_tokens,
        system_instruction="\n".join(system_texts) or None,
        # Gemini 2.5 계열의 thinking 토큰이 max_output_tokens를 소진해
        # 빈 응답이 나오는 것을 방지 (Cypher 생성엔 사고 과정 불필요)
        thinking_config=types.ThinkingConfig(thinking_budget=0),
    )

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=contents,
        config=config,
    )

    return (response.text or "").strip()
