using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_Role
    {
        [Key]
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public string? Description { get; set; }
    }
}
