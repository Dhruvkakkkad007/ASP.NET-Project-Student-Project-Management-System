// Mock Data modeling the SPM Database Schema (SPM_DB_Design.pdf)

// SPM_Role Table
export const initialRoles = [
  {
    RoleID: 1,
    RoleName: "Admin",
    Description:
      "System configuration, user access management, and security permissions",
  },
  {
    RoleID: 2,
    RoleName: "Faculty",
    Description:
      "Project guidance, task assignment, progress evaluation, and semester grading",
  },
  {
    RoleID: 3,
    RoleName: "Student",
    Description:
      "Task execution, progress updates, artifact submission, and milestone tracking",
  },
];

// SPM_UserType Table
export const initialUserTypes = [
  {
    UserTypeID: 1,
    UserTypeName: "Admin",
    Description: "System Administrators",
  },
  {
    UserTypeID: 2,
    UserTypeName: "Faculty",
    Description: "Faculty Members & Project Mentors",
  },
  {
    UserTypeID: 3,
    UserTypeName: "Student",
    Description: "Enrolled Undergrad/Postgrad Students",
  },
];

// SPM_User Table
export const initialUsers = [
  {
    UserID: 1,
    UserTypeID: 1,
    UserCode: "ADM-001",
    FullName: "Dr. Robert Vance",
    Email: "admin@university.edu",
    Password: "adminpassword123",
    MobileNumber: "+1 555-019-2831",
    ProfilePicturePath:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    IsActive: true,
    IsDeleted: false,
    Department: "Computer Science & IT",
    CreatedAt: "2025-01-10",
    RoleID: 1,
    RoleName: "Admin",
  },
  {
    UserID: 2,
    UserTypeID: 2,
    UserCode: "FAC-101",
    FullName: "Prof. Bala Sir",
    Email: "s.jenkins@university.edu",
    Password: "facultypassword123",
    MobileNumber: "+1 555-014-9920",
    ProfilePicturePath:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    IsActive: true,
    IsDeleted: false,
    Department: "Computer Science",
    CreatedAt: "2025-01-15",
    RoleID: 2,
    RoleName: "Faculty",
  },
  {
    UserID: 3,
    UserTypeID: 2,
    UserCode: "FAC-102",
    FullName: "Dr. Alan Turing",
    Email: "a.turing@university.edu",
    Password: "facultypassword123",
    MobileNumber: "+1 555-017-8833",
    ProfilePicturePath:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250",
    IsActive: true,
    IsDeleted: false,
    Department: "Software Engineering",
    CreatedAt: "2025-01-18",
    RoleID: 2,
    RoleName: "Faculty",
  },
  {
    UserID: 4,
    UserTypeID: 3,
    UserCode: "STU-2021-042",
    FullName: "Alex Rivera",
    Email: "alex.rivera@student.edu",
    Password: "studentpassword123",
    MobileNumber: "+1 555-018-7744",
    ProfilePicturePath:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
    IsActive: true,
    IsDeleted: false,
    Department: "Computer Science",
    CreatedAt: "2025-02-01",
    RoleID: 3,
    RoleName: "Student",
  },
  {
    UserID: 5,
    UserTypeID: 3,
    UserCode: "STU-2021-089",
    FullName: "Emily Zhang",
    Email: "emily.zhang@student.edu",
    Password: "studentpassword123",
    MobileNumber: "+1 555-019-3321",
    ProfilePicturePath:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
    IsActive: true,
    IsDeleted: false,
    Department: "Software Engineering",
    CreatedAt: "2025-02-02",
    RoleID: 3,
    RoleName: "Student",
  },
  {
    UserID: 6,
    UserTypeID: 3,
    UserCode: "STU-2021-115",
    FullName: "Marcus Vance",
    Email: "marcus.vance@student.edu",
    Password: "studentpassword123",
    MobileNumber: "+1 555-012-4411",
    ProfilePicturePath:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    IsActive: true,
    IsDeleted: false,
    Department: "Information Technology",
    CreatedAt: "2025-02-05",
    RoleID: 3,
    RoleName: "Student",
  },
  {
    UserID: 7,
    UserTypeID: 3,
    UserCode: "STU-2021-140",
    FullName: "Sophia Patel",
    Email: "sophia.p@student.edu",
    Password: "studentpassword123",
    MobileNumber: "+1 555-015-6677",
    ProfilePicturePath:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    IsActive: false,
    IsDeleted: false,
    Department: "Computer Science",
    CreatedAt: "2025-02-06",
    RoleID: 3,
    RoleName: "Student",
  },
];

