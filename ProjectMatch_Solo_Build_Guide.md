# ProjectMatch — Solo Build Guide

A complete technical roadmap for building ProjectMatch by yourself: system requirements, architecture, database design, API design, the AI matching engine, and a week-by-week plan.

---

## 1. System requirements (your dev machine)

You don't need anything powerful — this is a standard web app, not an ML training job.

| Requirement | Minimum | Recommended |
|---|---|---|
| OS | Windows 10 / macOS / Linux | Any |
| RAM | 8 GB | 16 GB |
| Storage | 5 GB free | 15 GB free (node_modules add up) |
| Node.js | v18 LTS | v20 LTS |
| Internet | Required (LLM API calls, MongoDB Atlas) | — |

**Software to install:**
- Node.js + npm (or pnpm/yarn)
- Git
- VS Code (with ESLint, Prettier, MongoDB extensions)
- MongoDB Compass (GUI to inspect your database)
- Postman or Thunder Client (API testing)
- A free MongoDB Atlas account (cloud database — no local Mongo install needed)
- An OpenAI or Google AI Studio (Gemini) API key

No GPU, no local model hosting — the "AI" part is just API calls to an embeddings endpoint. This keeps the whole project buildable on a laptop.

---

## 2. Architecture (see diagram above)

- **Frontend (React)** — talks to the backend only via REST API, never directly to the database or the LLM API. Keeps your API keys safe (never expose them in frontend code).
- **Backend (Node.js + Express)** — the only thing that holds your MongoDB connection string and LLM API key. Handles auth, business logic, and calls the embeddings API.
- **Database (MongoDB Atlas)** — stores users, projects, teams, and precomputed embedding vectors.
- **LLM embeddings API** — called only twice: once when a project is created/edited (to embed the project description), and once when a student saves their profile (to embed their skills/interests). The resulting vectors are cached in Mongo — you don't call the AI API every time someone views recommendations, only on a similarity calculation which is just math (cosine similarity), no extra API call needed at query time.

This last point matters a lot for a solo build: **you do NOT need to hit the LLM API every time a student searches**. Precompute embeddings once and store them; recommendation queries are pure vector math run on your server, which is fast and free.

---

## 3. Tech stack — specifics

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React (Vite, not Create React App) | Vite is faster to set up and run |
| Styling | Tailwind CSS | Fast to build clean UI solo |
| State/data fetching | React Query (TanStack Query) | Handles loading/error/caching for API calls |
| Backend | Node.js + Express | REST API |
| Database | MongoDB + Mongoose (ODM) | Mongoose gives you schemas/validation |
| Auth | JWT + bcrypt | Role-based: student / faculty / admin |
| AI layer | OpenAI `text-embedding-3-small` or Gemini `text-embedding-004` | Cheap, no training required |
| Similarity math | Cosine similarity (plain JS function) | Runs on your own server, no API call |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas | All have free tiers |

---

## 4. Database schema (MongoDB collections)

```
Users
├─ _id
├─ name, email, passwordHash
├─ role: "student" | "faculty" | "admin"
├─ skills: [String]           // e.g. ["React", "Node.js", "ML"]
├─ interests: [String]
├─ profileEmbedding: [Number] // vector, generated once on save
└─ createdAt

Projects
├─ _id
├─ title, description
├─ domainTags: [String]
├─ teamSizeMax: Number
├─ capacity: Number
├─ createdBy: ObjectId → Users
├─ status: "pending" | "approved" | "rejected"
├─ descriptionEmbedding: [Number] // generated once on create/edit
└─ createdAt

Teams
├─ _id
├─ project: ObjectId → Projects
├─ members: [ObjectId] → Users
├─ status: "forming" | "locked" | "approved"
└─ createdAt

Notifications (optional, for status tracking)
├─ _id
├─ user: ObjectId → Users
├─ message
├─ read: Boolean
└─ createdAt
```

**Why store the embedding vector directly on the document** instead of a separate vector database: at your scale (one department, a few hundred students, a few hundred projects), a Pinecone/Weaviate-style vector DB is overkill. Storing a `[Number]` array field and computing cosine similarity in a JS loop is fast enough (a few hundred comparisons take milliseconds) and keeps your stack simple — one database, not two.

---

## 5. API design (Express routes)

```
Auth
POST   /api/auth/register
POST   /api/auth/login

Projects (faculty/admin)
POST   /api/projects              — create project (triggers embedding generation)
GET    /api/projects               — list all
GET    /api/projects/:id
PUT    /api/projects/:id           — edit (re-embeds if description changes)
DELETE /api/projects/:id
PATCH  /api/projects/:id/status    — approve/reject (admin)

Students
PUT    /api/users/me/profile       — save skills/interests (triggers embedding generation)
GET    /api/users/me/recommendations  — returns ranked projects by similarity

Teams
POST   /api/teams                  — form a team around a project
GET    /api/teams/:id
GET    /api/teams/:id/suggested-members  — complementary skill suggestions
GET    /api/teams/duplicates       — flags teams converging on similar ideas

Admin
GET    /api/admin/dashboard        — aggregated view of all teams/projects/status
```

