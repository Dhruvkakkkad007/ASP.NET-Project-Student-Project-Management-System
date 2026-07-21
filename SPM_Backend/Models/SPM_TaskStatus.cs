using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_TaskStatus
    {
        [Key]
        public int TaskStatusID { get; set; }

        public string? TaskStatusName { get; set; }

        public string? TaskStatusCssClass { get; set; }
    }
}