// SPM_UserRole Table
export const initialUserRoles = [
  { RolePermissionID: 1, RoleID: 1, UserID: 1 },
  { RolePermissionID: 2, RoleID: 2, UserID: 2 },
  { RolePermissionID: 3, RoleID: 2, UserID: 3 },
  { RolePermissionID: 4, RoleID: 3, UserID: 4 },
  { RolePermissionID: 5, RoleID: 3, UserID: 5 },
  { RolePermissionID: 6, RoleID: 3, UserID: 6 },
  { RolePermissionID: 7, RoleID: 3, UserID: 7 },
];

// SPM_TaskStatus Table
export const initialTaskStatuses = [
  {
    TaskStatusID: 1,
    TaskStatusName: "Pending",
    TaskStatusCssClass: "badge-pending",
  },
  {
    TaskStatusID: 2,
    TaskStatusName: "Ongoing",
    TaskStatusCssClass: "badge-ongoing",
  },
  {
    TaskStatusID: 3,
    TaskStatusName: "Completed",
    TaskStatusCssClass: "badge-completed",
  },
  {
    TaskStatusID: 4,
    TaskStatusName: "Cancelled",
    TaskStatusCssClass: "badge-cancelled",
  },
];

// SPM_TaskPriority Table
export const initialTaskPriorities = [
  {
    TaskPriorityID: 1,
    TaskPriorityName: "Low",
    TaskPriortyCssClass: "priority-low",
  },
  {
    TaskPriorityID: 2,
    TaskPriorityName: "Moderate",
    TaskPriortyCssClass: "priority-medium",
  },
  {
    TaskPriorityID: 3,
    TaskPriorityName: "High",
    TaskPriortyCssClass: "priority-high",
  },
  {
    TaskPriorityID: 4,
    TaskPriorityName: "Critical",
    TaskPriortyCssClass: "priority-critical",
  },
];

// SPM_ProjectMaster Table
export const initialProjects = [
  {
    ProjectID: 101,
    ProjectTitle: "AI-Powered Smart Campus Navigation System",
    Description:
      "An interactive mobile-first application utilizing augmented reality and indoor positioning to guide students across campus facilities.",
    Department: "Computer Science",
    TechStack: "React, Node.js, TensorFlow, AR.js",
    CreatedBy: 1,
    IsActive: true,
    CreatedAt: "2025-01-20",
  },
  {
    ProjectID: 102,
    ProjectTitle: "Blockchain Student Credential Verifier",
    Description:
      "Decentralized ledger application allowing instant verification of university academic transcripts, degrees, and certificates.",
    Department: "Software Engineering",
    TechStack: "Solidity, Ethereum, React, Ethers.js",
    CreatedBy: 1,
    IsActive: true,
    CreatedAt: "2025-01-22",
  },
  {
    ProjectID: 103,
    ProjectTitle: "Automated Code Review & Plagiarism Checker",
    Description:
      "A machine learning system analyzing student source code submissions for syntax quality, security vulnerabilities, and similarity index.",
    Department: "Computer Science",
    TechStack: "Python, AST, FastAPI, React, Docker",
    CreatedBy: 1,
    IsActive: true,
    CreatedAt: "2025-01-25",
  },
  {
    ProjectID: 104,
    ProjectTitle: "IoT Environmental Campus Monitoring",
    Description:
      "Sensors deployed across university buildings monitoring air quality, ambient temperature, occupancy, and energy efficiency in real-time.",
    Department: "Information Technology",
    TechStack: "Raspberry Pi, MQTT, React, Chart.js",
    CreatedBy: 1,
    IsActive: false,
    CreatedAt: "2025-01-28",
  },
];

