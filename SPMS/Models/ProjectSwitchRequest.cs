using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SPMS
{
    public class ProjectSwitchRequest
    {
        [Key]
        public long ProjectSwitchRequestId { get; set; }

        public long ProjectAllocationId { get; set; }

        [ForeignKey(nameof(ProjectAllocationId))]
        [JsonIgnore]
        public ProjectAllocation? ProjectAllocation { get; set; }

        public long StudentId { get; set; }

        [ForeignKey(nameof(StudentId))]
        [JsonIgnore]
        public User? Student { get; set; }

        public long FacultyId { get; set; }

        [ForeignKey(nameof(FacultyId))]
        [JsonIgnore]
        public User? Faculty { get; set; }

        public long? CurrentProjectId { get; set; }

        [ForeignKey(nameof(CurrentProjectId))]
        [JsonIgnore]
        public ProjectMaster? CurrentProject { get; set; }

        public long RequestedProjectId { get; set; }

        [ForeignKey(nameof(RequestedProjectId))]
        [JsonIgnore]
        public ProjectMaster? RequestedProject { get; set; }

        [MaxLength(500)]
        public string? Reason { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        [MaxLength(500)]
        public string? FacultyRemarks { get; set; }

        public DateTime RequestedAt { get; set; }

        public DateTime? ReviewedAt { get; set; }
    }
}
