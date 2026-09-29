"""Empirical, duplicate-safe calibration for gallery similarity scores."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class GalleryCalibration:
    """Leave-one-out reference distributions derived from one gallery release."""

    impostor_max_scores: np.ndarray
    topk_leave_one_out_scores: np.ndarray
    density_leave_one_out_scores: np.ndarray
    top_k: int

    def percentile(self, value: float, distribution: np.ndarray) -> float | None:
        """Return the empirical CDF percentage for ``value`` or ``None`` when absent."""
        scores = np.asarray(distribution, dtype=np.float32)
        if scores.size == 0:
            return None
        # A query tied with the baseline has no strictly stronger evidence.
        # Using the lower empirical rank prevents a degenerate all-zero
        # impostor distribution from reporting 100% for an unrelated query.
        return float(np.mean(scores < float(value)) * 100.0)

    def false_match_rate(self, value: float) -> float | None:
        """Return the empirical upper tail of leave-one-out impostor maxima."""
        scores = self.impostor_max_scores
        if scores.size == 0:
            return None
        return float(np.mean(scores >= float(value)))

    def select_unique_topk(self, similarities: np.ndarray, duplicate_group_ids: np.ndarray) -> np.ndarray:
        """Select the highest similarity for each duplicate group, in descending order."""
        values = np.asarray(similarities, dtype=np.float32).reshape(-1)
        groups = np.asarray(duplicate_group_ids).reshape(-1)
        if values.size != groups.size:
            raise ValueError("similarities and duplicate_group_ids must have the same length.")

        selected: list[float] = []
        seen_groups: set[int] = set()
        for index in np.argsort(values)[::-1].tolist():
            group = int(groups[index])
            if group in seen_groups:
                continue
            selected.append(float(values[index]))
            seen_groups.add(group)
            if len(selected) >= self.top_k:
                break
        return np.asarray(selected, dtype=np.float32)

    def weighted_topk(self, similarities: np.ndarray, duplicate_group_ids: np.ndarray) -> float:
        """Compute the fixed rank-decayed top-k statistic represented by this calibration."""
        values = self.select_unique_topk(similarities, duplicate_group_ids)
        if values.size == 0:
            return 0.0
        weights = np.exp(-np.linspace(0.0, 2.5, values.size, dtype=np.float32))
        weights /= max(float(weights.sum()), 1e-12)
        return float(np.dot(values, weights))

    def density(self, similarities: np.ndarray, duplicate_group_ids: np.ndarray) -> float:
        """Return similarity mass across distinct duplicate groups."""
        values = self.select_unique_topk(similarities, duplicate_group_ids)
        positive = values[values > 0.0]
        return float(np.sum(np.square(np.clip(positive, 0.0, 1.0)))) if positive.size else 0.0


def build_gallery_calibration(
    embeddings: np.ndarray,
    subject_ids: np.ndarray,
    duplicate_group_ids: np.ndarray,
    top_k: int,
) -> GalleryCalibration:
    """Build leave-one-out distributions without same-subject or duplicate matches."""
    matrix = np.asarray(embeddings, dtype=np.float32)
    subjects = np.asarray(subject_ids).astype(str).reshape(-1)
    groups = np.asarray(duplicate_group_ids, dtype=np.int32).reshape(-1)
    if matrix.ndim != 2:
        raise ValueError("embeddings must be a two-dimensional matrix.")
    if matrix.shape[0] != subjects.size or subjects.size != groups.size:
        raise ValueError("embeddings, subject_ids and duplicate_group_ids must have the same length.")
    if top_k < 1:
        raise ValueError("top_k must be at least one.")

    normalized = matrix / np.maximum(np.linalg.norm(matrix, axis=1, keepdims=True), 1e-12)
    calibration = GalleryCalibration(
        impostor_max_scores=np.empty(0, dtype=np.float32),
        topk_leave_one_out_scores=np.empty(0, dtype=np.float32),
        density_leave_one_out_scores=np.empty(0, dtype=np.float32),
        top_k=int(top_k),
    )
    maxima: list[float] = []
    topk_scores: list[float] = []
    densities: list[float] = []

    for index in range(normalized.shape[0]):
        similarities = normalized[index] @ normalized.T
        eligible = (subjects != subjects[index]) & (groups != groups[index])
        eligible_values = similarities[eligible]
        eligible_groups = groups[eligible]
        if eligible_values.size == 0:
            continue
        maxima.append(float(np.max(eligible_values)))
        topk_scores.append(calibration.weighted_topk(eligible_values, eligible_groups))
        densities.append(calibration.density(eligible_values, eligible_groups))

    return GalleryCalibration(
        impostor_max_scores=np.asarray(maxima, dtype=np.float32),
        topk_leave_one_out_scores=np.asarray(topk_scores, dtype=np.float32),
        density_leave_one_out_scores=np.asarray(densities, dtype=np.float32),
        top_k=int(top_k),
    )
