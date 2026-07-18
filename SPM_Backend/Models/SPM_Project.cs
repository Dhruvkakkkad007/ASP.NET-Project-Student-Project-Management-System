using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_Project
    {
        [Key]
        public int ProjectId { get; set; }
        public string ProjectTitle { get; set; }
        public string? Description { get; set; }
        public int StudentId { get; set; }
        public int FacultyId { get; set; }
        public DateTime AssignedDate { get; set; }
        public bool IsDeleted { get; set; }
        public int ProjectStatus { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public decimal ProgressPercentage { get; set; }
    }
}
