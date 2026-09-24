using System;

namespace SPMS.Dtos
{
    public class RoleCreateDto
    {
        public string RoleName { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class RoleUpdateDto
    {
        public string RoleName { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class RoleDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = null!;
        public string? Description { get; set; }
    }
}
