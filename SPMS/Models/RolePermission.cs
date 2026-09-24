using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace SPMS
{
    [Index(nameof(RoleId), nameof(UserId), IsUnique = true)]
    public class UserRole
    {
        [Key]
        public int UserRoleId { get; set; }

        [ForeignKey(nameof(Role))]
        public int RoleId { get; set; }

        [ForeignKey(nameof(User))]
        public long UserId { get; set; }

        [JsonIgnore]
        public Role? Role { get; set; }

        [JsonIgnore]
        public User? User { get; set; }
    }
}