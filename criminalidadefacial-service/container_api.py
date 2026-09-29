"""Small HTTP surface for the private ArcFace similarity container."""

from __future__ import annotations

import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Protocol
from urllib.parse import urlparse


class ImageScorer(Protocol):
    def score_jpeg(self, payload: bytes) -> dict[str, object]: ...


ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
PUBLIC_SCORE_FIELDS = {
    "best_cosine",
    "best_relative_percent",
    "aggregate_relative_percent",
    "distinctiveness_percent",
    "estimated_false_match_rate",
    "match_strength",
    "warnings",
}
PUBLIC_MATCH_FIELDS = {"match_id", "subject_id", "cosine", "relative_percent", "image_url"}


def _public_score_payload(score: dict[str, object]) -> dict[str, object]:
    payload: dict[str, object] = {"ok": bool(score.get("ok"))}
    for field in PUBLIC_SCORE_FIELDS:
        if field in score:
            payload[field] = score[field]
    payload["top_matches"] = [
        {field: match[field] for field in PUBLIC_MATCH_FIELDS if field in match}
        for match in score.get("top_matches", [])
        if isinstance(match, dict)
    ]
    return payload


def create_handler(scorer: ImageScorer, max_upload_bytes: int = 5 * 1024 * 1024) -> type[BaseHTTPRequestHandler]:
    """Return a request handler that validates image input before invoking ``scorer``."""
    if max_upload_bytes < 1:
        raise ValueError("max_upload_bytes must be positive")

    class ContainerApiHandler(BaseHTTPRequestHandler):
        def do_GET(self) -> None:
            if urlparse(self.path).path == "/health":
                self._send_json({"ok": True})
                return
            self._send_json({"ok": False, "error": "Rota não encontrada."}, status=404)

        def do_POST(self) -> None:
            if urlparse(self.path).path != "/api/score":
                self._send_json({"ok": False, "error": "Rota não encontrada."}, status=404)
                return
            content_type = self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
            if content_type not in ALLOWED_CONTENT_TYPES:
                self._send_json({"ok": False, "error": "Formato de imagem não aceito."}, status=400)
                return
            try:
                content_length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                content_length = 0
            if content_length <= 0:
                self._send_json({"ok": False, "error": "Imagem vazia."}, status=400)
                return
            if content_length > max_upload_bytes:
                self._send_json({"ok": False, "error": "Imagem excede o limite permitido."}, status=413)
                return
            payload = self.rfile.read(content_length)
            try:
                score = scorer.score_jpeg(payload)
            except Exception:
                self._send_json({"ok": False, "error": "Não foi possível analisar a imagem."}, status=422)
                return
            if not score.get("ok"):
                self._send_json({"ok": False, "error": "Não foi possível analisar a imagem."}, status=422)
                return
            self._send_json(_public_score_payload(score))

        def _send_json(self, payload: dict[str, object], status: int = 200) -> None:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, fmt: str, *args: object) -> None:
            return

    return ContainerApiHandler


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve the private public-similarity container API.")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--features", type=Path, default=Path("artifacts/embedding_manifest.csv"))
    parser.add_argument("--embeddings", type=Path, default=Path("artifacts/embeddings.npy"))
    parser.add_argument("--model-name", default="buffalo_l")
    parser.add_argument("--det-size", type=int, default=320)
    parser.add_argument("--max-upload-bytes", type=int, default=5 * 1024 * 1024)
    return parser.parse_args()


def main() -> int:
    from scripts.serve_similarity_app import GallerySimilarityScorer

    args = parse_args()
    scorer = GallerySimilarityScorer(
        args.features,
        args.embeddings,
        args.model_name,
        ctx_id=-1,
        det_size=args.det_size,
    )
    server = ThreadingHTTPServer((args.host, args.port), create_handler(scorer, args.max_upload_bytes))
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
