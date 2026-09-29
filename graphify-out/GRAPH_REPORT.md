# Graph Report - site-goosley  (2026-09-29)

## Corpus Check
- 140 files · ~751,686 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1141 nodes · 2362 edges · 73 communities (57 shown, 16 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9623ade4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- services.ts
- cli.py
- experiment_runner.py
- GallerySimilarityScorer
- ArtifactBundle
- scripts
- Goosley Digital — Agent Guide
- target_rules.py
- compilerOptions
- index.ts
- devDependencies
- page-auth.ts
- types.ts
- PortalPages.tsx
- worker/package.json
- PortalForms.tsx
- app/layout.tsx
- CriminalidadeFacialExperience.tsx
- build_gallery_calibration
- store.ts
- compilerOptions
- container_api.py
- bootstrap_ci.py
- decompose_variance
- Meu Portal Implementation Notes
- email.ts
- PortalEntry.tsx
- people.ts
- not-found.tsx
- write-portal-seed-sql.ts
- server.mjs
- PortalShell.tsx
- cosine_similarity_groups
- next.config.ts
- criminalidadefacial-profile.ts
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
- CriminalidadeFacialClient.tsx
- Criminalidade Facial Mobile — Especificação
- Review Focus
- reference-handler.ts
- score-handler.ts
- generate-people-data.mjs
- admin/[section]/page.tsx
- useImmersiveMode.ts
- criminalidadefacial/layout.tsx
- galleryData.ts
- progress.md

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 53 edges
2. `handleAdmin()` - 36 edges
3. `GallerySimilarityScorer` - 34 edges
4. `ArtifactBundle` - 31 edges
5. `nowIso()` - 31 edges
6. `requireRole()` - 26 edges
7. `handleAuth()` - 25 edges
8. `handleClient()` - 25 edges
9. `handleProgrammer()` - 25 edges
10. `asRecord()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `actors()` --calls--> `resetPortalDatabaseForTests()`  [EXTRACTED]
  tests/portal.test.ts → src/server/portal/store.ts
- `ImageScorer` --uses--> `GallerySimilarityScorer`  [INFERRED]
  criminalidadefacial-service/container_api.py → criminalidadefacial-service/serve_similarity_app.py
- `AppHandler` --uses--> `ScoreCalibrator`  [INFERRED]
  criminalidadefacial-service/serve_similarity_app.py → criminalidadefacial-service/face_profile_ml/calibration.py
- `GalleryScoreWeights` --uses--> `ScoreCalibrator`  [INFERRED]
  criminalidadefacial-service/serve_similarity_app.py → criminalidadefacial-service/face_profile_ml/calibration.py
- `GallerySimilarityScorer` --uses--> `ScoreCalibrator`  [INFERRED]
  criminalidadefacial-service/serve_similarity_app.py → criminalidadefacial-service/face_profile_ml/calibration.py

## Import Cycles
- None detected.

## Communities (73 total, 16 thin omitted)

### Community 0 - "services.ts"
Cohesion: 0.06
Nodes (134): AdminRouteContext, DELETE(), dynamic, GET(), PATCH(), POST(), AuthRouteContext, dynamic (+126 more)

### Community 1 - "cli.py"
Cohesion: 0.06
Nodes (59): ArgumentParser, ndarray, Path, ScoreCalibrator, add_feature_args(), build_parser(), cmd_audit_fairness(), cmd_calibrate() (+51 more)

### Community 2 - "experiment_runner.py"
Cohesion: 0.06
Nodes (53): BackendFactory, AgglomerativeBackend, build_backend(), ClusteringBackend, FittedClustering, GMMBackend, KMeansBackend, MiniBatchKMeansBackend (+45 more)

### Community 3 - "GallerySimilarityScorer"
Cohesion: 0.07
Nodes (25): ArcFaceEmbedder, InsightFace ArcFace extractor. The pretrained neural model is used only for…, select_available_providers(), AppHandler, _clamp(), compose_white_background(), encode_preview_jpeg(), GalleryScoreWeights (+17 more)

### Community 4 - "ArtifactBundle"
Cohesion: 0.11
Nodes (21): ArtifactBundle, BundleValidation, CompletionResult, Any, DataFrame, Path, Atomic, integrity-checked artifact bundles for experiment outputs., Append an explicit, hashed failure classification to ``failures.csv``. (+13 more)

### Community 5 - "scripts"
Cohesion: 0.04
Nodes (44): clsx, compression, framer-motion, lucide-react, next, nodemailer, @opennextjs/cloudflare, dependencies (+36 more)

### Community 6 - "Goosley Digital — Agent Guide"
Cohesion: 0.05
Nodes (38): 1.1 Services Offered, 1.2 Brand Identity, 1.3 Target Market, 1. Company Overview, 2.1 Public Commercial Site, 2.2 Client Portal ("Meu Portal"), 2. Website Architecture, 3.1 Core (+30 more)

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

### Community 11 - "page-auth.ts"
Cohesion: 0.17
Nodes (16): AdminPortalPage(), ClientPortalPage(), ClientPortalSectionPage(), ClientSectionContext, sections, titleFor(), DeveloperPortalPage(), DeveloperPortalSectionPage() (+8 more)

### Community 12 - "types.ts"
Cohesion: 0.08
Nodes (25): AuditLog, Budget, ClientProfile, Conversation, ConversationType, GitHubRepository, Message, Notification (+17 more)

### Community 13 - "PortalPages.tsx"
Cohesion: 0.13
Nodes (14): AdminPortalContent(), date(), MessageList(), MiniCalendar(), money(), paymentOptions, priorityOptions, solutionCards (+6 more)

### Community 14 - "worker/package.json"
Cohesion: 0.10
Nodes (20): @cloudflare/containers, @cloudflare/workers-types, dependencies, @cloudflare/containers, devDependencies, @cloudflare/workers-types, tsx, @types/node (+12 more)

### Community 15 - "PortalForms.tsx"
Cohesion: 0.13
Nodes (15): cn(), CostEstimator(), EstimatorInner(), ActionForm(), defaultSelectionsFor(), Field, money(), PortalProjectEstimator() (+7 more)

### Community 16 - "app/layout.tsx"
Cohesion: 0.13
Nodes (14): lenis, lenis, dancingScript, inter, metadata, RootLayout(), manifest(), CustomCursor() (+6 more)

### Community 17 - "CriminalidadeFacialExperience.tsx"
Cohesion: 0.13
Nodes (18): CriminalidadeFacialExperience(), loadingMessages, normalize(), percent(), Step, acceptedPhotoTypes, actionableErrors, errorMessage() (+10 more)

### Community 18 - "build_gallery_calibration"
Cohesion: 0.18
Nodes (11): build_gallery_calibration(), GalleryCalibration, ndarray, Empirical, duplicate-safe calibration for gallery similarity scores., Leave-one-out reference distributions derived from one gallery release., Return the empirical CDF percentage for ``value`` or ``None`` when absent., Return the empirical upper tail of leave-one-out impostor maxima., Select the highest similarity for each duplicate group, in descending order. (+3 more)

### Community 19 - "store.ts"
Cohesion: 0.22
Nodes (14): db, createSeedDatabase(), D1DatabaseBinding, D1Result, D1Statement, defaultSettings(), ensurePortalStateTable(), getD1Binding() (+6 more)

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

### Community 24 - "Meu Portal Implementation Notes"
Cohesion: 0.20
Nodes (9): Cloudflare Direction, Current Persistence Note, Important Routes, Local Seed Users, Main Pages, Meu Portal Implementation Notes, Required Environment Variables, Verification (+1 more)

### Community 25 - "email.ts"
Cohesion: 0.33
Nodes (8): POST(), EmailInput, getCloudflareEmailBinding(), getEnvVar(), parseEmailFrom(), sendEmail(), SendEmailBinding, sendPasswordResetEmail()

### Community 26 - "PortalEntry.tsx"
Cohesion: 0.28
Nodes (3): buttonLabel(), Mode, PortalEntry()

### Community 27 - "people.ts"
Cohesion: 0.14
Nodes (20): POST(), responseHeaders, runtime, POST(), responseHeaders, runtime, CriminalidadeFacialPage(), metadata (+12 more)

### Community 28 - "not-found.tsx"
Cohesion: 0.32
Nodes (3): metadata, ErrorState(), ErrorStateProps

### Community 29 - "write-portal-seed-sql.ts"
Cohesion: 0.29
Nodes (6): admin, db, escapedSnapshot, escapedTimestamp, outputPath, timestamp

### Community 30 - "server.mjs"
Cohesion: 0.33
Nodes (5): app, compress, handle, port, production

### Community 31 - "PortalShell.tsx"
Cohesion: 0.18
Nodes (9): Home(), HoverReveal, InfiniteMarquee, Hero(), navByRole, NavItem, PortalTopActions(), SafeUser (+1 more)

### Community 32 - "cosine_similarity_groups"
Cohesion: 0.40
Nodes (4): cosine_similarity_groups(), ndarray, Identity-group reconstruction from cosine-similarity connected components., Return component identifiers for edges whose cosine similarity meets threshold.

### Community 33 - "next.config.ts"
Cohesion: 0.40
Nodes (3): csp, facialApiOrigin, nextConfig

### Community 34 - "criminalidadefacial-profile.ts"
Cohesion: 0.22
Nodes (14): buildProfileSections(), cleanLabel(), cleanValue(), familyStartIndex(), maskLastTwoDigits(), parseChunkItems(), ParsedPersonSource, parsePersonSourceLine() (+6 more)

### Community 62 - "CriminalidadeFacialClient.tsx"
Cohesion: 0.20
Nodes (10): AppStep, CriminalidadeFacialClient(), LOADING_STAGES, percent(), DISPLAY_FIELDS, findPerson(), PEOPLE, PersonProfile (+2 more)

### Community 63 - "Criminalidade Facial Mobile — Especificação"
Cohesion: 0.18
Nodes (10): Arquitetura, Criminalidade Facial Mobile — Especificação, Dados do perfil, Estados de erro, Experiência imersiva, Fluxo, Fora de escopo, Objetivo (+2 more)

### Community 64 - "Review Focus"
Cohesion: 0.20
Nodes (9): Criminalidade Facial Mobile Implementation Plan, Global Constraints, Review Focus, Task 1: Fonte server-only e projeção de perfis, Task 2: Rotas de desafio e confirmação, Task 3: ArcFace obrigatório e contêiner inicializável, Task 4: Fluxo móvel, galeria e painéis retráteis, Task 5: Experiência PWA fullscreen (+1 more)

### Community 65 - "reference-handler.ts"
Cohesion: 0.27
Nodes (7): GET, runtime, FetchLike, createReferenceHandler(), jsonError(), ReferenceContext, ReferenceHandlerOptions

### Community 66 - "score-handler.ts"
Cohesion: 0.36
Nodes (7): POST, runtime, ALLOWED_CONTENT_TYPES, createScoreHandler(), errorResponse(), isPublicScoreResponse(), ScoreHandlerOptions

### Community 67 - "generate-people-data.mjs"
Cohesion: 0.33
Nodes (6): parseLine(), records, root, slugify(), sourcePath, targetPath

### Community 68 - "admin/[section]/page.tsx"
Cohesion: 0.50
Nodes (4): AdminPortalSectionPage(), AdminSectionContext, sections, titleFor()

### Community 69 - "useImmersiveMode.ts"
Cohesion: 0.60
Nodes (3): useImmersiveMode(), FullscreenDocument, requestImmersiveFullscreen()

## Knowledge Gaps
- **288 isolated node(s):** `face-profile-ml`, `name`, `private`, `type`, `test` (+283 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GallerySimilarityScorer` connect `GallerySimilarityScorer` to `cli.py`, `container_api.py`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `FaceProfileModel` connect `cli.py` to `GallerySimilarityScorer`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `dependencies` connect `scripts` to `app/layout.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `GallerySimilarityScorer` (e.g. with `ImageScorer` and `ScoreCalibrator`) actually correct?**
  _`GallerySimilarityScorer` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `face-profile-ml`, `name`, `private` to the rest of the system?**
  _288 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `services.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05840740068927988 - nodes in this community are weakly interconnected._
- **Should `cli.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06111111111111111 - nodes in this community are weakly interconnected._