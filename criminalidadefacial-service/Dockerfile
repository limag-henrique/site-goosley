FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app
COPY pyproject.toml README.md ./
COPY face_profile_ml ./face_profile_ml
COPY serve_similarity_app.py container_api.py container-requirements.txt ./
COPY artifacts/embedding_manifest.csv artifacts/embeddings.npy ./artifacts/

RUN pip install --no-cache-dir -r container-requirements.txt && useradd --create-home appuser

USER appuser
RUN python -c "from insightface.app import FaceAnalysis; app = FaceAnalysis(name='buffalo_l', allowed_modules=['detection', 'recognition'], providers=['CPUExecutionProvider']); app.prepare(ctx_id=-1, det_size=(320, 320))"

EXPOSE 8080
CMD ["python", "container_api.py"]
