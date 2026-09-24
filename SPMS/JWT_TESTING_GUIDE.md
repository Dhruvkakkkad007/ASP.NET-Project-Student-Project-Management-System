# JWT Authentication — Complete Testing Guide (SPMS API)

> **Student Project Management System**
> Test every secured endpoint step-by-step using **Postman**, **cURL**, or **PowerShell**.

---

## 📋 Table of Contents

1. [Start the Server](#step-1--start-the-server)
2. [Login & Get Your Token](#step-2--login--get-your-token)
3. [Inspect Your Token](#step-3--inspect-your-token-optional)
4. [Test Unauthenticated Access (401)](#step-4--test-unauthenticated-access-expect-401)
5. [Users Controller](#step-5--users-controller)
6. [Roles Controller](#step-6--roles-controller)
7. [User Roles Controller](#step-7--user-roles-controller)
8. [User Types Controller](#step-8--user-types-controller)
9. [Task Statuses Controller](#step-9--task-statuses-controller)
10. [Task Priorities Controller](#step-10--task-priorities-controller)
11. [Project Masters Controller](#step-11--project-masters-controller)
12. [Project Allocations Controller](#step-12--project-allocations-controller)
13. [Project Tasks Controller](#step-13--project-tasks-controller)
14. [PowerShell Automation Script](#step-14--powershell-automation-script)
15. [Full Endpoint & Status Code Reference](#step-15--full-endpoint--status-code-reference)
16. [Common Mistakes & Fixes](#common-mistakes--fixes)

---

## 🔐 Security Rules (Quick Reference)

| Who | Can do |
|---|---|
| **No Token** | Nothing — `401 Unauthorized` on every protected route |
| **Any valid token** (Student / Faculty / Admin) | All `GET` (read) endpoints |
| **Admin token only** | Write on master-data: Roles, UserRoles, UserTypes, TaskStatuses, TaskPriorities |
| **Admin or Faculty token** | Write on project data: ProjectMasters, ProjectAllocations, ProjectTasks |

---

## STEP 1 — Start the Server

Open a terminal in the project folder and run:

```bash
dotnet run --launch-profile http
```

| URL | Purpose |
|---|---|
| `http://localhost:5109` | Scalar API Reference UI |
| `http://localhost:5109/openapi/v1.json` | OpenAPI JSON schema |

> If your port is different, replace `5109` with your actual port throughout this guide.

---

## STEP 2 — Login & Get Your Token

This is the **only public endpoint** — no token required.

### Via Postman
- **Method**: `POST`
- **URL**: `http://localhost:5109/api/Users/login`
- **Headers**: `Content-Type: application/json`
- **Body** (raw → JSON):
```json
{
  "email": "dhruvkakkad@gmail.com",
  "password": "dhruv123"
}
```
- **Expected Response** `200 OK`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Via cURL
```bash
curl -X POST http://localhost:5109/api/Users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"dhruvkakkad@gmail.com\",\"password\":\"dhruv123\"}"
```

### Via PowerShell
```powershell
$loginBody = @{ email = "dhruvkakkad@gmail.com"; password = "dhruv123" } | ConvertTo-Json
$loginRes  = Invoke-RestMethod -Uri "http://localhost:5109/api/Users/login" -Method Post -Body $loginBody -ContentType "application/json"
$token     = $loginRes.token
Write-Host "Token (first 40 chars):" $token.Substring(0,40)
```

> 📌 **Save the token** — you will use it in every step below.
> - **Postman**: Go to **Authorization tab → Bearer Token → paste token**.
> - **cURL / PowerShell**: Use header `Authorization: Bearer <YOUR_TOKEN>`.

### Test Invalid Login (Expect 401)
```bash
curl -i -X POST http://localhost:5109/api/Users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"dhruvkakkad@gmail.com\",\"password\":\"wrongpassword\"}"
```
**Expected**: `401 Unauthorized` — "Invalid Email or password"

---

## STEP 3 — Inspect Your Token (Optional)

Go to **[https://jwt.io](https://jwt.io)** → paste your token in the **Encoded** box.

You will see the decoded payload:
```json
{
  "sub": "dhruvkakkad@gmail.com",
  "jti": "some-unique-guid",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Student",
  "exp": 1789501500,
  "iss": "JwtDemoApi",
  "aud": "JwtDemoApiUsers"
}
```

| Claim | Meaning |
|---|---|
| `sub` | User's email |
| `role` | UserType name — drives authorization |
| `exp` | Token expiry (Unix timestamp, 60 mins from login) |
| `iss` | Issuer (`JwtDemoApi`) |
| `aud` | Audience (`JwtDemoApiUsers`) |

---

## STEP 4 — Test Unauthenticated Access (Expect 401)

Before using any token, verify all protected endpoints reject requests without a token.

### cURL
```bash
curl -i -X GET http://localhost:5109/api/Users
```
**Expected:**
```
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer
```

### PowerShell
```powershell
try {
    Invoke-RestMethod -Uri "http://localhost:5109/api/Users" -Method Get
} catch {
    Write-Host "Status:" $_.Exception.Response.StatusCode  # Should print: Unauthorized
}
```

✅ Confirm you get `401` before proceeding with authenticated tests.

---

## STEP 5 — Users Controller

`/api/Users` — All endpoints require a valid token.

### 5.1 GET All Users (Any Token)
```bash
curl -X GET http://localhost:5109/api/Users ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```
**Expected**: `200 OK`

### 5.2 GET User by ID (Any Token)
```bash
curl -X GET http://localhost:5109/api/Users/1 ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```
**Expected**: `200 OK`

### 5.3 POST Create User (Any Authenticated User)
```bash
curl -X POST http://localhost:5109/api/Users ^
  -H "Authorization: Bearer <YOUR_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"test123\",\"userTypeId\":1}"
```
**Expected**: `200 OK`

### 5.4 PUT Update User (Any Authenticated User)
```bash
curl -X PUT http://localhost:5109/api/Users/1 ^
  -H "Authorization: Bearer <YOUR_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\":\"Updated Name\",\"email\":\"updated@test.com\",\"password\":\"newpass\",\"userTypeId\":1}"
```

### 5.5 DELETE User (Any Authenticated User)
```bash
curl -X DELETE http://localhost:5109/api/Users/1 ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 5.6 GET Admin-Only Endpoint
```bash
curl -X GET http://localhost:5109/api/Users/admin-only ^
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
- **Admin Token** → `200 OK`
- **Student/Faculty Token** → `403 Forbidden`

---

## STEP 6 — Roles Controller

`/api/Roles` — Read: Any token. Write (POST/PUT/DELETE): **Admin only**.

### 6.1 GET All Roles (Any Token)
```bash
curl -X GET http://localhost:5109/api/Roles ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```
**Expected**: `200 OK`

### 6.2 GET Role by ID (Any Token)
```bash
curl -X GET http://localhost:5109/api/Roles/1 ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 6.3 POST Create Role (Admin Only)
```bash
curl -X POST http://localhost:5109/api/Roles ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"roleName\":\"Moderator\"}"
```
**Expected**: `200 OK` (Admin) / `403 Forbidden` (Student or Faculty)

### 6.4 PUT Update Role (Admin Only)
```bash
curl -X PUT http://localhost:5109/api/Roles/1 ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"roleName\":\"UpdatedRole\"}"
```

### 6.5 DELETE Role (Admin Only)
```bash
curl -X DELETE http://localhost:5109/api/Roles/1 ^
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## STEP 7 — User Roles Controller

`/api/UserRoles` — Read: Any token. Write: **Admin only**.

### 7.1 GET All User Roles (Any Token)
```bash
curl -X GET http://localhost:5109/api/UserRoles ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 7.2 GET User Role by ID (Any Token)
```bash
curl -X GET http://localhost:5109/api/UserRoles/1 ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 7.3 POST Assign Role to User (Admin Only)
```bash
curl -X POST http://localhost:5109/api/UserRoles ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":1,\"roleId\":1}"
```
**Expected**: `200 OK` (Admin) / `403 Forbidden` (non-Admin)

### 7.4 PUT Update User Role (Admin Only)
```bash
curl -X PUT http://localhost:5109/api/UserRoles/1 ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":1,\"roleId\":2}"
```

### 7.5 DELETE Remove User Role (Admin Only)
```bash
curl -X DELETE http://localhost:5109/api/UserRoles/1 ^
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## STEP 8 — User Types Controller

`/api/UserTypes` — Read: Any token. Write: **Admin only**.

### 8.1 GET All User Types (Any Token)
```bash
curl -X GET http://localhost:5109/api/UserTypes ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 8.2 POST Create User Type (Admin Only)
```bash
curl -X POST http://localhost:5109/api/UserTypes ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"userTypeName\":\"Guest\"}"
```
**Expected**: `200 OK` (Admin) / `403 Forbidden` (non-Admin)

### 8.3 PUT Update User Type (Admin Only)
```bash
curl -X PUT http://localhost:5109/api/UserTypes/1 ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"userTypeName\":\"UpdatedType\"}"
```

### 8.4 DELETE User Type (Admin Only)
```bash
curl -X DELETE http://localhost:5109/api/UserTypes/1 ^
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## STEP 9 — Task Statuses Controller

`/api/TaskStatuses` — Read: Any token. Write: **Admin only**.

### 9.1 GET All Task Statuses (Any Token)
```bash
curl -X GET http://localhost:5109/api/TaskStatuses ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 9.2 POST Create Task Status (Admin Only)
```bash
curl -X POST http://localhost:5109/api/TaskStatuses ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"taskStatusName\":\"In Review\",\"taskStatusCssClass\":\"badge-warning\"}"
```
**Expected**: `200 OK` (Admin) / `403 Forbidden` (non-Admin)

### 9.3 PUT Update Task Status (Admin Only)
```bash
curl -X PUT http://localhost:5109/api/TaskStatuses/1 ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"taskStatusName\":\"Completed\",\"taskStatusCssClass\":\"badge-success\"}"
```

### 9.4 DELETE Task Status (Admin Only)
```bash
curl -X DELETE http://localhost:5109/api/TaskStatuses/1 ^
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## STEP 10 — Task Priorities Controller

`/api/TaskPriorities` — Read: Any token. Write: **Admin only**.

### 10.1 GET All Task Priorities (Any Token)
```bash
curl -X GET http://localhost:5109/api/TaskPriorities ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 10.2 POST Create Task Priority (Admin Only)
```bash
curl -X POST http://localhost:5109/api/TaskPriorities ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"taskPriorityName\":\"Critical\",\"taskPriorityCssClass\":\"badge-danger\"}"
```
**Expected**: `200 OK` (Admin) / `403 Forbidden` (non-Admin)

### 10.3 PUT Update Task Priority (Admin Only)
```bash
curl -X PUT http://localhost:5109/api/TaskPriorities/1 ^
  -H "Authorization: Bearer <ADMIN_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"taskPriorityName\":\"High\",\"taskPriorityCssClass\":\"badge-warning\"}"
```

### 10.4 DELETE Task Priority (Admin Only)
```bash
curl -X DELETE http://localhost:5109/api/TaskPriorities/1 ^
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## STEP 11 — Project Masters Controller

`/api/ProjectMasters` — Read: Any token. Write: **Admin or Faculty**.

### 11.1 GET All Projects (Any Token)
```bash
curl -X GET http://localhost:5109/api/ProjectMasters ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 11.2 GET Project by ID (Any Token)
```bash
curl -X GET http://localhost:5109/api/ProjectMasters/1 ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 11.3 POST Create Project (Admin or Faculty)
```bash
curl -X POST http://localhost:5109/api/ProjectMasters ^
  -H "Authorization: Bearer <ADMIN_OR_FACULTY_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"projectTitle\":\"AI Research\",\"description\":\"Artificial Intelligence Project\"}"
```
**Expected**: `200 OK` (Admin / Faculty) / `403 Forbidden` (Student)

### 11.4 PUT Update Project (Admin or Faculty)
```bash
curl -X PUT http://localhost:5109/api/ProjectMasters/1 ^
  -H "Authorization: Bearer <ADMIN_OR_FACULTY_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"projectTitle\":\"AI Research v2\",\"description\":\"Updated description\"}"
```

### 11.5 DELETE Project (Admin or Faculty)
```bash
curl -X DELETE http://localhost:5109/api/ProjectMasters/1 ^
  -H "Authorization: Bearer <ADMIN_OR_FACULTY_TOKEN>"
```

---

## STEP 12 — Project Allocations Controller

`/api/ProjectAllocations` — Read: Any token. Write: **Admin or Faculty**.

### 12.1 GET All Allocations (Any Token)
```bash
curl -X GET http://localhost:5109/api/ProjectAllocations ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 12.2 GET Allocation by ID (Any Token)
```bash
curl -X GET http://localhost:5109/api/ProjectAllocations/1 ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 12.3 POST Create Allocation (Admin or Faculty)
```bash
curl -X POST http://localhost:5109/api/ProjectAllocations ^
  -H "Authorization: Bearer <ADMIN_OR_FACULTY_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"projectId\":1,\"studentId\":2,\"facultyId\":3,\"assignedDate\":\"2026-09-15\",\"projectStartDate\":\"2026-09-16\",\"projectEndDate\":\"2026-12-31\",\"totalTasksGiven\":10,\"totalCompletedTasks\":0,\"progressPercentage\":0,\"overAllGrade\":\"\"}"
```
**Expected**: `200 OK` (Admin / Faculty) / `403 Forbidden` (Student)

### 12.4 PUT Update Allocation (Admin or Faculty)
```bash
curl -X PUT http://localhost:5109/api/ProjectAllocations/1 ^
  -H "Authorization: Bearer <ADMIN_OR_FACULTY_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"projectId\":1,\"studentId\":2,\"facultyId\":3,\"assignedDate\":\"2026-09-15\",\"projectStartDate\":\"2026-09-16\",\"projectEndDate\":\"2026-12-31\",\"totalTasksGiven\":12,\"totalCompletedTasks\":5,\"progressPercentage\":41,\"overAllGrade\":\"B\"}"
```

### 12.5 DELETE Allocation (Admin or Faculty)
```bash
curl -X DELETE http://localhost:5109/api/ProjectAllocations/1 ^
  -H "Authorization: Bearer <ADMIN_OR_FACULTY_TOKEN>"
```

---

## STEP 13 — Project Tasks Controller

`/api/ProjectTasks` — Read: Any token. Write: **Admin or Faculty**.

### 13.1 GET All Project Tasks (Any Token)
```bash
curl -X GET http://localhost:5109/api/ProjectTasks ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 13.2 GET Task by ID (Any Token)
```bash
curl -X GET http://localhost:5109/api/ProjectTasks/1 ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 13.3 POST Create Task (Admin or Faculty)
```bash
curl -X POST http://localhost:5109/api/ProjectTasks ^
  -H "Authorization: Bearer <ADMIN_OR_FACULTY_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"projectAllocationId\":1,\"taskTitle\":\"Literature Review\",\"taskDescription\":\"Review all related papers\",\"taskStatusId\":1,\"taskPriorityId\":1,\"assignedScore\":10,\"earnedScore\":0,\"progressPercentage\":0,\"taskAssignedDate\":\"2026-09-15\",\"taskStartDate\":\"2026-09-16\",\"taskDueDate\":\"2026-09-30\",\"taskCompletedDate\":null,\"nextFollowUpDate\":\"2026-09-20\",\"facultyRemarks\":\"\",\"studentRemarks\":\"\"}"
```
**Expected**: `200 OK` (Admin / Faculty) / `403 Forbidden` (Student)

### 13.4 PUT Update Task (Admin or Faculty)
```bash
curl -X PUT http://localhost:5109/api/ProjectTasks/1 ^
  -H "Authorization: Bearer <ADMIN_OR_FACULTY_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"projectAllocationId\":1,\"taskTitle\":\"Literature Review\",\"taskDescription\":\"Review all related papers\",\"taskStatusId\":2,\"taskPriorityId\":1,\"assignedScore\":10,\"earnedScore\":8,\"progressPercentage\":80,\"taskAssignedDate\":\"2026-09-15\",\"taskStartDate\":\"2026-09-16\",\"taskDueDate\":\"2026-09-30\",\"taskCompletedDate\":\"2026-09-28\",\"nextFollowUpDate\":null,\"facultyRemarks\":\"Good work\",\"studentRemarks\":\"Done\"}"
```

### 13.5 DELETE Task (Admin or Faculty)
```bash
curl -X DELETE http://localhost:5109/api/ProjectTasks/1 ^
  -H "Authorization: Bearer <ADMIN_OR_FACULTY_TOKEN>"
```

---

## STEP 14 — PowerShell Automation Script

Run this script to automatically test all GET routes + role enforcement in one shot:

```powershell
# ─── Configuration ────────────────────────────────────────────────────────
$base     = "http://localhost:5109"
$email    = "dhruvkakkad@gmail.com"   # Change to your user
$password = "dhruv123"               # Change to your password

# ─── Step 1: Login ────────────────────────────────────────────────────────
$loginBody = @{ email = $email; password = $password } | ConvertTo-Json
$loginRes  = Invoke-RestMethod -Uri "$base/api/Users/login" -Method Post -Body $loginBody -ContentType "application/json"
$token     = $loginRes.token
$h         = @{ Authorization = "Bearer $token" }
Write-Host "`n[OK] Token received. First 40 chars: $($token.Substring(0,40))..." -ForegroundColor Green

# ─── Step 2: Test GET endpoints (all roles should get 200) ─────────────────
$getRoutes = @(
    "/api/Users", "/api/Users/1",
    "/api/Roles", "/api/Roles/1",
    "/api/UserRoles", "/api/UserRoles/1",
    "/api/UserTypes", "/api/UserTypes/1",
    "/api/TaskStatuses", "/api/TaskStatuses/1",
    "/api/TaskPriorities", "/api/TaskPriorities/1",
    "/api/ProjectMasters", "/api/ProjectMasters/1",
    "/api/ProjectAllocations", "/api/ProjectAllocations/1",
    "/api/ProjectTasks", "/api/ProjectTasks/1"
)

Write-Host "`n--- Testing GET endpoints (expect 200 OK) ---" -ForegroundColor Cyan
foreach ($route in $getRoutes) {
    try {
        $res = Invoke-WebRequest -Uri "$base$route" -Headers $h -Method Get -ErrorAction Stop
        Write-Host "[PASS] GET $route -> $($res.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] GET $route -> $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# ─── Step 3: Test Admin-Only route ─────────────────────────────────────────
Write-Host "`n--- Testing Admin-Only endpoint ---" -ForegroundColor Cyan
try {
    $res = Invoke-WebRequest -Uri "$base/api/Users/admin-only" -Headers $h -Method Get -ErrorAction Stop
    Write-Host "[PASS] GET /api/Users/admin-only -> $($res.StatusCode) (Your role is Admin!)" -ForegroundColor Green
} catch {
    $code = $_.Exception.Response.StatusCode
    if ($code -eq "Forbidden") {
        Write-Host "[WARN] GET /api/Users/admin-only -> 403 Forbidden (Your role is NOT Admin)" -ForegroundColor Yellow
    } else {
        Write-Host "[FAIL] GET /api/Users/admin-only -> $code" -ForegroundColor Red
    }
}

# ─── Step 4: Test no-token (expect 401) ────────────────────────────────────
Write-Host "`n--- Testing without token (expect 401) ---" -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "$base/api/Users" -Method Get -ErrorAction Stop
    Write-Host "[FAIL] GET /api/Users (no token) -> 200 — SHOULD HAVE BEEN 401!" -ForegroundColor Red
} catch {
    Write-Host "[PASS] GET /api/Users (no token) -> $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}

Write-Host "`n=== All tests complete! ===" -ForegroundColor Green
```

---

## STEP 15 — Full Endpoint & Status Code Reference

### Legend
| Symbol | Meaning |
|---|---|
| ✅ `200 OK` | Success |
| 🔒 `401 Unauthorized` | No token / invalid token |
| 🚫 `403 Forbidden` | Valid token but wrong role |

---

### Users `/api/Users`

| Method | Endpoint | No Token | Student | Faculty | Admin |
|---|---|---|---|---|---|
| `POST` | `/login` | `200` ✅ | `200` ✅ | `200` ✅ | `200` ✅ |
| `GET` | `/` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `GET` | `/{id}` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `POST` | `/` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `PUT` | `/{id}` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `DELETE` | `/{id}` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `GET` | `/admin-only` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |

---

### Roles `/api/Roles`

| Method | Endpoint | No Token | Student | Faculty | Admin |
|---|---|---|---|---|---|
| `GET` | `/` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `GET` | `/{id}` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `POST` | `/` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |
| `PUT` | `/{id}` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |
| `DELETE` | `/{id}` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |

---

### User Roles `/api/UserRoles`

| Method | Endpoint | No Token | Student | Faculty | Admin |
|---|---|---|---|---|---|
| `GET` | `/` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `GET` | `/{id}` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `POST` | `/` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |
| `PUT` | `/{id}` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |
| `DELETE` | `/{id}` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |

---

### User Types `/api/UserTypes`

| Method | Endpoint | No Token | Student | Faculty | Admin |
|---|---|---|---|---|---|
| `GET` | `/` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `GET` | `/{id}` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `POST` | `/` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |
| `PUT` | `/{id}` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |
| `DELETE` | `/{id}` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |

---

### Task Statuses `/api/TaskStatuses`

| Method | Endpoint | No Token | Student | Faculty | Admin |
|---|---|---|---|---|---|
| `GET` | `/` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `GET` | `/{id}` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `POST` | `/` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |
| `PUT` | `/{id}` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |
| `DELETE` | `/{id}` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |

---

### Task Priorities `/api/TaskPriorities`

| Method | Endpoint | No Token | Student | Faculty | Admin |
|---|---|---|---|---|---|
| `GET` | `/` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `GET` | `/{id}` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `POST` | `/` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |
| `PUT` | `/{id}` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |
| `DELETE` | `/{id}` | `401` 🔒 | `403` 🚫 | `403` 🚫 | `200` ✅ |

---

### Project Masters `/api/ProjectMasters`

| Method | Endpoint | No Token | Student | Faculty | Admin |
|---|---|---|---|---|---|
| `GET` | `/` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `GET` | `/{id}` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `POST` | `/` | `401` 🔒 | `403` 🚫 | `200` ✅ | `200` ✅ |
| `PUT` | `/{id}` | `401` 🔒 | `403` 🚫 | `200` ✅ | `200` ✅ |
| `DELETE` | `/{id}` | `401` 🔒 | `403` 🚫 | `200` ✅ | `200` ✅ |

---

### Project Allocations `/api/ProjectAllocations`

| Method | Endpoint | No Token | Student | Faculty | Admin |
|---|---|---|---|---|---|
| `GET` | `/` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `GET` | `/{id}` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `POST` | `/` | `401` 🔒 | `403` 🚫 | `200` ✅ | `200` ✅ |
| `PUT` | `/{id}` | `401` 🔒 | `403` 🚫 | `200` ✅ | `200` ✅ |
| `DELETE` | `/{id}` | `401` 🔒 | `403` 🚫 | `200` ✅ | `200` ✅ |

---

### Project Tasks `/api/ProjectTasks`

| Method | Endpoint | No Token | Student | Faculty | Admin |
|---|---|---|---|---|---|
| `GET` | `/` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `GET` | `/{id}` | `401` 🔒 | `200` ✅ | `200` ✅ | `200` ✅ |
| `POST` | `/` | `401` 🔒 | `403` 🚫 | `200` ✅ | `200` ✅ |
| `PUT` | `/{id}` | `401` 🔒 | `403` 🚫 | `200` ✅ | `200` ✅ |
| `DELETE` | `/{id}` | `401` 🔒 | `403` 🚫 | `200` ✅ | `200` ✅ |

---

## Common Mistakes & Fixes

| Problem | Cause | Fix |
|---|---|---|
| `401` even with token | Token expired (60 min limit) | Login again to get a fresh token |
| `401` even with correct header | Missing `Bearer ` prefix or extra space | Use exactly: `Authorization: Bearer <token>` |
| `403` on write endpoints | Logged in as Student | Login with an Admin or Faculty account |
| `401` on `/login` | Wrong email / password | Check credentials in your database |
| Server not starting | Port already in use | Kill existing SPMS process or change port in `launchSettings.json` |
| Build fails with file-lock error | `SPMS.exe` is already running | Stop the running server first, then `dotnet run` again |

---

*JWT Authentication — SPMS API | Generated: September 2026*

---

## 📋 Table of Contents
1. [Starting the Application](#1-starting-the-application)
2. [Testing via Scalar Interactive UI](#2-testing-via-scalar-interactive-ui)
3. [Testing via Postman](#3-testing-via-postman)
4. [Testing via cURL (Command Line)](#4-testing-via-curl-command-line)
5. [Testing via PowerShell](#5-testing-via-powershell)
6. [Testing Role-Based Authorization](#6-testing-role-based-authorization)
7. [Inspecting Your Token on JWT.io](#7-inspecting-your-token-on-jwtio)
8. [Summary of Endpoints & Expected Status Codes](#8-summary-of-endpoints--expected-status-codes)

---

## 1. Starting the Application

Run the application using the dotnet CLI or Visual Studio:

```bash
dotnet run --launch-profile http
```

- **Base URL (HTTP)**: `http://localhost:5109`
- **Scalar API Reference**: `http://localhost:5109/`
- **OpenAPI Schema**: `http://localhost:5109/openapi/v1.json`

---

## 2. Testing via Scalar Interactive UI

Scalar comes pre-configured with the **Bearer Security Scheme**.

### Step 1: Open Scalar
Open your browser and navigate to:
```
http://localhost:5109/
```

### Step 2: Login to Get a Token
1. Locate the **Users** section in the left sidebar.
2. Click on `POST /api/Users/login` (or `/api/User/login`).
3. Under the **Request Body**, enter your credentials:
   ```json
   {
     "email": "dhruvkakkad@gmail.com",
     "password": "dhruv123"
   }
   ```
4. Click **Send Request**.
5. You will receive a `200 OK` response with your token:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```
6. Copy the value of the `token` (excluding quotation marks).

### Step 3: Authorize Scalar
1. Scroll to the top of the Scalar page (or look at the **Authentication** button in the header/introduction).
2. Click **Authentication** / **Bearer**.
3. Paste the copied token into the text field.
   *(Note: You do **not** need to type `Bearer `; Scalar adds it automatically).*

### Step 4: Call Protected Endpoints
1. Now click `GET /api/Users`.
2. Click **Send Request**.
3. You will receive a `200 OK` response with the user list!

---

## 3. Testing via Postman

### Step 1: Login Request
- **Method**: `POST`
- **URL**: `http://localhost:5109/api/Users/login` (or `http://localhost:5109/api/User/login`)
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (`raw` -> `JSON`):
  ```json
  {
    "email": "dhruvkakkad@gmail.com",
    "password": "dhruv123"
  }
  ```
- **Action**: Click **Send**.
- Copy the `token` from the response.

### Step 2: Unauthenticated Test (Verify Security)
- **Method**: `GET`
- **URL**: `http://localhost:5109/api/Users`
- **Action**: Click **Send** without adding any authentication.
- **Expected Status**: `401 Unauthorized`

### Step 3: Authenticated Request
- **Method**: `GET`
- **URL**: `http://localhost:5109/api/Users`
- Go to the **Authorization** tab:
  - **Type**: `Bearer Token`
  - **Token**: Paste the copied token
- **Action**: Click **Send**.
- **Expected Status**: `200 OK`

---

## 4. Testing via cURL (Command Line)

### 1. Test Unauthenticated Request (Expect `401 Unauthorized`)
```bash
curl -i -X GET http://localhost:5109/api/Users
```
**Expected Response:**
```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer
```

### 2. Test Invalid Login (Expect `401 Unauthorized`)
```bash
curl -i -X POST http://localhost:5109/api/Users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"dhruvkakkad@gmail.com\",\"password\":\"wrongpassword\"}"
```
**Expected Response:**
```http
HTTP/1.1 401 Unauthorized
Invalid Email or password
```

### 3. Test Successful Login (Expect `200 OK` + Token)
```bash
curl -i -X POST http://localhost:5109/api/Users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"dhruvkakkad@gmail.com\",\"password\":\"dhruv123\"}"
```
**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Test Protected Request with Token (Expect `200 OK`)
Replace `<YOUR_TOKEN>` with the token string returned from login:
```bash
curl -i -X GET http://localhost:5109/api/Users ^
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## 5. Testing via PowerShell

You can execute this automated test script in PowerShell to verify the full flow:

```powershell
# 1. Login to retrieve token
$loginBody = @{
    email = "dhruvkakkad@gmail.com"
    password = "dhruv123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5109/api/Users/login" `
                              -Method Post `
                              -Body $loginBody `
                              -ContentType "application/json"

$token = $response.token
Write-Host "JWT Token Received:" $token.Substring(0, 35)...

# 2. Access protected endpoint with Bearer Token
$headers = @{
    Authorization = "Bearer $token"
}

$userData = Invoke-RestMethod -Uri "http://localhost:5109/api/Users" `
                              -Method Get `
                              -Headers $headers

Write-Host "Success! Retrieved $($userData.data.Count) users."
```

---

## 6. Testing Role-Based Authorization

The token automatically embeds the user's role from `UserType.UserTypeName` (e.g., `Student`, `Faculty`, `Admin`).

### Endpoint: `GET /api/Users/admin-only`
This endpoint requires the role `Admin`:
```csharp
[Authorize(Roles = "Admin")]
[HttpGet("admin-only")]
```

### Case A: Call with a `Student` Token
- When logged in as `dhruvkakkad@gmail.com` (UserType = Student):
- Call: `GET /api/Users/admin-only` with `Authorization: Bearer <Student_Token>`
- **Expected Status**: `403 Forbidden` (User is authenticated, but does not have the `Admin` role).

### Case B: Call with an `Admin` Token
- When logged in as an Admin user:
- Call: `GET /api/Users/admin-only` with `Authorization: Bearer <Admin_Token>`
- **Expected Status**: `200 OK`

---

## 7. Inspecting Your Token on JWT.io

1. Go to [https://jwt.io](https://jwt.io).
2. Paste your token into the **Encoded** box.
3. In the **Decoded - Payload** section, you will see:
   ```json
   {
     "sub": "dhruvkakkad@gmail.com",
     "jti": "d04e38e8-d636-4bfd-a320-256ea4f9c6e3",
     "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Student",
     "exp": 1789501500,
     "iss": "JwtDemoApi",
     "aud": "JwtDemoApiUsers"
   }
   ```
- `sub`: User's email
- `jti`: Unique token ID
- `role`: User's assigned role
- `iss`: Issuer (`JwtDemoApi`)
- `aud`: Audience (`JwtDemoApiUsers`)
- `exp`: Expiration Unix timestamp

---

## 8. Summary of Endpoints & Expected Status Codes

| Endpoint | Method | Auth Required | Expected Code (Without Token) | Expected Code (With Valid Token) | Expected Code (Wrong Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/Users/login` | `POST` | ❌ No (`[AllowAnonymous]`) | `200 OK` (or `401` on bad credentials) | N/A | N/A |
| `/api/User/login` | `POST` | ❌ No (`[AllowAnonymous]`) | `200 OK` (or `401` on bad credentials) | N/A | N/A |
| `/api/Users` | `GET` | ✅ Yes (`[Authorize]`) | `401 Unauthorized` | `200 OK` | N/A |
| `/api/Users/{id}` | `GET` | ✅ Yes (`[Authorize]`) | `401 Unauthorized` | `200 OK` | N/A |
| `/api/Users` | `POST` | ✅ Yes (`[Authorize]`) | `401 Unauthorized` | `200 OK` | N/A |
| `/api/Users/{id}` | `PUT` | ✅ Yes (`[Authorize]`) | `401 Unauthorized` | `200 OK` | N/A |
| `/api/Users/{id}` | `DELETE` | ✅ Yes (`[Authorize]`) | `401 Unauthorized` | `200 OK` | N/A |
| `/api/Users/admin-only` | `GET` | ✅ Yes (`[Authorize(Roles="Admin")]`) | `401 Unauthorized` | `200 OK` (Admin) | `403 Forbidden` (Non-Admin) |
