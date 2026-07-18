using System.ComponentModel.DataAnnotations;

namespace SPM_Backend.Models
{
    public class SPM_Status
    {
        [Key]
        public int StatusID { get; set; }
        public string StatusName { get; set; }
        public string StatusCssClass { get; set; }
    }
}
