using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_UserType
    {
        public int UserTypeID { get; set; }

       
        public string? UserTypeName { get; set; }

        [Required]
        public string? Description { get; set; }
    }
}
