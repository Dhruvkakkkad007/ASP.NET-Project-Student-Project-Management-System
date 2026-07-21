using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_TaskPriority
    {
        [Key]
        public int TaskPriorityID { get; set; }

        public string? TaskPriorityName { get; set; }

        public string? TaskPriorityCssClass { get; set; }
    }
}
