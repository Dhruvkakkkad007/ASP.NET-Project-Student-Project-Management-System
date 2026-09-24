# Student Project Management (SPM) System

A multi-role academic management application built with **React**, **Vite**, and **Vanilla CSS**. Designed according to the **`SPM_DB_Design.pdf`** database relational schema.

---

## 🔑 System Login Credentials

You can log into the system using either the **Email Address** or the **User Code** along with the corresponding password. Select the appropriate **Role Tab** on the login screen.

### 🛡️ Admin Accounts (`RoleID = 1`)

| Full Name | Email Address | User Code | Password | Department | Account Status |
|---|---|---|---|---|---|
| **Dr. Robert Vance** | `admin@university.edu` | `ADM-001` | `adminpassword123` | Computer Science & IT | Active |

---

### 🎓 Faculty Accounts (`RoleID = 2`)

| Full Name | Email Address | User Code | Password | Department | Account Status |
|---|---|---|---|---|---|
| **Prof. Sarah Jenkins** | `s.jenkins@university.edu` | `FAC-101` | `facultypassword123` | Computer Science | Active |
| **Dr. Alan Turing** | `a.turing@university.edu` | `FAC-102` | `facultypassword123` | Software Engineering | Active |

---

### 👨‍🎓 Student Accounts (`RoleID = 3`)

| Full Name | Email Address | User Code | Password | Department | Account Status |
|---|---|---|---|---|---|
| **Alex Rivera** | `alex.rivera@student.edu` | `STU-2021-042` | `studentpassword123` | Computer Science | Active |
| **Emily Zhang** | `emily.zhang@student.edu` | `STU-2021-089` | `studentpassword123` | Software Engineering | Active |
| **Marcus Vance** | `marcus.vance@student.edu` | `STU-2021-115` | `studentpassword123` | Information Technology | Active |
| **Sophia Patel** | `sophia.p@student.edu` | `STU-2021-140` | `studentpassword123` | Computer Science | Disabled (Test Persona) |

---

## 🗄️ Database Tables (`SPM_DB_Design.pdf`)

The application state (`mockData.js` and `AppContext.jsx`) maps directly to the 9 SPM relational database tables:

1. **`SPM_Role`**: System roles (`Admin`, `Faculty`, `Student`)
2. **`SPM_UserType`**: Account classifications (`UserTypeID`, `UserTypeName`)
3. **`SPM_User`**: Account records (`UserID`, `UserCode`, `FullName`, `Email`, `Password`, `MobileNumber`, `IsActive`, `IsDeleted`)
4. **`SPM_UserRole`**: Role permission mapping (`RolePermissionID`, `RoleID`, `UserID`)
5. **`SPM_TaskStatus`**: Status definitions (`Pending`, `Ongoing`, `Completed`, `Cancelled`)
6. **`SPM_TaskPriority`**: Priority levels (`Low`, `Moderate`, `High`, `Critical`)
7. **`SPM_ProjectMaster`**: Catalog of project definitions (`ProjectID`, `ProjectTitle`, `TechStack`, `IsActive`)
8. **`SPM_ProjectAllocation`**: Mentorship allocations (`ProjectAllocationID`, `ProjectID`, `StudentID`, `FacultyID`, `ProjectStartDate`, `ProjectEndDate`, `OverAllGrade`)
9. **`SPM_Task`**: Deliverables (`TaskID`, `ProjectAllocationID`, `TaskTitle`, `TaskDescription`, `TaskStatusID`, `TaskPriorityID`, `AssignedScore`, `EarnedScore`, `ProgressPercentage`, `FacultyRemarks`, `StudentRemarks`, `TaskAssignedDate`, `TaskStartDate`, `TaskDueDate`, `TaskCompletedDate`, `NextFollowUpDate`)

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build Production Bundle
```bash
npm run build
```

---

## 🔗 Task 2: Foreign Key API Consumption Testing

### Module 1: Project Allocation API Consumption
1. In the sidebar or top banner, click **`Allocations (FK API)`**.
2. Click **`+ New Project Allocation`**.
3. Foreign Keys populated dynamically via API:
   - `ProjectId`: Fetched from `GET /api/ProjectMasters`
   - `StudentId`: Fetched from `GET /api/Users`
   - `FacultyId`: Fetched from `GET /api/Users`
4. On submission, the form sends `POST /api/ProjectAllocations` with `{ projectId, studentId, facultyId, projectStartDate, projectEndDate, ... }`.
5. Inspect the request and response in the **Live Payload Inspector** below the table.

### Module 2: Project Task API Consumption
1. In the sidebar or Faculty Dashboard, click **`Project Tasks (FK API)`** or **`+ Assign New Task`**.
2. Foreign Keys populated dynamically via API:
   - `ProjectAllocationId`: Fetched from `GET /api/ProjectAllocations`
   - `TaskStatusId`: Fetched from `GET /api/TaskStatuses`
   - `TaskPriorityId`: Fetched from `GET /api/TaskPriorities`
3. On submission, the form sends `POST /api/ProjectTasks` with `{ projectAllocationId, taskTitle, taskStatusId, taskPriorityId, assignedScore, taskDueDate, ... }`.
4. Inspect the request and response in the **Live Payload Inspector** below the table.

