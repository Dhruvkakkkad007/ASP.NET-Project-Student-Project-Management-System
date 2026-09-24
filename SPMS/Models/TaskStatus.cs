using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SPMS
{
    public class TaskStatus
    {
        [Key]
        public int TaskStatusId { get; set; }

        [Required]
        [MaxLength(20)]
        public required string TaskStatusName { get; set; }

        [Required]
        [MaxLength(100)]
        public required string TaskStatusCssClass { get; set; }

        [JsonIgnore]
        public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
    }
}