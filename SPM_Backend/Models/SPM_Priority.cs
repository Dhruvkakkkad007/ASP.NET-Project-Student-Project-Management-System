using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_Priority
    {
        [Key]
        public int PriorityID { get; set; }
        public string PriorityName { get; set; }
        public string PriorityCssClass { get; set; }
    }
}
