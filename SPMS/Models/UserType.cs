using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SPMS
{
    public class UserType
    {
        [Key]
        public int UserTypeId { get; set; }

        [Required]
        [MaxLength(50)]
        public required string UserTypeName { get; set; }

        [MaxLength(250)]
        public string? Description { get; set; }

        [JsonIgnore]
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}