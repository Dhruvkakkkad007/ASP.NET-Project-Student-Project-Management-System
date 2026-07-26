using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SPM_Backend.Models
{
    [Table("SPM_ProjectMaster")]
    public class SPM_ProjectMaster
    {
        [Key]
        [Column("ProjectID")]
        public int ProjectID { get; set; }

        [Required]
        [MaxLength(200)]
        [Column("ProjectTitle")]
        public string? ProjectTitle { get; set; }

        [Column("Description")]
        public string? Description { get; set; }

        // Navigation Properties
        public virtual ICollection<SPM_ProjectAllocation> ProjectAllocations { get; set; } = new List<SPM_ProjectAllocation>();
    }
}
