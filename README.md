# TaskForge — Team Task Manager

A full-stack web application for team task management with **role-based access control (Admin/Member)**. Built with Next.js 16, Prisma, MongoDB, and NextAuth.

🔗 **Live URL**: *[deployed on Railway]*  
📦 **GitHub**: [ganeshkrishnareddy/ethara_ai](https://github.com/ganeshkrishnareddy/ethara_ai)

---

## ✨ Features

### Authentication
- User **signup** and **login** with email/password
- Passwords hashed with **bcrypt** (12 rounds)
- JWT-based sessions via **NextAuth v5**
- Protected routes with middleware

### Project & Team Management
- **Create, edit, delete** projects
- **Invite team members** by email
- **Role-based access**: Admin & Member roles
- Admins can manage members, change roles, remove users
- Members have read + limited write access

### Task Management
- **Create, edit, delete** tasks within projects
- **Kanban board** view (To Do → In Progress → Done)
- **Priority levels**: Low, Medium, High, Urgent
- **Due dates** with overdue detection
- **Task assignment** to team members
- Quick status change buttons on task cards
- Filter tasks by status, priority, and assignee

### Dashboard
- **Stats overview**: Projects, Total Tasks, Completed, Overdue
- **Progress bar** showing overall completion percentage
- **Overdue tasks** section with priority badges
- **My pending tasks** section
- **Recent activity** feed

### Role-Based Access Control (RBAC)

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ✅ (becomes Admin) |
| Edit/Delete project | ✅ | ❌ |
| Add/Remove members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |
| Create tasks | ✅ | ✅ |
| Assign tasks to others | ✅ | ❌ (self-assign only) |
| Update task status | ✅ | ✅ (own tasks) |
| Delete tasks | ✅ | ✅ (own tasks) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| ORM | [Prisma 6](https://www.prisma.io/) |
| Auth | [NextAuth v5](https://authjs.dev/) (Credentials + JWT) |
| Styling | CSS Modules + Custom Design System |
| Icons | Inline SVG |
| Deployment | [Railway](https://railway.app/) |

---

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema (User, Project, ProjectMember, Task)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/           # Auth endpoints (register, [...nextauth])
│   │   │   ├── dashboard/      # Dashboard stats API
│   │   │   └── projects/       # Projects CRUD + Members + Tasks APIs
│   │   ├── auth/               # Login & Register pages
│   │   ├── dashboard/          # Dashboard, Projects list, Project detail (Kanban)
│   │   ├── globals.css         # Design system (dark theme)
│   │   ├── layout.js           # Root layout
│   │   └── page.js             # Landing page
│   ├── components/
│   │   ├── Sidebar.js          # Navigation sidebar
│   │   └── Toast.js            # Toast notifications
│   └── lib/
│       ├── auth.js             # NextAuth configuration
│       ├── prisma.js           # Prisma client singleton
│       └── utils.js            # Utility functions (RBAC helpers, formatters)
├── middleware.js                # Route protection middleware
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone the repository
```bash
git clone https://github.com/ganeshkrishnareddy/ethara_ai.git
cd ethara_ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/teamtask?retryWrites=true&w=majority"
NEXTAUTH_SECRET="your-strong-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Generate Prisma client
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/[...nextauth]` | NextAuth sign-in/sign-out |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/[id]` | Get project details |
| PUT | `/api/projects/[id]` | Update project (Admin) |
| DELETE | `/api/projects/[id]` | Delete project (Admin) |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/[id]/members` | List members |
| POST | `/api/projects/[id]/members` | Add member (Admin) |
| PUT | `/api/projects/[id]/members/[memberId]` | Change role (Admin) |
| DELETE | `/api/projects/[id]/members/[memberId]` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/[id]/tasks` | List tasks (filterable) |
| POST | `/api/projects/[id]/tasks` | Create task |
| GET | `/api/projects/[id]/tasks/[taskId]` | Get task details |
| PUT | `/api/projects/[id]/tasks/[taskId]` | Update task |
| DELETE | `/api/projects/[id]/tasks/[taskId]` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Aggregated stats |

---

## 🚢 Deployment (Railway)

1. Push code to GitHub
2. Create a new project on [Railway](https://railway.app/)
3. Connect your GitHub repository
4. Add environment variables:
   - `DATABASE_URL` — MongoDB Atlas connection string
   - `NEXTAUTH_SECRET` — Random secret string
   - `NEXTAUTH_URL` — Your Railway app URL
5. Railway auto-detects Next.js and deploys

---

## 📝 Database Schema

```
User ──┬── owns ──▶ Project
       ├── memberOf ──▶ ProjectMember (role: ADMIN | MEMBER)
       ├── assignedTo ──▶ Task
       └── created ──▶ Task

Project ──┬── has ──▶ ProjectMember[]
          └── has ──▶ Task[]

Task ── belongs to ──▶ Project
     ── assigned to ──▶ User (optional)
     ── created by ──▶ User
```

---

## License

MIT
