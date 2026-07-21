using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_Task
    {
        [Key]
        public int TaskID { get; set; }

        public int ProjectAllocationID { get; set; }

        public string? TaskTitle { get; set; }


        [Required]
        public string? TaskDescription { get; set; }

        public int TaskStatusID { get; set; }

        public int TaskPriorityID { get; set; }

        public decimal AssignedScore { get; set; }


        [Required]
        public decimal? EarnedScore { get; set; }

        public decimal ProgressPercentage { get; set; }

        public DateTime TaskAssignedDate { get; set; }

        [Required]
        public DateTime? TaskStartDate { get; set; }


        [Required]
        public DateTime? TaskDueDate { get; set; }

        [Required]
        public DateTime? TaskCompletedDate { get; set; }


        [Required]
        public DateTime? NextFollowUpDate { get; set; }


        [Required]
        public string? FacultyRemarks { get; set; }


        [Required]
        public string? StudentRemarks { get; set; }
    }
}
