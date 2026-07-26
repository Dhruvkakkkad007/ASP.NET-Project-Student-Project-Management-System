using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SPM_Backend.Models
{
    [Table("SPM_TaskStatus")]
    public class SPM_TaskStatus
    {
        [Key]
        [Column("TaskStatusID")]
        public int TaskStatusID { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("TaskStatusName")]
        public string? TaskStatusName { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("TaskStatusCssClass")]
        public string? TaskStatusCssClass { get; set; }

        // Navigation Properties
        public virtual ICollection<SPM_Task> Tasks { get; set; } = new List<SPM_Task>();
    }
}
