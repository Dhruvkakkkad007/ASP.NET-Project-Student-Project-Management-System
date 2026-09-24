using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace SPMS
{
    [Index(nameof(Email), IsUnique = true)]
    public class User
    {

        [Key]
        public long UserId { get; set; }

        [ForeignKey(nameof(UserType))]
        public int UserTypeId { get; set; }

        [Required]
        [MaxLength(150)]
        public required string FullName { get; set; }

        [MaxLength(100)]
        public string? UserCode { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public required string Email { get; set; }

        [Required]
        [MaxLength(200)]
        public required string Password { get; set; }

        [Required]
        [Phone]
        [MaxLength(15)]
        public required string MobileNumber { get; set; }

        [Required]
        [MaxLength(500)]
        public required string ProfilePicturePath { get; set; }

        public bool IsActive { get; set; }

        public bool? IsDeleted { get; set; }

        [JsonIgnore]
        public UserType? UserType { get; set; }

        [JsonIgnore]
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

        [JsonIgnore]
        public ICollection<ProjectAllocation> StudentProjectAllocations { get; set; } = new List<ProjectAllocation>();

        [JsonIgnore]
        public ICollection<ProjectAllocation> FacultyProjectAllocations { get; set; } = new List<ProjectAllocation>();
    }
}