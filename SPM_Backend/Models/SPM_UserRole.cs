using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_UserRole
    {
        [Key]
        public int RolePermissionId { get; set; }
        public int RoleId { get; set; }
        public int UserId { get; set; }
    }
}
