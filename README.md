# ProjectMatch — Build Specification

This document is a complete, unambiguous specification for building ProjectMatch. It is written to be handed to a coding agent (or followed manually) with no further clarification needed on scope or flow. If you're using an agentic IDE/tool, feed this file to it as the primary context document before generating code.

---

## 1. What this app is

A platform for a university department's final-year project cycle, replacing manual Google Forms/spreadsheets with a structured system where:
- Faculty submit project ideas into a shared pool.
- Students either pick a pool idea or propose their own, form a team, and submit for approval.
- Admin approves teams and assigns leftover unmatched students.
- Once approved, each team gets a private workspace with their mentor.

AI is used only for one thing: ranking pool ideas by semantic similarity to a student's stated skills/interests (recommendation), via text-embedding + cosine similarity. It is not used for anything else in v1.

---

## 2. Roles

| Role | Can do |
|---|---|
| **Student** | Register/login. View idea pool with AI-ranked recommendations. Select a pool idea, OR propose own idea + request a specific faculty as mentor. Create/join a team (add teammates by name/email). Submit team for admin approval. Once approved: access team workspace (discussion, files, milestones, meetings). |
| **Faculty** | Register/login. Submit/edit/delete project ideas into the pool. View and accept/reject incoming mentor requests for self-proposed ideas. Once mentoring a team: full access to that team's workspace, can set milestones and meeting times. |
| **Admin** | View all ideas, all teams, all statuses. Approve or reject submitted teams. View unmatched students after the formation window closes and manually assign them to a team + idea + mentor. Open/close the team-formation window. |

---

## 3. Full state machine (must be implemented exactly as described)

### 3.1 Idea (Project) states
```
For pool ideas (submitted by faculty):
  active → (student selects it) → used in a team submission

For self-proposed ideas (submitted by student):
  pending_mentor_review
    → mentor_accepted   (proceeds to team formation)
    → mentor_rejected   (student must pick a different mentor or a pool idea)
```

### 3.2 Team states
```
forming              — student is adding teammates, idea not yet locked
pending_admin_approval — student has submitted the team + idea (+ mentor, if self-proposed and mentor_accepted)
approved             — admin approved; mentor workspace unlocks
rejected             — admin rejected; team returns to "forming" with a rejection note
unassigned_pool      — student never joined/submitted a team by window close; admin assigns manually
```

### 3.3 Rules enforced by the backend, not just the UI
- A team **cannot** reach `pending_admin_approval` if it references a self-proposed idea whose mentor status is not `mentor_accepted`.
- A student cannot be a member of more than one team at a time.
- Admin approval requires both team AND idea to be in a valid combined state — validate server-side, do not trust client state.
- Mentor workspace routes must check that the requesting user is either a member of that specific team, its assigned mentor, or an admin. Reject all others with 403.

---

## 4. Data models (MongoDB / Mongoose)

```js
// User
{
  _id,
  name: String,
  email: String,
  passwordHash: String,
  role: { type: String, enum: ["student", "faculty", "admin"] },
  skills: [String],
  interests: [String],
  profileEmbedding: [Number],   // generated once when skills/interests are saved
  createdAt: Date
}

// Project (an "idea")
{
  _id,
  title: String,
  description: String,
  domainTags: [String],
  teamSizeMax: Number,
  capacity: Number,
  source: { type: String, enum: ["faculty_pool", "student_proposed"] },
  createdBy: ObjectId,          // ref User (faculty, or student if self-proposed)
  requestedMentor: ObjectId,    // ref User, faculty — only set if source = student_proposed
  mentorStatus: {
    type: String,
    enum: ["not_applicable", "pending_mentor_review", "mentor_accepted", "mentor_rejected"],
    default: "not_applicable"
  },
  descriptionEmbedding: [Number],
  createdAt: Date
}

// Team
{
  _id,
  project: ObjectId,            // ref Project
  members: [ObjectId],          // ref User (students)
  mentor: ObjectId,              // ref User (faculty) — set once project.mentorStatus resolves or pool idea selected
  status: {
    type: String,
    enum: ["forming", "pending_admin_approval", "approved", "rejected", "unassigned_pool"],
    default: "forming"
  },
  rejectionNote: String,
  createdAt: Date
}

// WorkspaceMessage (discussion thread)
{
  _id,
  team: ObjectId,
  author: ObjectId,
  text: String,
  createdAt: Date
}

// WorkspaceFile
{
  _id,
  team: ObjectId,
  uploadedBy: ObjectId,
  filename: String,
  url: String,               // storage URL (see section 7 on file storage)
  createdAt: Date
}

// Milestone
{
  _id,
  team: ObjectId,
  title: String,
  dueDate: Date,
  status: { type: String, enum: ["pending", "done"], default: "pending" },
  setBy: ObjectId              // mentor
}

// Meeting
{
  _id,
  team: ObjectId,
  scheduledFor: Date,
  setBy: ObjectId,
  note: String
}
```