// SPM_ProjectAllocation Table
export const initialAllocations = [
  {
    ProjectAllocationID: 1,
    AllocationID: 1, // backwards compatibility
    ProjectID: 101,
    ProjectTitle: "AI-Powered Smart Campus Navigation System",
    FacultyID: 2,
    FacultyName: "Prof. Sarah Jenkins",
    StudentID: 4,
    StudentName: "Alex Rivera",
    StudentEmail: "alex.rivera@student.edu",
    StudentAvatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
    ProgressPercentage: 75.0,
    TotalTasksGiven: 4,
    TotalCompletedTasks: 3,
    OverAllGrade: "A",
    AssignedDate: "2025-02-10",
    ProjectStartDate: "2025-02-10",
    ProjectEndDate: "2025-05-30",
    Status: "Active",
  },
  {
    ProjectAllocationID: 2,
    AllocationID: 2,
    ProjectID: 102,
    ProjectTitle: "Blockchain Student Credential Verifier",
    FacultyID: 2,
    FacultyName: "Prof. Sarah Jenkins",
    StudentID: 5,
    StudentName: "Emily Zhang",
    StudentEmail: "emily.zhang@student.edu",
    StudentAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
    ProgressPercentage: 40.0,
    TotalTasksGiven: 5,
    TotalCompletedTasks: 2,
    OverAllGrade: null,
    AssignedDate: "2025-02-12",
    ProjectStartDate: "2025-02-12",
    ProjectEndDate: "2025-05-30",
    Status: "Active",
  },
  {
    ProjectAllocationID: 3,
    AllocationID: 3,
    ProjectID: 103,
    ProjectTitle: "Automated Code Review & Plagiarism Checker",
    FacultyID: 3,
    FacultyName: "Dr. Alan Turing",
    StudentID: 6,
    StudentName: "Marcus Vance",
    StudentEmail: "marcus.vance@student.edu",
    StudentAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    ProgressPercentage: 20.0,
    TotalTasksGiven: 5,
    TotalCompletedTasks: 1,
    OverAllGrade: null,
    AssignedDate: "2025-02-14",
    ProjectStartDate: "2025-02-14",
    ProjectEndDate: "2025-05-30",
    Status: "Active",
  },
];

