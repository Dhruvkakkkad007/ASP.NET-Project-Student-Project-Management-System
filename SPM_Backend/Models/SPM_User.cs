using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_User
    {
        [Key]
        public int UserId { get; set; }

        
        public string FullName { get; set; }

       
        public string Email { get; set; }

      
        public string Password { get; set; }

       
        public string MobileNumber { get; set; }

        public string ProfilePicturePath { get; set; }

        public bool IsActive { get; set; }

        public bool? IsDeleted { get; set; }
    }
}
