using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_User
    {
        [Key]
        public int UserID { get; set; }

        public int UserTypeID { get; set; }

        public string? FullName { get; set; }


        [Required]
        public string? UserCode { get; set; }

        public string? Email { get; set; }

        public string? Password { get; set; }

        public string? MobileNumber { get; set; }

        public string? ProfilePicturePath { get; set; }

        public bool IsActive { get; set; }


        [Required]
        public bool? IsDeleted { get; set; }
    }
}
