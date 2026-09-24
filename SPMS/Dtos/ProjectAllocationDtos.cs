using System;

namespace SPMS.Dtos
{
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

    public class ProjectAllocationUpdateDto
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

        // Navigation fields (minimal)
        public string? ProjectTitle { get; set; }
        public string? StudentFullName { get; set; }
        public string? FacultyFullName { get; set; }
    }
}
