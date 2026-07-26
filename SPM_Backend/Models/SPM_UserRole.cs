using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SPM_Backend.Models
{
    [Table("SPM_UserRole")]
    public class SPM_UserRole
    {
        [Key]
        [Column("RolePermissionID")]
        public int RolePermissionId { get; set; }

        [Column("RoleID")]
        public int RoleId { get; set; }

        [Column("UserID")]
        public int UserId { get; set; }

        // Navigation Properties
        [ForeignKey("RoleId")]
        public virtual SPM_Role? Role { get; set; }

        [ForeignKey("UserId")]
        public virtual SPM_User? User { get; set; }
    }
}
