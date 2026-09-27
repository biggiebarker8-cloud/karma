"""Local, atomic persistence for the Karma API.

Set KARMA_DATA_FILE to a durable mounted path. Azure Functions' normal
filesystem is not a durable store, so this module is for local operation.
"""
import json
import os
from pathlib import Path

from . import models

COLLECTIONS = {
    "universes": models.Universe,
    "characters": models.Character,
    "stories": models.Story,
    "assets": models.Asset,
    "plugins": models.Plugin,
    "skills": models.Skill,
    "approvals": models.ApprovalRequest,
    "learning_events": models.LearningEvent,
    "playbooks": models.Playbook,
}
SINGLES = {
    "preferences": models.UserPreferenceProfile,
    "learning_policy": models.LearningPolicy,
}


def data_path() -> Path:
    return Path(os.getenv("KARMA_DATA_FILE", ".data/karma.json")).expanduser()


def load_store(store) -> dict | None:
    path = data_path()
    if not path.exists():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    with store.lock:
        for name, model in COLLECTIONS.items():
            if name in data:
                setattr(store, name, {
                    key: model.model_validate(value) for key, value in data[name].items()
                })
        for name, model in SINGLES.items():
            if name in data:
                setattr(store, name, model.model_validate(data[name]))
    return data.get("identity")


def save_store(store, identity=None) -> None:
    path = data_path()
    with store.lock:
        data = {
            name: {key: value.model_dump(mode="json") for key, value in getattr(store, name).items()}
            for name in COLLECTIONS
        }
        data.update({
            name: getattr(store, name).model_dump(mode="json") for name in SINGLES
        })
        if identity is not None:
            data["identity"] = identity.model_dump(mode="json")
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + ".tmp")
        temporary.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        os.replace(temporary, path)
