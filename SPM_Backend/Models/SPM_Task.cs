using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SPM_Backend.Models
{
    [Table("SPM_Task")]
    public class SPM_Task
    {
        [Key]
        [Column("TaskID")]
        public int TaskID { get; set; }

        [Column("ProjectAllocationID")]
        public int ProjectAllocationID { get; set; }

        [Required]
        [MaxLength(200)]
        [Column("TaskTitle")]
        public string? TaskTitle { get; set; }

        [Column("TaskDescription")]
        public string? TaskDescription { get; set; }

        [Column("TaskStatusID")]
        public int TaskStatusID { get; set; }

        [Column("TaskPriorityID")]
        public int TaskPriorityID { get; set; }

        [Column("AssignedScore", TypeName = "decimal(5,2)")]
        public decimal AssignedScore { get; set; }

        [Column("EarnedScore", TypeName = "decimal(5,2)")]
        public decimal? EarnedScore { get; set; }

        [Column("ProgressPercentage", TypeName = "decimal(5,2)")]
        public decimal ProgressPercentage { get; set; }

        [Column("TaskAssignedDate")]
        public DateTime TaskAssignedDate { get; set; }

        [Column("TaskStartDate")]
        public DateTime? TaskStartDate { get; set; }

        [Column("TaskDueDate")]
        public DateTime? TaskDueDate { get; set; }

        [Column("TaskCompletedDate")]
        public DateTime? TaskCompletedDate { get; set; }

        [Column("NextFollowUpDate")]
        public DateTime? NextFollowUpDate { get; set; }

        [MaxLength(500)]
        [Column("FacultyRemarks")]
        public string? FacultyRemarks { get; set; }

        [MaxLength(500)]
        [Column("StudentRemarks")]
        public string? StudentRemarks { get; set; }

        // Navigation Properties
        [ForeignKey("ProjectAllocationID")]
        public virtual SPM_ProjectAllocation? ProjectAllocation { get; set; }

        [ForeignKey("TaskStatusID")]
        public virtual SPM_TaskStatus? TaskStatus { get; set; }

        [ForeignKey("TaskPriorityID")]
        public virtual SPM_TaskPriority? TaskPriority { get; set; }
    }
}
