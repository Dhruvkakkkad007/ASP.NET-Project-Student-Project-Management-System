using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SPMS
{
    public class ProjectMaster
    {
        [Key]
        public long ProjectId { get; set; }

        [Required]
        [MaxLength(200)]
        public required string ProjectTitle { get; set; }

        public string? Description { get; set; }

        [JsonIgnore]
        public ICollection<ProjectAllocation> ProjectAllocations { get; set; } = new List<ProjectAllocation>();
    }
}