---

## 6. The AI matching engine — how it actually works

This is the part that sounds like "AI" but is really just three simple steps:

**Step 1 — Embed.** When a student saves their profile, send their skills + interests as one text string to the embeddings API. It returns a vector (an array of ~1500 numbers) representing the meaning of that text. Do the same for every project description when it's created.

**Step 2 — Store.** Save that vector on the User/Project document in Mongo. You do this once per profile/project, not per search.

**Step 3 — Compare.** When a student requests recommendations, pull their `profileEmbedding` and loop over all approved `Projects`, computing cosine similarity between the student's vector and each project's vector. Sort descending. Return the top N.

```javascript
function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
```

**Team formation (complementary skills):** instead of similarity, invert the logic slightly — recommend teammates whose skill *sets* fill gaps in the current team's skill set (e.g. team has 2 frontend devs, suggest students whose profile leans backend/ML). This can be done with simple set-difference logic on the `skills` array rather than embeddings, which is easier to reason about and debug for a solo build.

**Duplicate idea detection:** run cosine similarity between all `Projects.descriptionEmbedding` pairs (or between chosen projects across teams). If similarity is above a threshold (e.g. 0.85), flag it. This reuses the same embedding infrastructure — no new AI logic needed.

---

## 7. Suggested folder structure

```
projectmatch/
├─ client/                # React app (Vite)
│  ├─ src/
│  │  ├─ pages/           # Login, Dashboard, ProjectList, ProfileForm, TeamPage, Admin
│  │  ├─ components/
│  │  ├─ api/             # axios/fetch wrapper functions
│  │  └─ context/         # auth context
├─ server/
│  ├─ models/             # User.js, Project.js, Team.js
│  ├─ routes/
│  ├─ controllers/
│  ├─ services/
│  │  ├─ embeddingService.js   # calls LLM API
│  │  └─ matchingService.js    # cosine similarity, ranking
│  ├─ middleware/          # auth.js (JWT verify + role check)
│  └─ server.js
└─ .env                    # MONGO_URI, JWT_SECRET, OPENAI_API_KEY
```

---

## 8. Solo build order (suggested 6–8 week plan)

Since you're building this alone rather than splitting across 4 members, sequence matters — build the backbone first, add AI last so you're not blocked waiting on API design decisions.

| Week | Focus |
|---|---|
| 1 | Project setup: repo, Express server skeleton, MongoDB Atlas connection, User model + JWT auth (register/login, role-based middleware) |
| 2 | Faculty portal: Project model + CRUD routes + basic React pages to create/list projects |
| 3 | Student profile: skills/interests form, save to Mongo. Wire up embedding generation on save (test with Postman first before UI) |
| 4 | Matching engine: recommendations endpoint using cosine similarity, React page showing ranked project list |
| 5 | Team formation: Team model, join/create team flow, complementary-teammate suggestions |
| 6 | Admin dashboard + status tracking (approve/reject workflow) + duplicate-idea flagging |
| 7 | Polish UI (Tailwind pass), edge cases, error handling, loading states |
| 8 | Deployment (Vercel + Render + Atlas), testing with real faculty project list, demo prep |

Build auth and CRUD first, deploy a bare-bones version early (even week 2), and keep it live on Render/Vercel the whole time — solo projects drift when there's no working deployed version to check progress against.

---

## 9. Cost check (should be near-zero)

- MongoDB Atlas free tier: sufficient for this scale.
- Vercel/Render free tiers: sufficient for a single department deployment.
- Embeddings API: `text-embedding-3-small` (OpenAI) costs a fraction of a cent per profile/project — a few hundred students/projects will cost well under $1 total, since you embed once per profile/project, not per search.

---

## 10. Risks specific to going solo

- **Scope creep** — the pitch lists 6 features; build the recommendation + team formation flow first since that's the core differentiator, and treat duplicate-detection/admin-dashboard as stretch goals if time runs short.
- **AI dependency** — if the LLM API is down or you hit a rate limit, recommendations break. Add a fallback: if the embeddings call fails, fall back to simple keyword/tag matching (compare `domainTags` to student `interests` as plain string overlap) so the app still works.
- **No code review** — since you're alone, write a few basic tests for the matching function (`cosineSimilarity`) and auth middleware, since these are the two places a silent bug is hardest to notice visually.
