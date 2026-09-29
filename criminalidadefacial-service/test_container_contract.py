from __future__ import annotations

import sys
import types
import unittest
from types import SimpleNamespace
from unittest.mock import patch

import container_api


class ContainerContractTest(unittest.TestCase):
    def test_create_scorer_imports_the_module_copied_by_the_container(self) -> None:
        created: list[tuple[object, ...]] = []

        class FakeScorer:
            def __init__(self, *args: object, **kwargs: object) -> None:
                created.append((*args, kwargs))

        fake_module = types.SimpleNamespace(GallerySimilarityScorer=FakeScorer)
        args = SimpleNamespace(
            features="features.csv",
            embeddings="embeddings.npy",
            model_name="buffalo_l",
            det_size=320,
        )
        with patch.dict(sys.modules, {"serve_similarity_app": fake_module}):
            scorer = container_api.create_scorer(args)

        self.assertIsInstance(scorer, FakeScorer)
        self.assertEqual(len(created), 1)

    def test_public_payload_preserves_worker_reference_url(self) -> None:
        payload = container_api._public_score_payload({
            "ok": True,
            "top_matches": [{
                "match_id": 42,
                "subject_id": "subject",
                "cosine": 0.88,
                "relative_percent": 99.1,
                "image_url": "/api/reference/42",
            }],
        })
        self.assertEqual(payload["top_matches"][0]["image_url"], "/api/reference/42")


if __name__ == "__main__":
    unittest.main()
