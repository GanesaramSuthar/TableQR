import re
import secrets
from bson import ObjectId


def generate_slug(name: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug


def generate_order_number() -> str:
    return f"RQ{secrets.randbelow(9000) + 1000}"


def generate_qr_token() -> str:
    return secrets.token_urlsafe(32)


def serialize_doc(doc: dict) -> dict:
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        elif isinstance(value, list):
            result[key] = [serialize_doc(item) if isinstance(item, dict) else str(item) if isinstance(item, ObjectId) else item for item in value]
        else:
            result[key] = value
    if "_id" in result:
        result["id"] = result.pop("_id")
    return result


def serialize_docs(docs: list) -> list:
    return [serialize_doc(doc) for doc in docs]
