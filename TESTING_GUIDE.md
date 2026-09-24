# SPMS – Visual Step-by-Step API Testing Guide (Task 2)

This guide walks you through testing the **API Consumption in 2 Foreign-Key Modules** using the exact **Admin Portal** and **Faculty Portal** UI screens.

---

## 🧭 Visual UI Map (From Your Screenshots)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  SPM System          🔍 Search projects, tasks, users...       [Admin / Faculty Portal] 👤 User  │
├─────────────────┬────────────────────────────────────────────────────────────────────────────────┤
│ MENU NAVIGATION │                                                                                │
│                 │  Admin Portal Screen:                                                          │
│ 🔲 Admin Dash   │  [+ Project Allocations (FK API)]  [+ New Project Template]  [+ Manage Users]  │
│ 👥 User Mgmt    │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ │
│ 🛡️ Role Assign  │  │ Active Users: 6 │ │ Project Cat: 3  │ │ Allocations: 3  │ │ Health: 100% │ │
│ 📁 Project Cat  │  └─────────────────┘ └─────────────────┘ └─────────────────┘ └──────────────┘ │
│                 │                                                                                │
│ 💼 Allocations  │  Faculty Portal Screen:                                                        │
│    (FK API)     │  [Project Tasks (FK API)]                           [+ Assign New Task]        │
│ 📑 Tasks (FK)   │  ┌───────────────────────────────────────────────────────────────────────────┐ │
│                 │  │ Project Allocation #1: AI-Powered Smart Campus Navigation                 │ │
│                 │  │ Mentee: Alex Rivera                                                       │ │
│                 │  └───────────────────────────────────────────────────────────────────────────┘ │
└─────────────────┴────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ STEP 1: Launch Both Backend & Frontend

### 1.1 Start Backend (ASP.NET Core Web API)
Open your first terminal and run:
```powershell
cd "d:\SEM 5\ASP.NET Project Student Project Management System\SPMS"
dotnet run
```
* Backend will be live at: `http://localhost:5109` (or `https://localhost:7193`)
* Scalar / Swagger interactive API docs: `http://localhost:5109/`

### 1.2 Start Frontend (Vite React SPA)
Open your second terminal and run:
```powershell
cd "d:\SEM 5\ASP.NET Project Student Project Management System\Frontend"
npm run dev
```
* Open in browser: `http://localhost:5173/`

---

## 👑 STEP 2: Test MODULE 1 (Project Allocation) via Admin Portal

### Screen 1: Admin System Administration Portal (Dr. Robert Vance - ADM-001)

1. **Log in as Admin** or switch to the Admin Portal.
2. In the top header or left sidebar, you will see the new button:
   👉 **`Project Allocations (FK API)`** (or click **"Allocations (FK API)"** in the left menu).
3. On this page, click the blue button: **`+ New Project Allocation`**.

### What Happens in the Modal:
```text
┌─────────────────────────────────────────────────────────────────┐
│ Modal: Create Project Allocation (Consumes FK APIs)             │
├─────────────────────────────────────────────────────────────────┤
│ 1. Project Dropdown:                                            │
│    [ Select Project ▼ ]  <-- Consumes GET /api/ProjectMasters   │
│    Shows: [ID: 1] AI-Powered Smart Campus Navigation System     │
│                                                                 │
│ 2. Student Dropdown:                                            │
│    [ Select Student ▼ ]  <-- Consumes GET /api/Users            │
│    Shows: [ID: 4] Alex Rivera (STU-101)                         │
│                                                                 │
│ 3. Faculty Dropdown:                                            │
│    [ Select Faculty ▼ ]  <-- Consumes GET /api/Users            │
│    Shows: [ID: 2] Prof. Bala Sir (FAC-101)                      │
│                                                                 │
│ 4. Start & End Dates                                            │
│    Start: 2026-08-20  |  End: 2026-11-20                        │
├─────────────────────────────────────────────────────────────────┤
│ [ Submit POST /api/ProjectAllocations ]                         │
└─────────────────────────────────────────────────────────────────┘
```

