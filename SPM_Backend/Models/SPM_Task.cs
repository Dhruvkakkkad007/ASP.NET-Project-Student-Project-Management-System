using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_Task
    {
        [Key]
        public int TaskId { get; set; }
        public int AllocationID { get; set; }
        public string TaskTitle { get; set; }
        public string? TaskDescription { get; set; }
        public int TaskStatus { get; set; }
        public int PriorityID { get; set; }
        public decimal AssignedScore { get; set; }
        public decimal? EarnedScore { get; set; }
        public decimal ProgressPercentage { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? FacultyRemarks { get; set; }
        public string? StudentRemarks { get; set; }
        public bool IsDeleted { get; set; }
    }
}