---

## 5. API routes

```
Auth
POST   /api/auth/register              { name, email, password, role }
POST   /api/auth/login                 { email, password } → { token }

Ideas / Projects
POST   /api/projects                   faculty only — creates pool idea, triggers embedding
POST   /api/projects/propose           student only — creates student_proposed idea, status=pending_mentor_review
GET    /api/projects                   list (filterable by source/status)
GET    /api/projects/recommended       student only — ranked pool ideas by cosine similarity to profileEmbedding
PATCH  /api/projects/:id/mentor-decision   faculty only — { decision: "accept" | "reject" }
PUT    /api/projects/:id               faculty only, own project — edit (re-embeds on description change)
DELETE /api/projects/:id               faculty only, own project

Profile
PUT    /api/users/me/profile           student — { skills, interests }, triggers embedding

Teams
POST   /api/teams                      student — create team around a chosen project
POST   /api/teams/:id/members          student — add teammate by email
POST   /api/teams/:id/submit           student — moves team to pending_admin_approval (validates mentor state server-side)
GET    /api/teams/:id
GET    /api/teams/mine                 student — current user's team

Admin
GET    /api/admin/teams                all teams with status filter
PATCH  /api/admin/teams/:id/approve
PATCH  /api/admin/teams/:id/reject     { note }
GET    /api/admin/unassigned-students  students with no team after window close
POST   /api/admin/assign               { studentIds, projectId, mentorId } — manual team creation
PATCH  /api/admin/window               { open: Boolean } — control formation window

Workspace (all routes require team membership, assigned mentor, or admin)
GET    /api/teams/:id/messages
POST   /api/teams/:id/messages
GET    /api/teams/:id/files
POST   /api/teams/:id/files
GET    /api/teams/:id/milestones
POST   /api/teams/:id/milestones        mentor only
PATCH  /api/teams/:id/milestones/:mid   mark done — team member or mentor
GET    /api/teams/:id/meetings
POST   /api/teams/:id/meetings          mentor only
```

---

## 6. Matching logic (implement exactly this way)

Do NOT call the embeddings API at query time. Embeddings are generated once and cached.

1. On `PUT /api/users/me/profile`, concatenate `skills.join(", ") + ". " + interests.join(", ")` into one string, send to the embeddings API, store result in `profileEmbedding`.
2. On `POST /api/projects` (and on edit if `description` changes), embed `title + ". " + description`, store in `descriptionEmbedding`.
3. On `GET /api/projects/recommended`, fetch the student's `profileEmbedding` and all `active` pool projects. Compute cosine similarity in plain JS (no external call):

