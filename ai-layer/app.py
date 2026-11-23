import os
from typing import List, Optional, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from anthropic import Anthropic

from rag.retriever import retrieve

# Load environment variables
load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5")
PY_PORT = int(os.getenv("PY_PORT", "3000"))  # Default to 3000 if not set

# Validate API key
if not ANTHROPIC_API_KEY:
    raise RuntimeError("ANTHROPIC_API_KEY is missing in .env")

# Anthropic client
client = Anthropic(api_key=ANTHROPIC_API_KEY)

# FastAPI app
app = FastAPI(
    title="AI Layer (Anthropic + Local RAG)",
    version="1.0.0",
    description="FastAPI service with local-embedding RAG over PDFs + Anthropic generation."
)

# Allowed roles
Role = Literal["system", "user", "assistant"]


# Chat message schema
class ChatMessage(BaseModel):
    role: Role
    content: str = Field(min_length=1)


# Request schema
class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        examples=["What is in the PDF about refunds?"]
    )

    history: Optional[List[ChatMessage]] = None

    temperature: float = Field(
        default=0.2,
        ge=0.0,
        le=1.0
    )

    max_tokens: int = Field(
        default=400,
        ge=1,
        le=2000
    )

    top_k: int = Field(
        default=4,
        ge=1,
        le=10
    )


# Source schema
class Source(BaseModel):
    source_file: str
    page: Optional[int] = None


# Response schema
class ChatResponse(BaseModel):
    reply: str
    sources: List[Source] = []


# Health endpoint
@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "ai-layer-rag",
        "model": ANTHROPIC_MODEL
    }


# Extract text from Anthropic response
def extract_text(content_blocks) -> str:
    parts = []

    for b in content_blocks or []:
        if getattr(b, "type", None) == "text":
            parts.append(getattr(b, "text", ""))

    return "".join(parts).strip()


# Chat endpoint
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):

    try:

        # 1) Retrieve relevant chunks from vector DB
        contexts = retrieve(req.message, k=req.top_k)

        # Build context text
        context_text = "\n\n".join([
            f"[Source: {c['source_file']}"
            f"{'' if c['page'] is None else f', page {c['page']}'}]\n"
            f"{c['text']}"
            for c in contexts
        ])

        # 2) System prompt
        system_prompt = (
            "You are a helpful assistant.\n"
            "Use ONLY the CONTEXT provided to answer.\n"
            "If the answer is not in the context, say:\n"
            "'I don’t have that information in my documents.'\n"
            "When using facts from the context, cite them like:\n"
            "(Source: filename.pdf)\n\n"
            f"CONTEXT:\n{context_text}\n"
        )

        # 3) Build messages
        messages = []

        # Add history safely
        if req.history:
            messages.extend([
                {
                    "role": m.role,
                    "content": m.content
                }
                for m in req.history
                if m.role in ["user", "assistant"]
            ])

        # Add latest user message
        messages.append({
            "role": "user",
            "content": req.message
        })

        # 4) Call Anthropic Claude
        resp = client.messages.create(
            model=ANTHROPIC_MODEL,
            system=system_prompt,
            messages=messages,
            # temperature=req.temperature,
            max_tokens=req.max_tokens,
        )

        # 5) Extract reply text
        reply = extract_text(resp.content)

        if not reply:
            reply = "(No text returned)"

        # 6) Build unique source list
        seen = set()
        sources: List[Source] = []

        for c in contexts:

            key = (
                c["source_file"],
                c.get("page")
            )

            if key not in seen:
                seen.add(key)

                sources.append(
                    Source(
                        source_file=c["source_file"],
                        page=c.get("page")
                    )
                )

        # 7) Return response
        return ChatResponse(
            reply=reply,
            sources=sources
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"RAG chat failed: {str(e)}"
        )