# ProjectMatch — Build Specification & Architecture

This document is the complete, updated technical specification for **ProjectMatch**.

---

## 1. What this app is

A platform for a university department's final-year project cycle, replacing manual Google Forms/spreadsheets with a structured system where:
- Faculty submit project ideas into a shared pool.
- Students either pick a pool idea or propose their own, form a team, and submit for approval.
- Admin approves teams and assigns leftover unmatched students.
- Once approved, each team gets a private workspace with their mentor.

AI is used for ranking pool ideas by semantic similarity to a student's stated skills/interests (recommendation), via text-embedding + cosine similarity (`text-embedding-004`).

### 1.1 v1 scope (locked)

**In scope:** School of Engineering & Computing (SOEC) at DBUU, undergraduate programs only: B.Tech CSE, B.Tech AI/ML, B.Tech ECE, B.Tech Civil, B.Tech Mechanical, and BCA. Each program has its own minor-project year and major-project year (see `Program` model, section 4) — e.g. B.Tech: minor in year 3, major in year 4; BCA: minor in year 2, major in year 3.

**Explicitly out of scope for v1** (see section 11 roadmap for when/whether these come later):
- MCA and any other postgraduate program — different project shape (often solo/dissertation), needs different logic, not just config.
- Any school other than SOEC (Pharmacy, Management, Architecture, Agriculture, etc.) — each needs its own matching/team-structure design, not a config change.
- Idea deduplication alerts, real-time chat, calendar integration, notifications — all deferred, see section 11.

---

## 2. Roles

| Role | Can do |
|---|---|
| **Public / Guest** | View Landing Page showcase, system status, and execute direct Single Sign-On (SSO) login into any portal. |
| **Student** | Register/login with a `program` and `currentYear` (see section 4). Idea pool and recommendations are filtered to whichever project level (`minor`/`major`) their program+year makes them eligible for. Select a pool idea, OR propose own idea + request a specific faculty as mentor. Create/join a team (add teammates by name/email). Submit team for admin approval. Once approved: access team workspace (discussion, files, milestones, meetings). |
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
// Program (new — seeded once via script, not user-editable; see section 12)
{
  _id,
  code: String,          // "BTECH_CSE", "BCA" — unique
  name: String,           // "B.Tech Computer Science & Engineering"
  minorYear: Number,      // which year of this program is the minor-project year
  majorYear: Number,      // which year is the major/capstone year
  durationYears: Number   // 4 for B.Tech branches, 3 for BCA — display only
}