4. **Select values from the dropdowns** and click **Submit POST /api/ProjectAllocations**.
5. **How to Verify it Worked:**
   - The new allocation record appears immediately in the table.
   - Look at the **"Live API Consumption Payload Inspector"** below the table:
     - **Request sent:**
       ```json
       {
         "projectId": 1,
         "studentId": 4,
         "facultyId": 2,
         "assignedDate": "2026-08-20",
         "projectStartDate": "2026-08-20",
         "projectEndDate": "2026-11-20"
       }
       ```
     - **Response received:**
       ```json
       {
         "success": true,
         "message": "Project Allocation Added Successfully",
         "data": { "projectAllocationId": 15, ... }
       }
       ```

---

## 🎓 STEP 3: Test MODULE 2 (Project Task) via Faculty Portal

### Screen 2: Faculty Mentorship & Allocation Portal (Prof. Bala Sir - FAC-101)

1. **Switch to Faculty Portal** (top right persona badge or login).
2. On the Faculty Dashboard, you will see your allocations (e.g. `AI-Powered Smart Campus Navigation System` and `Blockchain Student Credential Verifier`).
3. Click the top-right button: **`+ Assign New Task`** (or click **"Project Tasks (FK API)"** in the left menu).

### What Happens in the Modal:
```text
┌─────────────────────────────────────────────────────────────────┐
│ Modal: Assign New Task (Consumes FK APIs)                       │
├─────────────────────────────────────────────────────────────────┤
│ 1. Project Allocation:                                          │
│    [ #1 — AI-Powered Smart Campus Navigation → Alex Rivera ]    │
│    (Populated from GET /api/ProjectAllocations)                 │
│                                                                 │
│ 2. Task Title:                                                  │
│    "Implement Authentication Controller"                        │
│                                                                 │
│ 3. Priority Dropdown:                                           │
│    [ High ▼ ]  <-- Consumes GET /api/TaskPriorities             │
│                                                                 │
│ 4. Status Dropdown:                                             │
│    [ Pending ▼ ] <-- Consumes GET /api/TaskStatuses             │
│                                                                 │
│ 5. Assigned Score & Due Date:                                   │
│    Score: 100  |  Due Date: 2026-09-15                          │
├─────────────────────────────────────────────────────────────────┤
│ [ Create & Assign Task (POST /api/ProjectTasks) ]               │
└─────────────────────────────────────────────────────────────────┘
```

4. **Fill in task title**, select priority and status from the API dropdowns, and click **Create & Assign Task**.
5. **How to Verify it Worked:**
   - The task appears in the **Task Review Table** under `SPM_Task Records`.
   - In the **Project Tasks (FK API)** screen, look at the **"Live API Consumption Payload Inspector"**:
     - **Request sent:**
       ```json
       {
         "projectAllocationId": 1,
         "taskTitle": "Implement Authentication Controller",
         "taskStatusId": 1,
         "taskPriorityId": 3,
         "assignedScore": 100,
         "taskDueDate": "2026-09-15"
       }
       ```
     - **Response received:**
       ```json
       {
         "success": true,
         "message": "Project Task Added Successfully",
         "data": { "taskId": 50, "taskTitle": "Implement Authentication Controller", ... }
       }
       ```

---

## 📊 Summary of Consumed APIs vs Sent Foreign Keys

| Module | Consumed GET API | Populates Dropdown | Selected ID Sent in POST Payload |
| :--- | :--- | :--- | :--- |
| **Project Allocation** | `GET /api/ProjectMasters` | Project Title | `projectId` (long) |
| **Project Allocation** | `GET /api/Users` (Students) | Student Name & Code | `studentId` (long) |
| **Project Allocation** | `GET /api/Users` (Faculty) | Faculty Name & Code | `facultyId` (long) |
| **Project Task** | `GET /api/ProjectAllocations` | Allocation Title & Student | `projectAllocationId` (long) |
| **Project Task** | `GET /api/TaskStatuses` | Status Name (Pending, etc.) | `taskStatusId` (int) |
| **Project Task** | `GET /api/TaskPriorities` | Priority Name (High, etc.) | `taskPriorityId` (int) |

---

## ✅ Direct Verification Checklist

- [x] Backend running on `http://localhost:5109` with CORS enabled.
- [x] Frontend running on `http://localhost:5173`.
- [x] Admin Portal has direct button **`Project Allocations (FK API)`** to test Module 1.
- [x] Faculty Portal has direct button **`Project Tasks (FK API)`** and **`+ Assign New Task`** to test Module 2.
- [x] Every dropdown shows user-friendly names, and extracts the numeric ID for the request body.
- [x] Live inspector displays the raw JSON request and `ApiResponse<T>` response.
