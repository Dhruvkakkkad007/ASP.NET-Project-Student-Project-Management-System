using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SPM_Backend.Models
{
    [Table("SPM_UserType")]
    public class SPM_UserType
    {
        [Key]
        [Column("UserTypeID")]
        public int UserTypeID { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("UserTypeName")]
        public string? UserTypeName { get; set; }

        [MaxLength(250)]
        [Column("Description")]
        public string? Description { get; set; }

        // Navigation Properties
        public virtual ICollection<SPM_User> Users { get; set; } = new List<SPM_User>();
    }
}
