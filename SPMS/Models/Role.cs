using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SPMS
{
    public class Role
    {
        [Key]
        public int RoleId { get; set; }

        [Required]
        [MaxLength(50)]
        public required string RoleName { get; set; }

        [MaxLength(250)]
        public string? Description { get; set; }

        [JsonIgnore]    
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}