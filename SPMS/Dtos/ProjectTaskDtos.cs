using System;

namespace SPMS.Dtos
{
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

    public class ProjectTaskUpdateDto
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

        // Navigation fields
        public string? TaskStatusName { get; set; }
        public string? TaskPriorityName { get; set; }
    }
}
