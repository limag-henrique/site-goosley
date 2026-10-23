# Graph Report - site-goosley  (2026-10-23)

## Corpus Check
- 132 files · ~770,376 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 977 nodes · 1679 edges · 63 communities (46 shown, 17 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3f453b32`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cloudflare-env.d.ts
- cli.py
- experiment_runner.py
- GallerySimilarityScorer
- ArtifactBundle
- scripts
- 1. Company Overview
- target_rules.py
- compilerOptions
- index.ts
- devDependencies
- lib/research-portal.ts
- Faixas comerciais do simulador
- Piloto de avaliação musical — 12 gravações
- worker/package.json
- CriminalidadeFacialExperience.tsx
- CostEstimator.tsx
- split-portal-lyrics.py
- build_gallery_calibration
- compilerOptions
- container_api.py
- bootstrap_ci.py
- decompose_variance
- email.ts
- anti-screenshot.ts
- criminalidadefacial-profile.ts
- not-found.tsx
- server.mjs
- app/page.tsx
- cosine_similarity_groups
- next.config.ts
- export-research-portal.py
- quiz/page.tsx
- Serviço de similaridade facial do Goosley
- a-solucao/page.tsx
- contato/page.tsx
- HoverReveal.tsx
- InfiniteMarquee.tsx
- __init__.py
- eslint.config.mjs
- open-next.config.ts
- postcss.config.mjs
- README.md
- marketing-ctas.test.ts
- face-profile-ml
- Criminalidade Facial Mobile — Especificação
- Review Focus
- generate-people-data.mjs
- criminalidadefacial/layout.tsx
- galleryData.ts
- progress.md

## God Nodes (most connected - your core abstractions)
1. `GallerySimilarityScorer` - 34 edges
2. `ArtifactBundle` - 31 edges
3. `scripts` - 18 edges
4. `run_specifications()` - 17 edges
5. `ArcFaceEmbedder` - 16 edges
6. `FaceProfileModel` - 16 edges
7. `compilerOptions` - 16 edges
8. `PortalService` - 15 edges
9. `FitSpec` - 14 edges
10. `write_json()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `ImageScorer` --uses--> `GallerySimilarityScorer`  [INFERRED]
  criminalidadefacial-service/container_api.py → criminalidadefacial-service/serve_similarity_app.py
- `AppHandler` --uses--> `ScoreCalibrator`  [INFERRED]
  criminalidadefacial-service/serve_similarity_app.py → criminalidadefacial-service/face_profile_ml/calibration.py
- `GallerySimilarityScorer` --uses--> `ScoreCalibrator`  [INFERRED]
  criminalidadefacial-service/serve_similarity_app.py → criminalidadefacial-service/face_profile_ml/calibration.py
- `SimilarityScorer` --uses--> `ScoreCalibrator`  [INFERRED]
  criminalidadefacial-service/serve_similarity_app.py → criminalidadefacial-service/face_profile_ml/calibration.py
- `SimilarityThresholds` --uses--> `ScoreCalibrator`  [INFERRED]
  criminalidadefacial-service/serve_similarity_app.py → criminalidadefacial-service/face_profile_ml/calibration.py

## Import Cycles
- None detected.

## Communities (63 total, 17 thin omitted)

### Community 0 - "cloudflare-env.d.ts"
Cohesion: 0.36
Nodes (7): __BaseEnv_ResearchPortalEnv, Cloudflare, Env, NodeJS, ProcessEnv, ResearchPortalEnv, StringifyValues

### Community 1 - "cli.py"
Cohesion: 0.06
Nodes (63): ArgumentParser, ndarray, Path, ScoreCalibrator, add_feature_args(), build_parser(), cmd_audit_fairness(), cmd_calibrate() (+55 more)

### Community 2 - "experiment_runner.py"
Cohesion: 0.06
Nodes (53): BackendFactory, AgglomerativeBackend, build_backend(), ClusteringBackend, FittedClustering, GMMBackend, KMeansBackend, MiniBatchKMeansBackend (+45 more)

### Community 3 - "GallerySimilarityScorer"
Cohesion: 0.07
Nodes (21): AppHandler, _clamp(), compose_white_background(), encode_preview_jpeg(), GallerySimilarityScorer, _grabcut_person_mask(), keep_component_near_face(), main() (+13 more)

### Community 4 - "ArtifactBundle"
Cohesion: 0.11
Nodes (21): ArtifactBundle, BundleValidation, CompletionResult, Any, DataFrame, Path, Atomic, integrity-checked artifact bundles for experiment outputs., Append an explicit, hashed failure classification to ``failures.csv``. (+13 more)

### Community 5 - "scripts"
Cohesion: 0.05
Nodes (42): clsx, compression, framer-motion, lucide-react, next, nodemailer, @opennextjs/cloudflare, dependencies (+34 more)

### Community 6 - "1. Company Overview"
Cohesion: 0.20
Nodes (9): 1.1 Services Offered, 1.2 Brand Identity, 1.3 Target Market, 1. Company Overview, 2.1 Public Commercial Site, 2. Website Architecture, Engineering conventions, Goosley Digital — Agent Guide (+1 more)

### Community 7 - "target_rules.py"
Cohesion: 0.10
Nodes (34): ArrayTransform, construct_endogenous_pipeline(), EndogenousProposition, _jaccard(), measure_separability_vs_validity(), PropositionResult, ndarray, Constructive demonstration of separability without construct validity. (+26 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (29): criminalidadefacial-service/worker/**, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+21 more)

### Community 9 - "index.ts"
Cohesion: 0.11
Nodes (25): FaceSimilarityContainer, consumeRateLimit(), corsHeaders(), DEFAULT_ALLOWED_ORIGINS, Fetchable, forwardScore(), GalleryRelease, handleReference() (+17 more)

### Community 10 - "devDependencies"
Cohesion: 0.07
Nodes (27): @emnapi/core, @emnapi/runtime, eslint, eslint-config-next, devDependencies, @emnapi/core, @emnapi/runtime, eslint (+19 more)

### Community 11 - "lib/research-portal.ts"
Cohesion: 0.05
Nodes (52): dynamic, failure(), GET(), headers, POST(), metadata, Action, download() (+44 more)

### Community 12 - "Faixas comerciais do simulador"
Cohesion: 0.40
Nodes (4): Decisões, Faixas comerciais do simulador, Referências públicas consultadas, Verificação

### Community 13 - "Piloto de avaliação musical — 12 gravações"
Cohesion: 0.06
Nodes (28): Chave privada de edição e congelamento do piloto, Consulta opcional antes de preencher — decisão posterior de 22/10/2026, Critérios de aceite, Download comparativo — 23/10/2026, Evidências da simplificação, Fluxo simplificado das avaliadoras — 22/10/2026, Limites, Piloto de avaliação musical — 12 gravações (+20 more)

### Community 14 - "worker/package.json"
Cohesion: 0.10
Nodes (20): @cloudflare/containers, @cloudflare/workers-types, dependencies, @cloudflare/containers, devDependencies, @cloudflare/workers-types, tsx, @types/node (+12 more)

### Community 15 - "CriminalidadeFacialExperience.tsx"
Cohesion: 0.07
Nodes (38): POST, runtime, AppStep, CriminalidadeFacialClient(), LOADING_STAGES, percent(), CriminalidadeFacialExperience(), loadingMessages (+30 more)

### Community 16 - "CostEstimator.tsx"
Cohesion: 0.07
Nodes (31): lenis, lenis, dancingScript, inter, metadata, RootLayout(), manifest(), metadata (+23 more)

### Community 17 - "split-portal-lyrics.py"
Cohesion: 0.67
Nodes (3): literal(), Keep authorized frozen lyrics in private D1, out of the Worker bundle., split_dataset()

### Community 18 - "build_gallery_calibration"
Cohesion: 0.18
Nodes (11): build_gallery_calibration(), GalleryCalibration, ndarray, Empirical, duplicate-safe calibration for gallery similarity scores., Leave-one-out reference distributions derived from one gallery release., Return the empirical CDF percentage for ``value`` or ``None`` when absent., Return the empirical upper tail of leave-one-out impostor maxima., Select the highest similarity for each duplicate group, in descending order. (+3 more)

### Community 20 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, lib, module, moduleResolution, skipLibCheck, strict, target, types (+7 more)

### Community 21 - "container_api.py"
Cohesion: 0.16
Nodes (11): create_handler(), create_scorer(), ImageScorer, main(), parse_args(), BaseHTTPRequestHandler, Namespace, Protocol (+3 more)

### Community 22 - "bootstrap_ci.py"
Cohesion: 0.33
Nodes (10): bootstrap_auc(), bootstrap_grouped_fold_metric(), bootstrap_metric(), BootstrapResult, _jaccard(), _metric_function(), ndarray, Paired, reproducible bootstrap confidence intervals for OOF metrics. (+2 more)

### Community 23 - "decompose_variance"
Cohesion: 0.31
Nodes (9): decompose_variance(), _design(), DataFrame, ndarray, Fixed-effect variance decomposition for replicated experiment summaries., Estimate each fixed factor's marginal contribution via reduced models., _sse(), VarianceComponent (+1 more)

### Community 25 - "email.ts"
Cohesion: 0.36
Nodes (7): POST(), EmailInput, getCloudflareEmailBinding(), getEnvVar(), parseEmailFrom(), sendEmail(), SendEmailBinding

### Community 26 - "anti-screenshot.ts"
Cohesion: 0.39
Nodes (6): AntiScreenshotShield(), ANTI_SCREENSHOT_MESSAGE, ANTI_SCREENSHOT_WATERMARK_TEXT, attemptWipeClipboard(), isScreenshotKey(), KeyboardEventLike

### Community 27 - "criminalidadefacial-profile.ts"
Cohesion: 0.07
Nodes (42): POST(), responseHeaders, runtime, POST(), responseHeaders, runtime, GET, runtime (+34 more)

### Community 28 - "not-found.tsx"
Cohesion: 0.32
Nodes (3): metadata, ErrorState(), ErrorStateProps

### Community 30 - "server.mjs"
Cohesion: 0.33
Nodes (5): app, compress, handle, port, production

### Community 31 - "app/page.tsx"
Cohesion: 0.40
Nodes (3): HoverReveal, InfiniteMarquee, Hero()

### Community 32 - "cosine_similarity_groups"
Cohesion: 0.40
Nodes (4): cosine_similarity_groups(), ndarray, Identity-group reconstruction from cosine-similarity connected components., Return component identifiers for edges whose cosine similarity meets threshold.

### Community 33 - "next.config.ts"
Cohesion: 0.40
Nodes (3): csp, facialApiOrigin, nextConfig

### Community 63 - "Criminalidade Facial Mobile — Especificação"
Cohesion: 0.18
Nodes (10): Arquitetura, Criminalidade Facial Mobile — Especificação, Dados do perfil, Estados de erro, Experiência imersiva, Fluxo, Fora de escopo, Objetivo (+2 more)

### Community 64 - "Review Focus"
Cohesion: 0.20
Nodes (9): Criminalidade Facial Mobile Implementation Plan, Global Constraints, Review Focus, Task 1: Fonte server-only e projeção de perfis, Task 2: Rotas de desafio e confirmação, Task 3: ArcFace obrigatório e contêiner inicializável, Task 4: Fluxo móvel, galeria e painéis retráteis, Task 5: Experiência PWA fullscreen (+1 more)

### Community 67 - "generate-people-data.mjs"
Cohesion: 0.33
Nodes (6): parseLine(), records, root, slugify(), sourcePath, targetPath

## Knowledge Gaps
- **242 isolated node(s):** `Cloudflare`, `NodeJS`, `face-profile-ml`, `name`, `private` (+237 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GallerySimilarityScorer` connect `GallerySimilarityScorer` to `cli.py`, `container_api.py`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `dependencies` connect `scripts` to `CostEstimator.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `GallerySimilarityScorer` (e.g. with `ImageScorer` and `ScoreCalibrator`) actually correct?**
  _`GallerySimilarityScorer` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Cloudflare`, `NodeJS`, `face-profile-ml` to the rest of the system?**
  _242 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cli.py` be split into smaller, more focused modules?**
  _Cohesion score 0.057729138166894664 - nodes in this community are weakly interconnected._
- **Should `experiment_runner.py` be split into smaller, more focused modules?**
  _Cohesion score 0.060764587525150904 - nodes in this community are weakly interconnected._
- **Should `GallerySimilarityScorer` be split into smaller, more focused modules?**
  _Cohesion score 0.0701484895033282 - nodes in this community are weakly interconnected._