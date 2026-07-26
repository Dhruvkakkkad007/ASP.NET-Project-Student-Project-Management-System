using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SPM_Backend.Models
{
    [Table("SPM_Role")]
    public class SPM_Role
    {
        [Key]
        [Column("RoleID")]
        public int RoleId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("RoleName")]
        public string? RoleName { get; set; }

        [MaxLength(250)]
        [Column("Description")]
        public string? Description { get; set; }

        // Navigation Properties
        public virtual ICollection<SPM_UserRole> UserRoles { get; set; } = new List<SPM_UserRole>();
    }
}
