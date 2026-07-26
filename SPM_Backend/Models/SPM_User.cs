using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SPM_Backend.Models
{
    [Table("SPM_User")]
    public class SPM_User
    {
        [Key]
        [Column("UserID")]
        public int UserID { get; set; }

        [Column("UserTypeID")]
        public int UserTypeID { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("FullName")]
        public string? FullName { get; set; }

        [MaxLength(100)]
        [Column("UserCode")]
        public string? UserCode { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("Email")]
        public string? Email { get; set; }

        [Required]
        [Column("Password")]
        public string? Password { get; set; }

        [Required]
        [MaxLength(15)]
        [Column("MobileNumber")]
        public string? MobileNumber { get; set; }

        [Required]
        [MaxLength(500)]
        [Column("ProfilePicturePath")]
        public string? ProfilePicturePath { get; set; }

        [Column("IsActive")]
        public bool IsActive { get; set; }

        [Column("IsDeleted")]
        public bool? IsDeleted { get; set; }

        // Navigation Properties
        [ForeignKey("UserTypeID")]
        public virtual SPM_UserType? UserType { get; set; }

        public virtual ICollection<SPM_UserRole> UserRoles { get; set; } = new List<SPM_UserRole>();

        [InverseProperty("Student")]
        public virtual ICollection<SPM_ProjectAllocation> StudentAllocations { get; set; } = new List<SPM_ProjectAllocation>();

        [InverseProperty("Faculty")]
        public virtual ICollection<SPM_ProjectAllocation> FacultyAllocations { get; set; } = new List<SPM_ProjectAllocation>();
    }
}
