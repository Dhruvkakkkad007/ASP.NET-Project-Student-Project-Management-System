using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SPMS
{
    public class TaskPriority
    {
        [Key]
        public int TaskPriorityId { get; set; }

        [Required]
        [MaxLength(20)]
        public required string TaskPriorityName { get; set; }

        [Required]
        [MaxLength(20)]
        public required string TaskPriorityCssClass { get; set; }

        [JsonIgnore]
        public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
    }
}