```js
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
Sort descending, return top N (e.g. 10).

4. **Fallback**: if the embeddings API call fails at write time, store `profileEmbedding: null` / `descriptionEmbedding: null` and fall back to plain keyword overlap between `interests`/`domainTags` for that record until it's retried. Do not let a failed embedding call block profile save or project creation.

---

## 7. Tech stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Data fetching | React Query |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Testing | Jest for `backend/` (unit/integration — auth middleware, matching logic). Playwright for `frontend/e2e/` (cross-portal flows, e.g. faculty accepts a mentor request and it reflects on the student side). |
| Embeddings | OpenAI `text-embedding-3-small` or Gemini `text-embedding-004` |
| File storage | For v1, store files via a simple upload to a service like Cloudinary or S3-compatible storage; store only the returned URL in `WorkspaceFile.url`. Do not build custom file storage. |
| Deployment | Three separate Vercel projects (one per app), each with root directory `frontend/student-frontend`, `frontend/faculty-frontend`, or `frontend/admin-frontend`. Backend → Render, root directory `backend/` (single instance, serves all three). DB → MongoDB Atlas. |

---

## 8. Environment variables (`backend/.env`)

```
PORT=5000
MONGO_URI=
JWT_SECRET=
EMBEDDINGS_API_KEY=
EMBEDDINGS_PROVIDER=openai        # or "gemini"
FILE_STORAGE_URL=                 # e.g. Cloudinary URL, if used
CLIENT_URLS=http://localhost:5173,http://localhost:5174,http://localhost:5175   # dev; replace with the three prod domains after deploying
```

`backend/src/middleware/cors.js` reads `CLIENT_URLS`, splits on comma, and passes the resulting array to the `cors` package's `origin` allowlist — a single `CLIENT_URL` string is no longer enough now that three distinct frontend origins need access.

---

## 9. Folder structure

Following the same pattern as your Omni repo: two top-level folders, `backend/` and `frontend/`. `backend/` is a standalone Node package. `frontend/` is itself an npm-workspaces root containing the three role-based apps plus a shared package and e2e tests — same shape as `admin-frontend` / `broker-frontend` / `customer-frontend` / `worker-frontend` / `shared` / `e2e` in your reference project.

```
projectmatch/
├─ backend/
│  ├─ node_modules/
│  ├─ src/
│  │  ├─ models/          # User.js, Project.js, Team.js, WorkspaceMessage.js, WorkspaceFile.js, Milestone.js, Meeting.js
│  │  ├─ routes/           # one file per resource, matching section 5
│  │  ├─ controllers/
│  │  ├─ services/
│  │  │  ├─ embeddingService.js   # wraps the embeddings API call + fallback
│  │  │  └─ matchingService.js    # cosineSimilarity + ranking
│  │  ├─ middleware/
│  │  │  ├─ auth.js               # verifies JWT, attaches req.user
│  │  │  ├─ requireRole.js        # requireRole("faculty") etc. — blocks a student token from ever calling faculty/admin routes server-side, not just hiding UI
│  │  │  └─ cors.js               # allowlist of the three frontend origins, see section 8
│  │  └─ server.js
│  ├─ scripts/             # one-off scripts — seed data, backfill embeddings, create admin user
│  ├─ scratch/              # local debug/throwaway files, gitignored
│  ├─ .env
│  ├─ jest.config.js        # backend unit/integration tests (matching logic, auth middleware — see section 10 risk note)
│  ├─ package.json
│  └─ package-lock.json
├─ frontend/
│  ├─ node_modules/
│  ├─ student-frontend/     # Vite React app — localhost:5173
│  │  ├─ src/
│  │  │  ├─ pages/ (IdeaPool, ProposeIdea, TeamBuilder, Workspace)
│  │  │  └─ main.jsx
│  │  ├─ vite.config.js     # server.port = 5173
│  │  └─ package.json
│  ├─ faculty-frontend/     # Vite React app — localhost:5174
│  │  ├─ src/
│  │  │  ├─ pages/ (MyIdeas, MentorRequests, Workspace)
│  │  │  └─ main.jsx
│  │  ├─ vite.config.js     # server.port = 5174
│  │  └─ package.json
│  ├─ admin-frontend/       # Vite React app — localhost:5175
│  │  ├─ src/
│  │  │  ├─ pages/ (Dashboard, TeamApprovals, UnassignedStudents, WindowControl)
│  │  │  └─ main.jsx
│  │  ├─ vite.config.js     # server.port = 5175
│  │  └─ package.json
│  ├─ shared/                # "@projectmatch/shared" — imported by all three *-frontend apps
│  │  ├─ src/
│  │  │  ├─ api/              # one fetch/axios wrapper per resource, matching section 5 routes
│  │  │  ├─ context/AuthContext.jsx
│  │  │  ├─ components/       # generic UI primitives reused across portals (Button, Card, Badge, etc.)
│  │  │  └─ constants.js      # API_BASE_URL, shared status enums from section 3
│  │  └─ package.json
│  ├─ e2e/                    # Playwright tests that cross portals — e.g. faculty accepts mentor request → student sees it update
│  ├─ test-results/            # gitignored, playwright output
│  ├─ package.json             # workspace root — workspaces: [student-frontend, faculty-frontend, admin-frontend, shared, e2e]
│  ├─ package-lock.json
│  └─ playwright.config.js
├─ .gitignore
├─ features.md                  # feature spec / role matrix — keep in sync with section 2-3 of this doc
├─ QA_TESTING.md                 # manual test checklist per role, per state transition in section 3
└─ README.md                      # this file
```

**`frontend/package.json` (workspace root):**
```json
{
  "name": "projectmatch-frontend",
  "private": true,
  "workspaces": ["student-frontend", "faculty-frontend", "admin-frontend", "shared", "e2e"],
  "scripts": {
    "dev:student": "npm run dev -w student-frontend",
    "dev:faculty": "npm run dev -w faculty-frontend",
    "dev:admin": "npm run dev -w admin-frontend",
    "dev": "concurrently \"npm:dev:student\" \"npm:dev:faculty\" \"npm:dev:admin\"",
    "test:e2e": "playwright test"
  }
}
```
`backend/` stays a separate package (own `package.json`, own lockfile) run independently — `cd backend && npm run dev` — same as the split in your Omni repo. If you want one command to boot everything, add a thin root `package.json` at `projectmatch/` with a single script: `"dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\""`.

**Why three `*-frontend` apps instead of one shared app with route guards:** a single React app with `/student`, `/faculty`, `/admin` routes is faster to scaffold, but every role's code ships to every user's browser (a student's bundle contains admin panel code, just hidden), and a route-guard bug is client-side only — a student could briefly see admin UI before a redirect fires. Separate apps make that class of bug impossible.

---

## 10. Build order (do not reorder — each step depends on the previous)

0. **Scaffold the repo** — `backend/` as a standalone Node package (src/, jest.config.js, package.json), `frontend/` as an npm-workspaces root containing `student-frontend`, `faculty-frontend`, `admin-frontend` (ports per section 9), plus `shared/` and `e2e/`. Confirm `cd backend && npm run dev` and `cd frontend && npm run dev` both boot cleanly (all three Vite apps on their own ports) before writing any feature code.
1. **Auth + User model** — register/login, JWT middleware, role middleware. Test with Postman before touching frontend.
2. **Faculty: submit/edit/delete pool ideas** — Project model + CRUD routes + basic React pages.
3. **Student profile** — skills/interests form, wired to `embeddingService`.
4. **Recommendations** — `matchingService` + `/api/projects/recommended` + React idea-pool page.
5. **Self-proposed idea + mentor accept/reject flow** — this is the most stateful part; build and test it in isolation with Postman before wiring the UI.
6. **Team formation** — create team, add members, submit for approval. Enforce the server-side validation rule from section 3.3 here.
7. **Admin approval + unassigned-student assignment**.
8. **Mentor workspace** — messages, files, milestones, meetings, with the access-control check from section 3.3.
9. **Polish**: loading/error states, empty states, deployment.

---

## 11. Explicit non-goals for v1

- No idea-deduplication/similarity-flagging between teams (was in the original pitch, cut for MVP — can be added later by reusing `descriptionEmbedding`, comparing all active projects pairwise, flagging pairs above a similarity threshold like 0.85).
- No real-time chat (polling via React Query refetch is sufficient for the discussion thread — no WebSocket needed for v1).
- No file storage built from scratch — use a third-party upload service and store the URL only.
- No calendar integration for meetings — just a stored date/time + note field.