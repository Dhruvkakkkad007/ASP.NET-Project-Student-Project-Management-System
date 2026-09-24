using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace SPMS
{
    public class ProjectTask
    {
        [Key]
        public long TaskId { get; set; }

        [ForeignKey(nameof(ProjectAllocation))]
        public long ProjectAllocationId { get; set; }

        [Required]
        [MaxLength(200)]
        public required string TaskTitle { get; set; }

        public string? TaskDescription { get; set; }

        [ForeignKey(nameof(TaskStatus))]
        public int TaskStatusId { get; set; }

        [ForeignKey(nameof(TaskPriority))]
        public int TaskPriorityId { get; set; }

        [Precision(5, 2)]
        public decimal AssignedScore { get; set; }

        [Precision(5, 2)]
        public decimal? EarnedScore { get; set; }

        [Precision(5, 2)]
        public decimal ProgressPercentage { get; set; }

        [Precision(0)]
        public DateTime TaskAssignedDate { get; set; }

        [Precision(0)]
        public DateTime? TaskStartDate { get; set; }

        [Precision(0)]
        public DateTime? TaskDueDate { get; set; }

        [Precision(0)]
        public DateTime? TaskCompletedDate { get; set; }

        [Precision(0)]
        public DateTime? NextFollowUpDate { get; set; }

        [MaxLength(500)]
        public string? FacultyRemarks { get; set; }

        [MaxLength(500)]
        public string? StudentRemarks { get; set; }

        [JsonIgnore]
        public ProjectAllocation? ProjectAllocation { get; set; }

        [JsonIgnore]
        public TaskStatus? TaskStatus { get; set; }

        [JsonIgnore]
        public TaskPriority? TaskPriority { get; set; }
    }
}