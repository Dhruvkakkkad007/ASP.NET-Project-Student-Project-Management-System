using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace SPMS
{
    public class ProjectAllocation
    {
        [Key]
        public long ProjectAllocationId { get; set; }

        [ForeignKey("Project")]
        public long ProjectId { get; set; }

        [JsonIgnore]
        public ProjectMaster? Project { get; set; }

        public long StudentId { get; set; }

        [ForeignKey("StudentId")]

        [JsonIgnore]
        public User? Student { get; set; }

        public long FacultyId { get; set; }

        [ForeignKey("FacultyId")]

        [JsonIgnore]
        public User? Faculty { get; set; }

        [Precision(0)]
        public DateTime AssignedDate { get; set; }

        [Precision(0)]
        public DateTime ProjectStartDate { get; set; }

        [Precision(0)]
        public DateTime ProjectEndDate { get; set; }

        public int TotalTasksGiven { get; set; }

        public int TotalCompletedTasks { get; set; }

        [Precision(5, 2)]
        public decimal ProgressPercentage { get; set; }

        [MaxLength(1)]
        public string? OverAllGrade { get; set; }


        [JsonIgnore]
        public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
    }
}