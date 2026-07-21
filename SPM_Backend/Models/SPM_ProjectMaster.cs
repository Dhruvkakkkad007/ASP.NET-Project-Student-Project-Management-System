using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_ProjectMaster
    {
        [Key]
        public int ProjectID { get; set; }

        
        public string? ProjectTitle { get; set; }

        [Required]
        public string? Description { get; set; }
    }
}
