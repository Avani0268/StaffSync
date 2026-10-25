# StaffSync – Modern Human Resource Management System (HRMS)

**StaffSync** is a full-featured, responsive Human Resource Management System built on the **MERN** stack (MongoDB, Express.js, React.js, and Node.js) with Bootstrap 5, async/await, and JWT authentication with Role-Based Access Control (RBAC).

---

## 🌟 Key Features by User Role

### 1. 👑 HR Administrator
- **Workforce Management:** Full CRUD operations on employee records, department assignments, and designations.
- **Attendance Monitoring:** Real-time daily workforce roster, date and department filtering, punch timestamps, and manual attendance adjustments.
- **Leave Approvals:** Centralized approval workflow for employee leave applications with reviewer notes and balance deduction.
- **Corporate Announcements:** Publish, pin, edit, and categorize company-wide or department-specific notices.
- **Training & Skills:** Create and supervise professional development courses and compliance programs.
- **Executive Analytics:** High-level dashboard with attendance trajectory trends, department allocation charts, and workforce KPIs.

### 2. 👥 Team Manager
- **Team Roster:** Oversee direct reports and departmental team members.
- **Team Attendance:** Track team punch status, on-time arrivals, and absences.
- **Review Leave Requests:** Approve or reject leave applications submitted by team members with review remarks.
- **Team Development:** Monitor course enrollment and skill progression across the team.
- **Personal Punch Station:** Record daily check-in/out and personal leaves.

### 3. 💼 Employee
- **Digital Punch Card:** Live digital clock, check-in and check-out with automatic on-time/late arrival detection.
- **Leave Management:** Real-time leave balance tracking (Annual, Casual, Sick), dynamic leave day calculator, and status tracking.
- **Profile Self-Service:** Update personal contact details, residential address, emergency contact, and skill tags.
- **Training Center:** Explore courses, 1-click enrollment, and progress tracking.
- **Notice Board:** Stay up-to-date with pinned and departmental announcements.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Bootstrap 5.3, Bootstrap Icons, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, RESTful APIs, Morgan |
| **Database** | MongoDB with Mongoose ODM (includes automatic in-memory fallback for zero-setup local dev) |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs password hashing (10 rounds), role-based middleware |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 1. Clone & Setup Backend (`Server/`)
```bash
cd Server
npm install
```

Configure your environment variables in `Server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=staffsync_super_secret_jwt_key_2026_dev_mode_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```
> **Note:** If a local MongoDB instance is not active on port 27017, the server automatically starts an embedded MongoMemoryServer for development, populating rich demo seed data instantly.

Start the backend server:
```bash
npm run dev
# or
node server.js
```

To seed or re-seed sample data manually:
```bash
node seed.js
```

### 2. Setup Frontend (`Client/`)
In a new terminal window:
```bash
cd Client
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 Demo Login Credentials

The login screen includes **1-Click Quick Demo Login Switchers** for all three roles:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **HR Administrator** | `admin@staffsync.com` | `Password123!` | Full enterprise administrative control |
| **Team Manager** | `manager.eng@staffsync.com` | `Password123!` | Engineering team supervision & approvals |
| **Employee** | `alex.turner@staffsync.com` | `Password123!` | Personal workspace, punch station, leaves |
| **Employee (UI/UX)** | `priya.sharma@staffsync.com` | `Password123!` | Personal workspace & course enrollments |

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login` – Login & receive JWT token
- `GET /api/auth/me` – Retrieve authenticated user profile
- `PUT /api/auth/profile` – Update permitted profile fields
- `PUT /api/auth/change-password` – Change password

### Employee Management (`/api/employees`)
- `GET /api/employees` – List employees with search, department, role, and status filters (Admin/Manager)
- `GET /api/employees/team/members` – List team members (Manager)
- `GET /api/employees/:id` – Retrieve employee record
- `POST /api/employees` – Create new employee (Admin)
- `PUT /api/employees/:id` – Update employee record (Admin)
- `DELETE /api/employees/:id` – Delete employee record (Admin)

### Attendance Tracking (`/api/attendance`)
- `POST /api/attendance/check-in` – Record daily check-in with location & notes
- `POST /api/attendance/check-out` – Record check-out & calculate work hours
- `GET /api/attendance/today` – Retrieve current user's punch status for today
- `GET /api/attendance/my-history` – Retrieve personal attendance history
- `GET /api/attendance` – Retrieve workforce attendance roster (Admin/Manager)
- `POST /api/attendance/manual` – Manual attendance entry/adjustment (Admin)

### Leave Management (`/api/leaves`)
- `POST /api/leaves` – Submit leave application
- `GET /api/leaves/my-leaves` – View personal leave history & balances
- `GET /api/leaves/team-leaves` – View team leave requests (Manager)
- `GET /api/leaves` – View all company leave requests (Admin)
- `PUT /api/leaves/:id/review` – Approve or Reject leave with remarks (Admin/Manager)
- `PUT /api/leaves/:id/cancel` – Cancel pending leave application

### Announcements (`/api/announcements`)
- `GET /api/announcements` – Retrieve announcements filtered by audience and category
- `POST /api/announcements` – Create new announcement (Admin)
- `PUT /api/announcements/:id` – Update announcement (Admin)
- `DELETE /api/announcements/:id` – Delete announcement (Admin)

### Training Programs (`/api/trainings`)
- `GET /api/trainings` – List training courses with user enrollment status
- `POST /api/trainings` – Create new training program (Admin/Manager)
- `PUT /api/trainings/:id` – Update training program (Admin/Manager)
- `DELETE /api/trainings/:id` – Delete training program (Admin)
- `POST /api/trainings/:id/enroll` – Enroll in training program
- `PUT /api/trainings/:id/progress` – Update progress percentage & feedback

### Dashboards (`/api/dashboard`)
- `GET /api/dashboard/admin` – HR workforce statistics, trends, and approvals
- `GET /api/dashboard/manager` – Team roster metrics and leave requests
- `GET /api/dashboard/employee` – Monthly attendance summary, leave balances, and enrollments
