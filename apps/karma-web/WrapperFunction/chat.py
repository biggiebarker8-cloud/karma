"""Optional model-backed conversation. No tools or privileged actions are exposed."""
import asyncio
import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=12000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=12000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)


def _call_model(url, key, model, messages):
    payload = json.dumps({"model": model, "messages": messages, "temperature": 0.5}).encode()
    request = Request(
        url, data=payload, method="POST",
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
    )
    try:
        with urlopen(request, timeout=40) as response:
            result = json.load(response)
        return result["choices"][0]["message"]["content"]
    except (HTTPError, URLError, KeyError, IndexError, ValueError) as error:
        raise HTTPException(status_code=502, detail="The AI connection failed. Check the model settings on the iMac.") from error


async def respond(payload: ChatRequest, service, store):
    url = os.getenv("KARMA_MODEL_URL", "").strip()
    key = os.getenv("KARMA_MODEL_KEY", "").strip()
    model = os.getenv("KARMA_MODEL_NAME", "").strip()
    if not all((url, key, model)):
        raise HTTPException(status_code=503, detail="Chat needs a model connection. The other Karma tools work without one.")
    if not url.startswith("https://"):
        raise HTTPException(status_code=500, detail="KARMA_MODEL_URL must use HTTPS.")

    with store.lock:
        identity = service.identity.model_copy()
        preferences = store.preferences.model_copy()
    system = (
        f"You are {identity.name}, the Alliance assistant. Tone: {identity.tone}. "
        f"Identity and lore: {identity.lore or 'Alliance creative and operations assistant'}. "
        f"User preference: {preferences.desired_assistant_behavior}. "
        "Be honest about what is connected. You have no tool access through this chat. "
        "Do not claim to have changed files, published posts, or contacted anyone. "
        "Never execute or approve payments, billing changes, or owner/admin privilege changes. "
        "The owner is the final decision-maker. Keep answers concise and practical."
    )
    messages = [{"role": "system", "content": system}]
    messages.extend(
        {"role": entry.role, "content": entry.content}
        for entry in payload.history if entry.role in {"user", "assistant"}
    )
    messages.append({"role": "user", "content": payload.message})
    answer = await asyncio.to_thread(_call_model, url, key, model, messages)
    return {"reply": answer}
