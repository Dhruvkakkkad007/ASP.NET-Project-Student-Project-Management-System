# SPM Backend — API Testing & Debug Guide

Student Project Management System (SPM) REST API built with **ASP.NET Core 10**, **Entity Framework Core**, and **SQL Server**.

This guide walks you through running the backend and testing **every endpoint** in the correct order (lookup tables first, then entities with foreign keys).

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Database Setup](#2-database-setup)
3. [Run the API](#3-run-the-api)
4. [Testing Tools](#4-testing-tools)
5. [Recommended Test Order](#5-recommended-test-order)
6. [Step-by-Step Endpoint Tests](#6-step-by-step-endpoint-tests)
7. [Quick Reference — All Endpoints](#7-quick-reference--all-endpoints)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

| Requirement | Version / Notes |
|-------------|-----------------|
| .NET SDK | 10.0+ |
| SQL Server | LocalDB, Express, or full instance |
| IDE (optional) | Visual Studio 2022 / VS Code |
| API client (optional) | Scalar (built-in), Postman, Thunder Client, or `curl` |

Verify .NET is installed:

```powershell
dotnet --version
```

---

## 2. Database Setup

### 2.1 Update connection string

Edit `appsettings.json` and set your SQL Server instance:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER\\SQLEXPRESS;Database=SPM_Database;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Replace `YOUR_SERVER` with your machine name (current default: `LAPTOP-23LSJSQ6\\SQLEXPRESS`).

### 2.2 Apply migrations

From the `SPM_Backend` folder:

```powershell
cd "D:\SEM 5\ASP.NET Project Student Project Management System\SPM_Backend"

dotnet ef database update
```

This creates/updates the `SPM_Database` schema with all tables.

### 2.3 Verify tables exist

In SQL Server Management Studio (SSMS), confirm these tables exist:

- `SPM_UserType`
- `SPM_Role`
- `SPM_TaskStatus`
- `SPM_TaskPriority`
- `SPM_User`
- `SPM_UserRole`
- `SPM_ProjectMaster`
- `SPM_ProjectAllocation`
- `SPM_Task`

---

## 3. Run the API

```powershell
dotnet run
```

Or from Visual Studio: press **F5** (HTTPS profile) or choose the **http** profile.

| Profile | Base URL |
|---------|----------|
| HTTP | `http://localhost:5038` |
| HTTPS | `https://localhost:7270` |

> Use **HTTP** (`5038`) if you get SSL/certificate errors during manual testing.

### Built-in API docs (Development only)

| Tool | URL |
|------|-----|
| **Scalar UI** | `http://localhost:5038/scalar/v1` |
| **OpenAPI JSON** | `http://localhost:5038/openapi/v1.json` |

Scalar lets you send requests directly from the browser — useful for quick smoke tests.

---

## 4. Testing Tools

### Option A — Scalar (recommended, already configured)

1. Run the API in **Development** mode.
2. Open `http://localhost:5038/scalar/v1`.
3. Expand an endpoint → **Try it** → fill body → **Send**.

### Option B — Postman / Thunder Client

- **Base URL:** `http://localhost:5038`
- **Headers for POST/PUT:** `Content-Type: application/json`
- No authentication headers required (API has no auth middleware yet).

### Option C — PowerShell (`curl`)

```powershell
curl http://localhost:5038/api/UserType
```

---

## 5. Recommended Test Order

Test in this order because later entities depend on earlier ones:

```
UserType → Role → Status → Priority → User → UserRole → Project → ProjectAllocation → Task
```

| Step | Controller | Why first? |
|------|------------|------------|
| 1 | UserType | `User` needs `userTypeID` |
| 2 | Role | `UserRole` needs `roleId` |
| 3 | Status | `Task` needs `taskStatusID` |
| 4 | Priority | `Task` needs `taskPriorityID` |
| 5 | User | Needs `userTypeID`; used by `UserRole` & `ProjectAllocation` |
| 6 | UserRole | Needs `userId` + `roleId` |
| 7 | Project | `ProjectAllocation` needs `projectID` |
| 8 | ProjectAllocation | Needs `projectID`, `studentID`, `facultyID` |
| 9 | Task | Needs `projectAllocationID`, `taskStatusID`, `taskPriorityID` |

For each resource, follow the **CRUD cycle**:

1. **GET all** — confirm empty list or existing data  
2. **POST** — create record; **save the returned ID**  
3. **GET by ID** — verify created record  
4. **PUT** — update record  
5. **GET by ID** — verify update  
6. **DELETE** — remove record (do this last for lookup tables if other records still reference them)

---

## 6. Step-by-Step Endpoint Tests

**Base URL used below:** `http://localhost:5038`

> JSON property names use **camelCase** (ASP.NET default).  
> On **POST**, omit the primary key or set it to `0` — SQL Server will auto-generate it.

---

### Step 1 — UserType (`/api/UserType`)

#### 1.1 GET all

```http
GET http://localhost:5038/api/UserType
```

**Expected:** `200 OK` — `[]` or array of user types.

#### 1.2 POST — create Student type

```http
POST http://localhost:5038/api/UserType
Content-Type: application/json
```

```json
{
  "userTypeName": "Student",
  "description": "Student user type"
}
```

**Expected:** `200 OK` with created object. **Note `userTypeID`** (e.g. `1`).

#### 1.3 POST — create Faculty type

```json
{
  "userTypeName": "Faculty",
  "description": "Faculty user type"
}
```

**Note `userTypeID`** for Faculty (e.g. `2`).

#### 1.4 GET by ID

```http
GET http://localhost:5038/api/UserType/1
```

**Expected:** `200 OK` with the Student record.

#### 1.5 PUT — update

```http
PUT http://localhost:5038/api/UserType/1
Content-Type: application/json
```

```json
{
  "userTypeID": 1,
  "userTypeName": "Student",
  "description": "Updated student description"
}
```

**Expected:** `200 OK` (empty body).

#### 1.6 DELETE (optional — only if nothing references this ID)

```http
DELETE http://localhost:5038/api/UserType/99
```

**Expected:** `200 OK` with `"Deleted"` or `404` if not found.

---

### Step 2 — Role (`/api/Role`)

#### 2.1 GET all

```http
GET http://localhost:5038/api/Role
```

#### 2.2 POST

```json
{
  "roleName": "Admin",
  "description": "System administrator"
}
```

**Note `roleId`** (e.g. `1`).

#### 2.3 GET by ID

```http
GET http://localhost:5038/api/Role/1
```

#### 2.4 PUT

```http
PUT http://localhost:5038/api/Role/1
```

```json
{
  "roleId": 1,
  "roleName": "Admin",
  "description": "Updated admin role"
}
```

#### 2.5 DELETE

```http
DELETE http://localhost:5038/api/Role/1
```

---

### Step 3 — Status (`/api/Status`)

#### 3.1 GET all

```http
GET http://localhost:5038/api/Status
```

#### 3.2 POST

```json
{
  "taskStatusName": "Pending",
  "taskStatusCssClass": "badge-warning"
}
```

Create additional statuses as needed (e.g. `In Progress`, `Completed`). **Note `taskStatusID`**.

#### 3.3 GET by ID

```http
GET http://localhost:5038/api/Status/1
```

#### 3.4 PUT

```http
PUT http://localhost:5038/api/Status/1
```

```json
{
  "taskStatusID": 1,
  "taskStatusName": "Pending",
  "taskStatusCssClass": "badge-secondary"
}
```

#### 3.5 DELETE

```http
DELETE http://localhost:5038/api/Status/1
```

---

### Step 4 — Priority (`/api/Priority`)

#### 4.1 GET all

```http
GET http://localhost:5038/api/Priority
```

#### 4.2 POST

```json
{
  "taskPriorityName": "High",
  "taskPriorityCssClass": "text-danger"
}
```

**Note `taskPriorityID`**.

#### 4.3 GET by ID

```http
GET http://localhost:5038/api/Priority/1
```

#### 4.4 PUT

```http
PUT http://localhost:5038/api/Priority/1
```

```json
{
  "taskPriorityID": 1,
  "taskPriorityName": "High",
  "taskPriorityCssClass": "text-danger"
}
```

#### 4.5 DELETE

```http
DELETE http://localhost:5038/api/Priority/1
```

---

### Step 5 — User (`/api/User`)

Requires valid `userTypeID` from Step 1.

#### 5.1 GET all

```http
GET http://localhost:5038/api/User
```

#### 5.2 POST — Student user

```json
{
  "userTypeID": 1,
  "fullName": "John Student",
  "userCode": "STU001",
  "email": "john.student@college.edu",
  "password": "Pass@123",
  "mobileNumber": "9876543210",
  "profilePicturePath": "/images/users/default.png",
  "isActive": true,
  "isDeleted": false
}
```

**Note `userID`** (e.g. `1`).

#### 5.3 POST — Faculty user

```json
{
  "userTypeID": 2,
  "fullName": "Dr. Jane Faculty",
  "userCode": "FAC001",
  "email": "jane.faculty@college.edu",
  "password": "Pass@123",
  "mobileNumber": "9876543211",
  "profilePicturePath": "/images/users/default.png",
  "isActive": true,
  "isDeleted": false
}
```

**Note faculty `userID`** (e.g. `2`).

#### 5.4 GET by ID

```http
GET http://localhost:5038/api/User/1
```

#### 5.5 PUT

```http
PUT http://localhost:5038/api/User/1
```

```json
{
  "userID": 1,
  "userTypeID": 1,
  "fullName": "John Student Updated",
  "userCode": "STU001",
  "email": "john.student@college.edu",
  "password": "Pass@123",
  "mobileNumber": "9876543210",
  "profilePicturePath": "/images/users/default.png",
  "isActive": true,
  "isDeleted": false
}
```

#### 5.6 DELETE

```http
DELETE http://localhost:5038/api/User/1
```

> **Warning:** Deleting a user referenced by `UserRole` or `ProjectAllocation` may fail due to foreign key constraints.

---

### Step 6 — UserRole (`/api/UserRole`)

Requires `userId` and `roleId`.

#### 6.1 GET all

```http
GET http://localhost:5038/api/UserRole
```

#### 6.2 POST

```json
{
  "roleId": 1,
  "userId": 1
}
```

**Note `rolePermissionId`**.

#### 6.3 GET by ID

```http
GET http://localhost:5038/api/UserRole/1
```

#### 6.4 PUT

```http
PUT http://localhost:5038/api/UserRole/1
```

```json
{
  "rolePermissionId": 1,
  "roleId": 1,
  "userId": 1
}
```

#### 6.5 DELETE

```http
DELETE http://localhost:5038/api/UserRole/1
```

---

### Step 7 — Project (`/api/Project`)

#### 7.1 GET all

```http
GET http://localhost:5038/api/Project
```

#### 7.2 POST

```json
{
  "projectTitle": "Smart Campus Mobile App",
  "description": "A mobile application for campus management"
}
```

**Note `projectID`**.

#### 7.3 GET by ID

```http
GET http://localhost:5038/api/Project/1
```

#### 7.4 PUT

```http
PUT http://localhost:5038/api/Project/1
```

```json
{
  "projectID": 1,
  "projectTitle": "Smart Campus Mobile App v2",
  "description": "Updated project description"
}
```

#### 7.5 DELETE

```http
DELETE http://localhost:5038/api/Project/1
```

---

### Step 8 — ProjectAllocation (`/api/ProjectAllocation`)

Requires `projectID`, `studentID`, and `facultyID`.

#### 8.1 GET all

```http
GET http://localhost:5038/api/ProjectAllocation
```

#### 8.2 POST

```json
{
  "projectID": 1,
  "studentID": 1,
  "facultyID": 2,
  "assignedDate": "2026-08-01T00:00:00",
  "projectStartDate": "2026-08-05T00:00:00",
  "projectEndDate": "2026-12-15T00:00:00",
  "totalTasksGiven": 0,
  "totalCompletedTasks": 0,
  "progressPercentage": 0,
  "overAllGrade": "A"
}
```

**Note `projectAllocationID`**.

#### 8.3 GET by ID

```http
GET http://localhost:5038/api/ProjectAllocation/1
```

#### 8.4 PUT

```http
PUT http://localhost:5038/api/ProjectAllocation/1
```

```json
{
  "projectAllocationID": 1,
  "projectID": 1,
  "studentID": 1,
  "facultyID": 2,
  "assignedDate": "2026-08-01T00:00:00",
  "projectStartDate": "2026-08-05T00:00:00",
  "projectEndDate": "2026-12-15T00:00:00",
  "totalTasksGiven": 5,
  "totalCompletedTasks": 2,
  "progressPercentage": 40.00,
  "overAllGrade": "B"
}
```

#### 8.5 DELETE

```http
DELETE http://localhost:5038/api/ProjectAllocation/1
```

---

### Step 9 — Task (`/api/Task`)

Requires `projectAllocationID`, `taskStatusID`, and `taskPriorityID`.

#### 9.1 GET all

```http
GET http://localhost:5038/api/Task
```

#### 9.2 POST

```json
{
  "projectAllocationID": 1,
  "taskTitle": "Design UI Wireframes",
  "taskDescription": "Create wireframes for login and dashboard screens",
  "taskStatusID": 1,
  "taskPriorityID": 1,
  "assignedScore": 10.00,
  "earnedScore": null,
  "progressPercentage": 0,
  "taskAssignedDate": "2026-08-10T00:00:00",
  "taskStartDate": null,
  "taskDueDate": "2026-08-20T00:00:00",
  "taskCompletedDate": null,
  "nextFollowUpDate": "2026-08-15T00:00:00",
  "facultyRemarks": null,
  "studentRemarks": null
}
```

**Note `taskID`**.

#### 9.3 GET by ID

```http
GET http://localhost:5038/api/Task/1
```

#### 9.4 PUT

```http
PUT http://localhost:5038/api/Task/1
```

```json
{
  "taskID": 1,
  "projectAllocationID": 1,
  "taskTitle": "Design UI Wireframes",
  "taskDescription": "Updated: include settings page wireframe",
  "taskStatusID": 1,
  "taskPriorityID": 1,
  "assignedScore": 10.00,
  "earnedScore": 8.50,
  "progressPercentage": 75.00,
  "taskAssignedDate": "2026-08-10T00:00:00",
  "taskStartDate": "2026-08-11T00:00:00",
  "taskDueDate": "2026-08-20T00:00:00",
  "taskCompletedDate": null,
  "nextFollowUpDate": "2026-08-15T00:00:00",
  "facultyRemarks": "Good progress",
  "studentRemarks": "Working on settings page"
}
```

#### 9.5 DELETE

```http
DELETE http://localhost:5038/api/Task/1
```

---

## 7. Quick Reference — All Endpoints

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| **UserType** |
| 1 | GET | `/api/UserType` | Get all user types |
| 2 | GET | `/api/UserType/{id}` | Get user type by ID |
| 3 | POST | `/api/UserType` | Create user type |
| 4 | PUT | `/api/UserType/{id}` | Update user type |
| 5 | DELETE | `/api/UserType/{id}` | Delete user type |
| **Role** |
| 6 | GET | `/api/Role` | Get all roles |
| 7 | GET | `/api/Role/{id}` | Get role by ID |
| 8 | POST | `/api/Role` | Create role |
| 9 | PUT | `/api/Role/{id}` | Update role |
| 10 | DELETE | `/api/Role/{id}` | Delete role |
| **Status** |
| 11 | GET | `/api/Status` | Get all task statuses |
| 12 | GET | `/api/Status/{id}` | Get status by ID |
| 13 | POST | `/api/Status` | Create status |
| 14 | PUT | `/api/Status/{id}` | Update status |
| 15 | DELETE | `/api/Status/{id}` | Delete status |
| **Priority** |
| 16 | GET | `/api/Priority` | Get all task priorities |
| 17 | GET | `/api/Priority/{id}` | Get priority by ID |
| 18 | POST | `/api/Priority` | Create priority |
| 19 | PUT | `/api/Priority/{id}` | Update priority |
| 20 | DELETE | `/api/Priority/{id}` | Delete priority |
| **User** |
| 21 | GET | `/api/User` | Get all users |
| 22 | GET | `/api/User/{id}` | Get user by ID |
| 23 | POST | `/api/User` | Create user |
| 24 | PUT | `/api/User/{id}` | Update user |
| 25 | DELETE | `/api/User/{id}` | Delete user |
| **UserRole** |
| 26 | GET | `/api/UserRole` | Get all user-role mappings |
| 27 | GET | `/api/UserRole/{id}` | Get mapping by ID |
| 28 | POST | `/api/UserRole` | Assign role to user |
| 29 | PUT | `/api/UserRole/{id}` | Update mapping |
| 30 | DELETE | `/api/UserRole/{id}` | Remove mapping |
| **Project** |
| 31 | GET | `/api/Project` | Get all projects |
| 32 | GET | `/api/Project/{id}` | Get project by ID |
| 33 | POST | `/api/Project` | Create project |
| 34 | PUT | `/api/Project/{id}` | Update project |
| 35 | DELETE | `/api/Project/{id}` | Delete project |
| **ProjectAllocation** |
| 36 | GET | `/api/ProjectAllocation` | Get all allocations |
| 37 | GET | `/api/ProjectAllocation/{id}` | Get allocation by ID |
| 38 | POST | `/api/ProjectAllocation` | Create allocation |
| 39 | PUT | `/api/ProjectAllocation/{id}` | Update allocation |
| 40 | DELETE | `/api/ProjectAllocation/{id}` | Delete allocation |
| **Task** |
| 41 | GET | `/api/Task` | Get all tasks |
| 42 | GET | `/api/Task/{id}` | Get task by ID |
| 43 | POST | `/api/Task` | Create task |
| 44 | PUT | `/api/Task/{id}` | Update task |
| 45 | DELETE | `/api/Task/{id}` | Delete task |

**Total: 45 endpoints** (9 controllers × 5 operations each)

---

## 8. Troubleshooting

### API won't start — database connection error

```
A network-related or instance-specific error occurred while establishing a connection to SQL Server
```

**Fix:**
1. Confirm SQL Server service is running (`services.msc` → SQL Server (SQLEXPRESS)).
2. Update `DefaultConnection` in `appsettings.json` with your correct server name.
3. Run `dotnet ef database update`.

---

### `500 Internal Server Error` on POST

Common causes:

| Cause | Fix |
|-------|-----|
| Invalid foreign key ID | Use IDs that exist (e.g. valid `userTypeID` before creating a User) |
| Missing required fields | Include all `[Required]` fields from the model |
| String too long | Check `[MaxLength]` constraints (e.g. mobile = 15 chars max) |

Check the terminal/console output for the full exception message.

---

### `400 Bad Request` on PUT

The `{id}` in the URL **must match** the primary key in the JSON body.

Example — UserRole PUT fails if URL is `/api/UserRole/1` but body has `"rolePermissionId": 2`.

---

### `404 Not Found` on GET/DELETE

The record with that ID does not exist. Run GET all first to see current IDs.

---

### Scalar page not loading

Scalar only runs in **Development** environment. Ensure:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run
```

Or use the `http`/`https` launch profile from `launchSettings.json`.

---

### CORS errors from frontend

CORS is configured with `AllowAnyOrigin`. If issues persist, confirm the frontend calls the correct base URL (`http://localhost:5038`).

---

### Foreign key delete fails

Delete in **reverse dependency order**:

```
Task → ProjectAllocation → UserRole → User → Project → UserType / Role / Status / Priority
```

---

## Full End-to-End Smoke Test Checklist

Use this checklist to confirm all endpoints work in one session:

- [ ] `dotnet ef database update` succeeds
- [ ] `dotnet run` starts without errors
- [ ] Scalar opens at `/scalar/v1`
- [ ] **UserType** — POST × 2, GET all, GET by ID, PUT, (DELETE optional)
- [ ] **Role** — POST, GET all, GET by ID, PUT
- [ ] **Status** — POST, GET all, GET by ID, PUT
- [ ] **Priority** — POST, GET all, GET by ID, PUT
- [ ] **User** — POST student + faculty, GET all, GET by ID, PUT
- [ ] **UserRole** — POST, GET all, GET by ID, PUT
- [ ] **Project** — POST, GET all, GET by ID, PUT
- [ ] **ProjectAllocation** — POST, GET all, GET by ID, PUT
- [ ] **Task** — POST, GET all, GET by ID, PUT
- [ ] **Task** — DELETE
- [ ] **ProjectAllocation** — DELETE
- [ ] Remaining DELETE operations (if cleaning up test data)

---

## Project Structure

```
SPM_Backend/
├── Controllers/          # API endpoints (9 controllers)
├── Data/
│   └── AppDbContext.cs   # EF Core DbContext
├── Models/               # Entity models (SPM_*)
├── Migrations/           # Database migrations
├── Properties/
│   └── launchSettings.json
├── Program.cs            # App startup, CORS, OpenAPI/Scalar
├── appsettings.json      # Connection string & config
└── README.md             # This file
```

---

**Happy testing!** If an endpoint fails, check the console logs first — EF Core and ASP.NET print detailed error messages there.
