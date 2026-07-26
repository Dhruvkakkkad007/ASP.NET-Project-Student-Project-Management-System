using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SPM_Backend.Models
{
    [Table("SPM_ProjectAllocation")]
    public class SPM_ProjectAllocation
    {
        [Key]
        [Column("ProjectAllocationID")]
        public int ProjectAllocationID { get; set; }

        [Column("ProjectID")]
        public int ProjectID { get; set; }

        [Column("StudentID")]
        public int StudentID { get; set; }

        [Column("FacultyID")]
        public int FacultyID { get; set; }

        [Column("AssignedDate")]
        public DateTime AssignedDate { get; set; }

        [Column("ProjectStartDate")]
        public DateTime ProjectStartDate { get; set; }

        [Column("ProjectEndDate")]
        public DateTime ProjectEndDate { get; set; }

        [Column("TotalTasksGiven")]
        public int TotalTasksGiven { get; set; }

        [Column("TotalCompletedTasks")]
        public int TotalCompletedTasks { get; set; }

        [Column("ProgressPercentage", TypeName = "decimal(5,2)")]
        public decimal ProgressPercentage { get; set; }

        [MaxLength(1)]
        [Column("OverAllGrade")]
        public string? OverAllGrade { get; set; }

        // Navigation Properties
        [ForeignKey("ProjectID")]
        public virtual SPM_ProjectMaster? Project { get; set; }

        [ForeignKey("StudentID")]
        public virtual SPM_User? Student { get; set; }

        [ForeignKey("FacultyID")]
        public virtual SPM_User? Faculty { get; set; }

        public virtual ICollection<SPM_Task> Tasks { get; set; } = new List<SPM_Task>();
    }
}