// SPM_Task Table
export const initialTasks = [
  {
    TaskID: 1,
    ProjectAllocationID: 1,
    AllocationID: 1,
    ProjectID: 101,
    TaskTitle: "System Architecture & Database Schema Design",
    TaskDescription:
      "Create comprehensive ER diagram and define REST API endpoints for user authentication, venue mapping, and route calculation.",
    TaskStatusID: 3, // Completed
    TaskStatusName: "Completed",
    TaskStatusCssClass: "badge-completed",
    TaskPriorityID: 3, // High
    TaskPriorityName: "High",
    TaskPriorityCssClass: "priority-high",
    AssignedScore: 100.0,
    EarnedScore: 95.0,
    ProgressPercentage: 100.0,
    TaskAssignedDate: "2025-02-10",
    TaskStartDate: "2025-02-11",
    TaskDueDate: "2025-02-18",
    TaskCompletedDate: "2025-02-17",
    NextFollowUpDate: "2025-02-20",
    FacultyRemarks:
      "Excellent work! Database indexing recommendations applied. Awarded 95/100.",
    StudentRemarks:
      "Completed ER diagram and generated OpenAPI v3 JSON spec. All endpoints tested in Postman.",
    RemarksHistory: [
      {
        id: 1,
        senderRole: "Faculty",
        senderName: "Prof. Sarah Jenkins",
        senderAvatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
        text: "Please make sure to document all API routes using Swagger/OpenAPI spec.",
        timestamp: "2025-02-11 10:30 AM",
      },
      {
        id: 2,
        senderRole: "Student",
        senderName: "Alex Rivera",
        senderAvatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
        text: "Completed ER diagram and generated OpenAPI v3 JSON spec. All endpoints tested in Postman.",
        timestamp: "2025-02-16 04:15 PM",
      },
      {
        id: 3,
        senderRole: "Faculty",
        senderName: "Prof. Sarah Jenkins",
        senderAvatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
        text: "Excellent work! Database indexing recommendations applied. Awarded 95/100.",
        timestamp: "2025-02-17 11:00 AM",
      },
    ],
  },
  {
    TaskID: 2,
    ProjectAllocationID: 1,
    AllocationID: 1,
    ProjectID: 101,
    TaskTitle: "Indoor BLE Beacon Triangulation Module",
    TaskDescription:
      "Implement Bluetooth Low Energy RSSI distance estimation algorithm for floor plan positioning.",
    TaskStatusID: 3, // Completed
    TaskStatusName: "Completed",
    TaskStatusCssClass: "badge-completed",
    TaskPriorityID: 4, // Critical
    TaskPriorityName: "Critical",
    TaskPriorityCssClass: "priority-critical",
    AssignedScore: 100.0,
    EarnedScore: 90.0,
    ProgressPercentage: 100.0,
    TaskAssignedDate: "2025-02-18",
    TaskStartDate: "2025-02-19",
    TaskDueDate: "2025-02-28",
    TaskCompletedDate: "2025-02-27",
    NextFollowUpDate: "2025-03-01",
    FacultyRemarks: "Good implementation of signal noise filtering.",
    StudentRemarks:
      "Applied 1D Kalman filter. Positional accuracy improved to within 1.2 meters in Building B.",
    RemarksHistory: [
      {
        id: 1,
        senderRole: "Faculty",
        senderName: "Prof. Sarah Jenkins",
        senderAvatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
        text: "Test signal noise filtering using Kalman filter algorithm to minimize drift.",
        timestamp: "2025-02-19 02:00 PM",
      },
      {
        id: 2,
        senderRole: "Student",
        senderName: "Alex Rivera",
        senderAvatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
        text: "Applied 1D Kalman filter. Positional accuracy improved to within 1.2 meters in Building B.",
        timestamp: "2025-02-26 09:30 PM",
      },
    ],
  },
  {
    TaskID: 3,
    ProjectAllocationID: 1,
    AllocationID: 1,
    ProjectID: 101,
    TaskTitle: "Interactive WebGL 3D Campus Map Rendering",
    TaskDescription:
      "Develop Three.js canvas layer for 3D campus building models with interactive room highlights.",
    TaskStatusID: 3, // Completed
    TaskStatusName: "Completed",
    TaskStatusCssClass: "badge-completed",
    TaskPriorityID: 2, // Moderate
    TaskPriorityName: "Moderate",
    TaskPriorityCssClass: "priority-medium",
    AssignedScore: 100.0,
    EarnedScore: 92.0,
    ProgressPercentage: 100.0,
    TaskAssignedDate: "2025-03-01",
    TaskStartDate: "2025-03-02",
    TaskDueDate: "2025-03-12",
    TaskCompletedDate: "2025-03-10",
    NextFollowUpDate: "2025-03-15",
    FacultyRemarks: "Smooth lighting and controls verified.",
    StudentRemarks:
      "Rendered GLTF campus models with smooth camera controls and lighting.",
    RemarksHistory: [
      {
        id: 1,
        senderRole: "Student",
        senderName: "Alex Rivera",
        senderAvatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
        text: "Rendered GLTF campus models with smooth camera controls and lighting.",
        timestamp: "2025-03-09 05:45 PM",
      },
    ],
  },
  {
    TaskID: 4,
    ProjectAllocationID: 1,
    AllocationID: 1,
    ProjectID: 101,
    TaskTitle: "Augmented Reality Directional Wayfinding Overlay",
    TaskDescription:
      "Integrate WebXR / AR.js camera overlay showing directional arrows pointing to destination rooms.",
    TaskStatusID: 2, // Ongoing
    TaskStatusName: "Ongoing",
    TaskStatusCssClass: "badge-ongoing",
    TaskPriorityID: 4, // Critical
    TaskPriorityName: "Critical",
    TaskPriorityCssClass: "priority-critical",
    AssignedScore: 100.0,
    EarnedScore: 0.0,
    ProgressPercentage: 60.0,
    TaskAssignedDate: "2025-03-11",
    TaskStartDate: "2025-03-12",
    TaskDueDate: "2025-03-25",
    TaskCompletedDate: null,
    NextFollowUpDate: "2025-03-18",
    FacultyRemarks:
      "Ensure mobile camera permissions gracefully fallback when AR is unavailable.",
    StudentRemarks:
      "Working on compass heading stabilization. Added 2D fallback map mode for iOS Safari.",
    RemarksHistory: [
      {
        id: 1,
        senderRole: "Faculty",
        senderName: "Prof. Sarah Jenkins",
        senderAvatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
        text: "Ensure mobile camera permissions gracefully fallback when AR is unavailable.",
        timestamp: "2025-03-12 11:00 AM",
      },
      {
        id: 2,
        senderRole: "Student",
        senderName: "Alex Rivera",
        senderAvatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
        text: "Working on compass heading stabilization. Added 2D fallback map mode for iOS Safari.",
        timestamp: "2025-03-14 03:20 PM",
      },
    ],
  },
  {
    TaskID: 5,
    ProjectAllocationID: 2,
    AllocationID: 2,
    ProjectID: 102,
    TaskTitle: "Smart Contract Architecture for Diploma Minting",
    TaskDescription:
      "Develop ERC-721 non-fungible token contract to issue digital degrees signed by Registrar wallet key.",
    TaskStatusID: 3, // Completed
    TaskStatusName: "Completed",
    TaskStatusCssClass: "badge-completed",
    TaskPriorityID: 4, // Critical
    TaskPriorityName: "Critical",
    TaskPriorityCssClass: "priority-critical",
    AssignedScore: 100.0,
    EarnedScore: 88.0,
    ProgressPercentage: 100.0,
    TaskAssignedDate: "2025-02-12",
    TaskStartDate: "2025-02-13",
    TaskDueDate: "2025-02-22",
    TaskCompletedDate: "2025-02-21",
    NextFollowUpDate: "2025-02-25",
    FacultyRemarks: "Good gas optimization on Sepolia.",
    StudentRemarks:
      "Smart contract deployed on Sepolia Testnet with gas optimization.",
    RemarksHistory: [
      {
        id: 1,
        senderRole: "Student",
        senderName: "Emily Zhang",
        senderAvatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
        text: "Smart contract deployed on Sepolia Testnet with gas optimization.",
        timestamp: "2025-02-20 06:10 PM",
      },
    ],
  },
  {
    TaskID: 6,
    ProjectAllocationID: 2,
    AllocationID: 2,
    ProjectID: 102,
    TaskTitle: "IPFS Metadata & Certificate Storage Integration",
    TaskDescription:
      "Store transcript hashes and cryptographic metadata on decentralized Pinata / IPFS node.",
    TaskStatusID: 3, // Completed
    TaskStatusName: "Completed",
    TaskStatusCssClass: "badge-completed",
    TaskPriorityID: 3, // High
    TaskPriorityName: "High",
    TaskPriorityCssClass: "priority-high",
    AssignedScore: 100.0,
    EarnedScore: 94.0,
    ProgressPercentage: 100.0,
    TaskAssignedDate: "2025-02-22",
    TaskStartDate: "2025-02-23",
    TaskDueDate: "2025-03-03",
    TaskCompletedDate: "2025-03-02",
    NextFollowUpDate: "2025-03-05",
    FacultyRemarks: "IPFS metadata structure confirmed.",
    StudentRemarks: "Uploaded certificate metadata pinata payload.",
    RemarksHistory: [],
  },
  {
    TaskID: 7,
    ProjectAllocationID: 2,
    AllocationID: 2,
    ProjectID: 102,
    TaskTitle: "Employer QR Verification Portal Interface",
    TaskDescription:
      "Build public verification webpage allowing prospective employers to scan QR code on degree and verify blockchain signature.",
    TaskStatusID: 2, // Ongoing
    TaskStatusName: "Ongoing",
    TaskStatusCssClass: "badge-ongoing",
    TaskPriorityID: 3, // High
    TaskPriorityName: "High",
    TaskPriorityCssClass: "priority-high",
    AssignedScore: 100.0,
    EarnedScore: 0.0,
    ProgressPercentage: 50.0,
    TaskAssignedDate: "2025-03-04",
    TaskStartDate: "2025-03-05",
    TaskDueDate: "2025-03-20",
    TaskCompletedDate: null,
    NextFollowUpDate: "2025-03-18",
    FacultyRemarks: "Make sure scanner works smoothly on mobile cameras.",
    StudentRemarks: "QR scanner component working with html5-qrcode package.",
    RemarksHistory: [
      {
        id: 1,
        senderRole: "Student",
        senderName: "Emily Zhang",
        senderAvatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
        text: "QR scanner component working with html5-qrcode package.",
        timestamp: "2025-03-10 01:15 PM",
      },
    ],
  },
  {
    TaskID: 8,
    ProjectAllocationID: 2,
    AllocationID: 2,
    ProjectID: 102,
    TaskTitle: "Metamask Web3 Wallet Authentication Flow",
    TaskDescription:
      "Implement sign-in with Ethereum for faculty members issuing credentials.",
    TaskStatusID: 1, // Pending
    TaskStatusName: "Pending",
    TaskStatusCssClass: "badge-pending",
    TaskPriorityID: 2, // Moderate
    TaskPriorityName: "Moderate",
    TaskPriorityCssClass: "priority-medium",
    AssignedScore: 100.0,
    EarnedScore: 0.0,
    ProgressPercentage: 0.0,
    TaskAssignedDate: "2025-03-15",
    TaskStartDate: null,
    TaskDueDate: "2025-03-30",
    TaskCompletedDate: null,
    NextFollowUpDate: "2025-03-22",
    FacultyRemarks: null,
    StudentRemarks: null,
    RemarksHistory: [],
  },
  {
    TaskID: 9,
    ProjectAllocationID: 3,
    AllocationID: 3,
    ProjectID: 103,
    TaskTitle: "Abstract Syntax Tree (AST) Parser Engine",
    TaskDescription:
      "Build Python AST parsing module to compare code structure regardless of variable renaming.",
    TaskStatusID: 3, // Completed
    TaskStatusName: "Completed",
    TaskStatusCssClass: "badge-completed",
    TaskPriorityID: 4, // Critical
    TaskPriorityName: "Critical",
    TaskPriorityCssClass: "priority-critical",
    AssignedScore: 100.0,
    EarnedScore: 85.0,
    ProgressPercentage: 100.0,
    TaskAssignedDate: "2025-02-14",
    TaskStartDate: "2025-02-15",
    TaskDueDate: "2025-02-25",
    TaskCompletedDate: "2025-02-24",
    NextFollowUpDate: "2025-02-28",
    FacultyRemarks: "AST generation tests passed.",
    StudentRemarks: "Built AST parsing module.",
    RemarksHistory: [],
  },
  {
    TaskID: 10,
    ProjectAllocationID: 3,
    AllocationID: 3,
    ProjectID: 103,
    TaskTitle: "Winnowing Algorithm Implementation for Similarity Search",
    TaskDescription:
      "Construct fingerprinting module using rolling hash for detecting copied blocks.",
    TaskStatusID: 2, // Ongoing
    TaskStatusName: "Ongoing",
    TaskStatusCssClass: "badge-ongoing",
    TaskPriorityID: 3, // High
    TaskPriorityName: "High",
    TaskPriorityCssClass: "priority-high",
    AssignedScore: 100.0,
    EarnedScore: 0.0,
    ProgressPercentage: 35.0,
    TaskAssignedDate: "2025-02-26",
    TaskStartDate: "2025-02-27",
    TaskDueDate: "2025-03-15",
    TaskCompletedDate: null,
    NextFollowUpDate: "2025-03-16",
    FacultyRemarks: null,
    StudentRemarks: null,
    RemarksHistory: [],
  },
  {
    TaskID: 11,
    ProjectAllocationID: 3,
    AllocationID: 3,
    ProjectID: 103,
    TaskTitle: "Multi-Language Support (C++, Java, Python)",
    TaskDescription:
      "Integrate Tree-sitter parsers to support cross-language similarity analysis.",
    TaskStatusID: 1, // Pending
    TaskStatusName: "Pending",
    TaskStatusCssClass: "badge-pending",
    TaskPriorityID: 2, // Moderate
    TaskPriorityName: "Moderate",
    TaskPriorityCssClass: "priority-medium",
    AssignedScore: 100.0,
    EarnedScore: 0.0,
    ProgressPercentage: 0.0,
    TaskAssignedDate: "2025-03-01",
    TaskStartDate: null,
    TaskDueDate: "2025-03-25",
    TaskCompletedDate: null,
    NextFollowUpDate: "2025-03-20",
    FacultyRemarks: null,
    StudentRemarks: null,
    RemarksHistory: [],
  },
];
