using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_ProjectAllocation
    {
        [Key]
        public int ProjectAllocationID { get; set; }

        public int ProjectID { get; set; }

        public int StudentID { get; set; }

        public int FacultyID { get; set; }

        public DateTime AssignedDate { get; set; }

        public DateTime ProjectStartDate { get; set; }

        public DateTime ProjectEndDate { get; set; }

        public int TotalTasksGiven { get; set; }

        public int TotalCompletedTasks { get; set; }

        public decimal ProgressPercentage { get; set; }

        [Required]
        public string? OverAllGrade { get; set; }
    }
}
