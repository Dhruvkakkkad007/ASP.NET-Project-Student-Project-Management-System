# SPMS - API Consumption Guide (Foreign Key Modules)

This guide provides a comprehensive walkthrough for consuming ASP.NET Core Web APIs in the **Student Project Management System (SPMS)** with a focus on **two modules containing Foreign Key relationships**.

---

## Table of Contents
1. [Overview & Common Response Structure](#1-overview--common-response-structure)
2. [Module 1: Project Allocations Module](#2-module-1-project-allocations-module)
   - [Models & Foreign Key Relationships](#models--foreign-key-relationships)
   - [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
   - [API Endpoints](#api-endpoints)
   - [Step-by-Step API Consumption Workflow (Dropdowns + CRUD)](#step-by-step-api-consumption-workflow-dropdowns--crud)
   - [Code Examples (JavaScript / C# HttpClient)](#code-examples-javascript--c-httpclient)
3. [Module 2: Project Tasks Module](#3-module-2-project-tasks-module)
   - [Models & Foreign Key Relationships](#models--foreign-key-relationships-1)
   - [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects-1)
   - [API Endpoints](#api-endpoints-1)
   - [Step-by-Step API Consumption Workflow (Dropdowns + CRUD)](#step-by-step-api-consumption-workflow-dropdowns--crud-1)
   - [Code Examples (JavaScript / C# HttpClient)](#code-examples-javascript--c-httpclient-1)
4. [General Frontend / Client Consumption Checklist](#4-general-frontend--client-consumption-checklist)

---

## 1. Overview & Common Response Structure

All SPMS endpoints return data wrapped inside the standardized generic `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Project Allocations Retrieved Successfully",
  "data": { ... },
  "errors": null
}
```

### Generic C# Response Wrapper
```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }
}
```

---

## 2. Module 1: Project Allocations Module

### Models & Foreign Key Relationships

* **Main Entity Model:** `ProjectAllocation` (`Models/ProjectAllocation.cs`)
* **Controller:** `ProjectAllocationsController` (`/api/ProjectAllocations`)

#### Foreign Keys in `ProjectAllocation`:
| Foreign Key Property | Related Model | Related Controller | Lookup Purpose (e.g. Dropdown) |
| :--- | :--- | :--- | :--- |
| `ProjectId` (long) | `ProjectMaster` | `/api/ProjectMasters` | Select which Project is being allocated |
| `StudentId` (long) | `User` | `/api/Users` | Select which Student is assigned |
| `FacultyId` (long) | `User` | `/api/Users` | Select which Faculty / Guide is supervising |

---

### DTOs (Data Transfer Objects)

#### `ProjectAllocationDto` (For Read Responses)
```csharp
public class ProjectAllocationDto
{
    public long ProjectAllocationId { get; set; }
    public long ProjectId { get; set; }
    public long StudentId { get; set; }
    public long FacultyId { get; set; }
    public DateTime AssignedDate { get; set; }
    public DateTime ProjectStartDate { get; set; }
    public DateTime ProjectEndDate { get; set; }
    public int TotalTasksGiven { get; set; }
    public int TotalCompletedTasks { get; set; }
    public decimal ProgressPercentage { get; set; }
    public string? OverAllGrade { get; set; }

    // Navigation lookup fields
    public string? ProjectTitle { get; set; }
    public string? StudentFullName { get; set; }
    public string? FacultyFullName { get; set; }
}
```

#### `ProjectAllocationCreateDto` / `ProjectAllocationUpdateDto` (For Insert & Update Requests)
```csharp
public class ProjectAllocationCreateDto
{
    public long ProjectId { get; set; }
    public long StudentId { get; set; }
    public long FacultyId { get; set; }
    public DateTime AssignedDate { get; set; }
    public DateTime ProjectStartDate { get; set; }
    public DateTime ProjectEndDate { get; set; }
    public int TotalTasksGiven { get; set; }
    public int TotalCompletedTasks { get; set; }
    public decimal ProgressPercentage { get; set; }
    public string? OverAllGrade { get; set; }
}
```

---

### API Endpoints

| HTTP Method | Route | Description | Expected Request Body | Response Wrapper Type |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/ProjectAllocations` | Get all project allocations with project and user titles | None | `ApiResponse<List<ProjectAllocationDto>>` |
| **GET** | `/api/ProjectAllocations/{id}` | Get project allocation by ID | None | `ApiResponse<ProjectAllocationDto>` |
| **POST** | `/api/ProjectAllocations` | Create a new project allocation | `ProjectAllocationCreateDto` | `ApiResponse<ProjectAllocationDto>` |
| **PUT** | `/api/ProjectAllocations/{id}` | Update existing project allocation | `ProjectAllocationUpdateDto` | `ApiResponse<ProjectAllocationDto>` |
| **DELETE** | `/api/ProjectAllocations/{id}` | Delete allocation by ID | None | `ApiResponse<object>` |

---

### Step-by-Step API Consumption Workflow (Dropdowns + CRUD)

To create or edit a **Project Allocation** in the client UI:

1. **Populate Foreign Key Dropdowns:**
   - Call `GET /api/ProjectMasters` $\to$ Bind `ProjectId` (`value`) and `ProjectTitle` (`text`).
   - Call `GET /api/Users` $\to$ Filter users by student type, bind `StudentId` (`value`) and `FullName` (`text`).
   - Call `GET /api/Users` $\to$ Filter users by faculty type, bind `FacultyId` (`value`) and `FullName` (`text`).

2. **Submit Allocation:**
   - Send `POST /api/ProjectAllocations` with the selected Foreign Key IDs and date parameters.

---

### Code Examples (JavaScript / C# HttpClient)

#### JavaScript (Fetch API)
```javascript
const BASE_URL = "https://localhost:7198/api";

// 1. Fetch Foreign Key Data for Dropdowns
async function loadDropdowns() {
  const [projectsRes, usersRes] = await Promise.all([
    fetch(`${BASE_URL}/ProjectMasters`).then(r => r.json()),
    fetch(`${BASE_URL}/Users`).then(r => r.json())
  ]);

  const projects = projectsRes.data; // List of projects
  const users = usersRes.data;       // List of users
  console.log("Dropdown Data Loaded:", { projects, users });
}

// 2. Create Project Allocation
async function createAllocation(allocationData) {
  const response = await fetch(`${BASE_URL}/ProjectAllocations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(allocationData)
  });
  const result = await response.json();
  if (result.success) {
    console.log("Allocation created successfully:", result.data);
  } else {
    console.error("Error:", result.errors);
  }
}
```

#### C# HttpClient / Blazor / MVC
```csharp
using System.Net.Http.Json;
using SPMS.Common;
using SPMS.Dtos;

public class ProjectAllocationClient
{
    private readonly HttpClient _httpClient;

    public ProjectAllocationClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<List<ProjectAllocationDto>?> GetAllAllocationsAsync()
    {
        var response = await _httpClient.GetFromJsonAsync<ApiResponse<List<ProjectAllocationDto>>>("api/ProjectAllocations");
        return response?.Success == true ? response.Data : new List<ProjectAllocationDto>();
    }

    public async Task<ApiResponse<ProjectAllocationDto>?> CreateAllocationAsync(ProjectAllocationCreateDto dto)
    {
        var response = await _httpClient.PostAsJsonAsync("api/ProjectAllocations", dto);
        return await response.Content.ReadFromJsonAsync<ApiResponse<ProjectAllocationDto>>();
    }
}
```

---

## 3. Module 2: Project Tasks Module

### Models & Foreign Key Relationships

* **Main Entity Model:** `ProjectTask` (`Models/ProjectTask.cs`)
* **Controller:** `ProjectTasksController` (`/api/ProjectTasks`)

#### Foreign Keys in `ProjectTask`:
| Foreign Key Property | Related Model | Related Controller | Lookup Purpose (e.g. Dropdown) |
| :--- | :--- | :--- | :--- |
| `ProjectAllocationId` (long) | `ProjectAllocation` | `/api/ProjectAllocations` | Select which Project Allocation this task belongs to |
| `TaskStatusId` (int) | `TaskStatus` | `/api/TaskStatuses` | Select status (e.g. Pending, In Progress, Completed) |
| `TaskPriorityId` (int) | `TaskPriority` | `/api/TaskPriorities` | Select priority (e.g. Low, Medium, High) |

---

### DTOs (Data Transfer Objects)

#### `ProjectTaskDto` (For Read Responses)
```csharp
public class ProjectTaskDto
{
    public long TaskId { get; set; }
    public long ProjectAllocationId { get; set; }
    public string TaskTitle { get; set; } = null!;
    public string? TaskDescription { get; set; }
    public int TaskStatusId { get; set; }
    public int TaskPriorityId { get; set; }
    public decimal AssignedScore { get; set; }
    public decimal? EarnedScore { get; set; }
    public decimal ProgressPercentage { get; set; }
    public DateTime TaskAssignedDate { get; set; }
    public DateTime? TaskStartDate { get; set; }
    public DateTime? TaskDueDate { get; set; }
    public DateTime? TaskCompletedDate { get; set; }
    public DateTime? NextFollowUpDate { get; set; }
    public string? FacultyRemarks { get; set; }
    public string? StudentRemarks { get; set; }

    // Navigation lookup fields
    public string? TaskStatusName { get; set; }
    public string? TaskPriorityName { get; set; }
}
```

#### `ProjectTaskCreateDto` / `ProjectTaskUpdateDto` (For Insert & Update Requests)
```csharp
public class ProjectTaskCreateDto
{
    public long ProjectAllocationId { get; set; }
    public string TaskTitle { get; set; } = null!;
    public string? TaskDescription { get; set; }
    public int TaskStatusId { get; set; }
    public int TaskPriorityId { get; set; }
    public decimal AssignedScore { get; set; }
    public decimal? EarnedScore { get; set; }
    public decimal ProgressPercentage { get; set; }
    public DateTime TaskAssignedDate { get; set; }
    public DateTime? TaskStartDate { get; set; }
    public DateTime? TaskDueDate { get; set; }
    public DateTime? TaskCompletedDate { get; set; }
    public DateTime? NextFollowUpDate { get; set; }
    public string? FacultyRemarks { get; set; }
    public string? StudentRemarks { get; set; }
}
```

---

### API Endpoints

| HTTP Method | Route | Description | Expected Request Body | Response Wrapper Type |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/ProjectTasks` | Get all tasks with status and priority names | None | `ApiResponse<List<ProjectTaskDto>>` |
| **GET** | `/api/ProjectTasks/{id}` | Get project task by ID | None | `ApiResponse<ProjectTaskDto>` |
| **POST** | `/api/ProjectTasks` | Create a new project task | `ProjectTaskCreateDto` | `ApiResponse<ProjectTaskDto>` |
| **PUT** | `/api/ProjectTasks/{id}` | Update existing project task | `ProjectTaskUpdateDto` | `ApiResponse<ProjectTaskDto>` |
| **DELETE** | `/api/ProjectTasks/{id}` | Delete task by ID | None | `ApiResponse<object>` |

---

### Step-by-Step API Consumption Workflow (Dropdowns + CRUD)

To create or edit a **Project Task** in the client UI:

1. **Populate Foreign Key Dropdowns:**
   - Call `GET /api/ProjectAllocations` $\to$ Bind `ProjectAllocationId` (`value`) and `ProjectTitle` / `StudentFullName` (`text`).
   - Call `GET /api/TaskStatuses` $\to$ Bind `TaskStatusId` (`value`) and `TaskStatusName` (`text`).
   - Call `GET /api/TaskPriorities` $\to$ Bind `TaskPriorityId` (`value`) and `TaskPriorityName` (`text`).

2. **Submit Task:**
   - Send `POST /api/ProjectTasks` with the selected Foreign Key IDs (`ProjectAllocationId`, `TaskStatusId`, `TaskPriorityId`) and task details.

---

### Code Examples (JavaScript / C# HttpClient)

#### JavaScript (Fetch API)
```javascript
const BASE_URL = "https://localhost:7198/api";

// 1. Fetch Task Statuses and Priorities for Dropdowns
async function loadTaskDropdowns() {
  const [statusesRes, prioritiesRes, allocationsRes] = await Promise.all([
    fetch(`${BASE_URL}/TaskStatuses`).then(r => r.json()),
    fetch(`${BASE_URL}/TaskPriorities`).then(r => r.json()),
    fetch(`${BASE_URL}/ProjectAllocations`).then(r => r.json())
  ]);

  console.log("Statuses:", statusesRes.data);
  console.log("Priorities:", prioritiesRes.data);
  console.log("Allocations:", allocationsRes.data);
}

// 2. Create New Task
async function createTask(taskPayload) {
  const response = await fetch(`${BASE_URL}/ProjectTasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskPayload)
  });
  const result = await response.json();
  if (result.success) {
    console.log("Task created successfully:", result.data);
  } else {
    console.error("Errors:", result.errors);
  }
}
```

#### C# HttpClient / Blazor / MVC
```csharp
using System.Net.Http.Json;
using SPMS.Common;
using SPMS.Dtos;

public class ProjectTaskClient
{
    private readonly HttpClient _httpClient;

    public ProjectTaskClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<List<ProjectTaskDto>?> GetAllTasksAsync()
    {
        var response = await _httpClient.GetFromJsonAsync<ApiResponse<List<ProjectTaskDto>>>("api/ProjectTasks");
        return response?.Success == true ? response.Data : new List<ProjectTaskDto>();
    }

    public async Task<ApiResponse<ProjectTaskDto>?> CreateTaskAsync(ProjectTaskCreateDto dto)
    {
        var response = await _httpClient.PostAsJsonAsync("api/ProjectTasks", dto);
        return await response.Content.ReadFromJsonAsync<ApiResponse<ProjectTaskDto>>();
    }

    public async Task<bool> DeleteTaskAsync(long taskId)
    {
        var response = await _httpClient.DeleteAsync($"api/ProjectTasks/{taskId}");
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<object>>();
        return result?.Success ?? false;
    }
}
```

---

## 4. General Frontend / Client Consumption Checklist

When consuming endpoints in your client application:

1. **Always check `response.success` (or `result.Success`)**:
   - If `true`, read the actual payload from `result.data`.
   - If `false`, read errors from `result.errors` or show `result.message`.
2. **For Forms with Foreign Keys**:
   - First fetch the lookup lists via their respective GET endpoints (`ProjectMasters`, `Users`, `TaskStatuses`, `TaskPriorities`, `ProjectAllocations`).
   - Bind IDs to dropdown `<option value="...">` and display titles/names to the user.
   - When submitting, send the selected numeric ID in the DTO payload.