// User
{
  _id,
  name: String,
  email: String,
  passwordHash: String,
  role: { type: String, enum: ["student", "faculty", "admin"] },
  program: ObjectId,             // ref Program — required if role === "student"
  currentYear: Number,           // required if role === "student"
  skills: [String],
  interests: [String],
  profileVector: [Number],       // alias: profileEmbedding (generated when profile saved)
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
  targetLevel: { type: String, enum: ["minor", "major"] },  // which project tier this idea is for
  source: { type: String, enum: ["faculty_pool", "student_proposed"] },
  createdBy: ObjectId,          // ref User (faculty, or student if self-proposed)
  requestedMentor: ObjectId,    // ref User, faculty — only set if source = student_proposed
  mentorStatus: {
    type: String,
    enum: ["not_applicable", "pending_mentor_review", "mentor_accepted", "mentor_rejected"],
    default: "not_applicable"
  },
  descriptionVector: [Number],   // alias: descriptionEmbedding
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
  url: String,
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
POST   /api/auth/register              { name, email, password, role, program, currentYear }  — program/currentYear required if role="student"
POST   /api/auth/login                 { email, password } → { token }
GET    /api/auth/me                    { token } → user object

Programs
GET    /api/programs                   public — list all 6 seeded programs, for the registration dropdown

Ideas / Projects
POST   /api/projects                   faculty only — { title, description, domainTags, teamSizeMax, capacity, targetLevel } creates pool idea, triggers embedding
POST   /api/projects/propose           student only — creates student_proposed idea, status=pending_mentor_review, targetLevel inferred from the proposing student's current eligible level
GET    /api/projects                   list (filterable by source/status)
GET    /api/projects/recommended       student only — ranked pool ideas by cosine similarity
PATCH  /api/projects/:id/mentor-decision   faculty only — { decision: "accept" | "reject" }
PUT    /api/projects/:id               faculty only, own project — edit
DELETE /api/projects/:id               faculty only, own project

Profile
PUT    /api/users/me/profile           student — { skills, interests }, triggers embedding

Teams
POST   /api/teams                      student — create team around a chosen project
POST   /api/teams/:id/members          student — add teammate by email
POST   /api/teams/:id/submit           student — moves team to pending_admin_approval
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

## 6. Matching logic

1. On `PUT /api/users/me/profile`, concatenate `skills.join(", ") + ". " + interests.join(", ")`, request vector embeddings from Gemini API (`text-embedding-004`), store result in `profileVector`.
2. On `POST /api/projects` (and edit if description changes), embed `title + ". " + description`, store in `descriptionVector`.
3. On `GET /api/projects/recommended`, first determine the student's eligible project level via their `program` + `currentYear`:

```js
function getStudentProjectLevel(user, program) {
  if (user.currentYear === program.minorYear) return "minor";
  if (user.currentYear === program.majorYear) return "major";
  return null; // not currently in a project year — dashboard should show a "not yet" state, not an empty idea list
}
```
Filter candidate projects to `targetLevel === eligibleLevel` before ranking — a 3rd-year B.Tech student should never see 4th-year major-capstone ideas or vice versa. Then fetch the student's `profileVector` and compute cosine similarity against the filtered set:

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
Sort descending, return top N.

---

## 7. Tech stack

| Layer | Choice |
|---|---|
| **Frontend** | React (Vite) + Vanilla CSS / Glassmorphic UI |
| **Backend** | Node.js + Express 5 (`index.js` entry point) |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | JWT (`jsonwebtoken`) + `bcryptjs` + SSO URL Token Handoff |
| **AI Layer** | Gemini API (`text-embedding-004`) |
| **Monorepo** | npm Workspaces (`landing-frontend`, `student-frontend`, `faculty-frontend`, `admin-frontend`, `shared`, `e2e`) |

---

## 8. Environment variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://.../projectmatch?retryWrites=true&w=majority
JWT_SECRET=projectmatch_super_secret_jwt_key_2026
GEMINI_API_KEY=AQ...
AI_PROVIDER=gemini
GEMINI_MODEL=text-embedding-004

LANDING_CLIENT_URL=http://localhost:5172
STUDENT_CLIENT_URL=http://localhost:5173
FACULTY_CLIENT_URL=http://localhost:5174
ADMIN_CLIENT_URL=http://localhost:5175
```

### Frontend Portals (`.env` in each workspace)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STUDENT_PORTAL_URL=http://localhost:5173
VITE_FACULTY_PORTAL_URL=http://localhost:5174
VITE_ADMIN_PORTAL_URL=http://localhost:5175
```

---

## 9. Folder structure

```
projectmatch/
├─ backend/
│  ├─ node_modules/
│  ├─ src/
│  │  ├─ models/          # User.js, Project.js, Team.js, WorkspaceMessage.js, WorkspaceFile.js, Milestone.js, Meeting.js, Program.js
│  │  ├─ routes/          # authRoutes.js, projectRoutes.js, programRoutes.js, etc.
│  │  ├─ controllers/     # authController.js, programController.js, etc.
│  │  ├─ services/        # vectorService.js, matchingService.js
│  │  ├─ middleware/      # auth.js, requireRole.js, cors.js
│  │  └─ server.js        # Express application & status dashboard at GET /
│  ├─ index.js            # Main server entry point (nodemon index.js)
│  ├─ .env
│  ├─ package.json
│  └─ package-lock.json
├─ frontend/
│  ├─ node_modules/       # Shared workspace node_modules
│  ├─ landing-frontend/   # Showcase & SSO Gateway — http://localhost:5172
│  ├─ student-frontend/   # Student SPA — http://localhost:5173
│  ├─ faculty-frontend/   # Faculty SPA — http://localhost:5174
│  ├─ admin-frontend/     # Admin SPA — http://localhost:5175
│  ├─ shared/             # "@projectmatch/shared" — AuthContext, API client, UI primitives, constants
│  ├─ e2e/                # Cross-portal Playwright tests
│  ├─ package.json        # Workspaces root
│  └─ package-lock.json   # Unified lockfile
├─ .gitignore
├─ ProjectMatch_Pitch.pdf
└─ README.md
```

---

## 10. How to run locally

### Backend
```bash
cd backend
npm run dev
# Starts server on http://localhost:5000
```

### Frontend Portals
```bash
cd frontend

# Launch individual portals:
npm run dev:landing   # http://localhost:5172
npm run dev:student   # http://localhost:5173
npm run dev:faculty   # http://localhost:5174
npm run dev:admin     # http://localhost:5175

# Or launch all 4 portals concurrently:
npm run dev
```

---

## 11. Roadmap (v2+, not to be built now)

v1 is the core loop working end-to-end for SOEC's 6 UG programs. Everything below is deliberately deferred — either cut for time or genuinely dependent on real usage data v1 hasn't produced yet. Do not build any of this until v1 is live and used for at least one real semester, unless explicitly told otherwise.

**v2 — close v1's known gaps**
- Idea deduplication alerts (reuses `descriptionVector`, pairwise cosine similarity across active projects, flag pairs above ~0.85)
- Short-lived, one-time SSO handoff tokens (replacing the current full-session-token-in-URL approach — see `ssoHandoff.js` comment)
- Email/in-app notifications (mentor decision, admin approval, window closing soon)
- PWA/offline support on student/faculty/admin portals, if wanted — needs network-first caching for `/api/` routes specifically, not the same config as the landing page

**v3 — real-time and richer workspace**
- WebSocket-based live discussion thread (v1 uses polling, which is fine at current scale)
- Calendar integration for meetings (Google Calendar OAuth sync)
- Admin analytics dashboard (domain trends, mentor request volume) — needs a real semester of data first

**v4 — expand who it serves**
- MCA (postgrad) — different project shape, needs new logic, not just a `Program` row
- Additional DBUU schools beyond SOEC — one at a time, each needs its own matching/team-structure design
- Cross-year idea archive ("this was done 2 years ago") — needs a semester/year concept added to the data model

**v5+ — only with real demand**
- Native mobile app (PWA likely already covers this)
- Multi-institution white-labeling
- Originality/plagiarism checking on final reports (a different tool, not really "ProjectMatch")

---

## 12. Program seed data

Run once via `backend/scripts/seedPrograms.js` after the `Program` model exists. Not user-editable in v1 — if a program's minor/major year ever needs to change, update this seed and re-run, don't build an admin UI for it yet.

| code | name | minorYear | majorYear | durationYears |
|---|---|---|---|---|
| BTECH_CSE | B.Tech Computer Science & Engineering | 3 | 4 | 4 |
| BTECH_AIML | B.Tech Artificial Intelligence & Machine Learning | 3 | 4 | 4 |
| BTECH_ECE | B.Tech Electronics & Communication Engineering | 3 | 4 | 4 |
| BTECH_CIVIL | B.Tech Civil Engineering | 3 | 4 | 4 |
| BTECH_MECH | B.Tech Mechanical Engineering | 3 | 4 | 4 |
| BCA | Bachelor of Computer Applications | 2 | 3 | 3 |