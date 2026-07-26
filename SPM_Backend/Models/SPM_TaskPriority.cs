using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SPM_Backend.Models
{
    [Table("SPM_TaskPriority")]
    public class SPM_TaskPriority
    {
        [Key]
        [Column("TaskPriorityID")]
        public int TaskPriorityID { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("TaskPriorityName")]
        public string? TaskPriorityName { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("TaskPriortyCssClass")]
        public string? TaskPriorityCssClass { get; set; }

        // Navigation Properties
        public virtual ICollection<SPM_Task> Tasks { get; set; } = new List<SPM_Task>();
    }
}
