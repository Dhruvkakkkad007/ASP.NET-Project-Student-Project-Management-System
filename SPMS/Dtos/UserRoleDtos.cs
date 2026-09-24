using System;

namespace SPMS.Dtos
{
    public class UserRoleCreateDto
    {
        public int RoleId { get; set; }
        public long UserId { get; set; }
    }

    public class UserRoleUpdateDto
    {
        public int RoleId { get; set; }
        public long UserId { get; set; }
    }

    public class UserRoleDto
    {
        public int UserRoleId { get; set; }
        public int RoleId { get; set; }
        public long UserId { get; set; }

        // Navigation fields (minimal)
        public string? RoleName { get; set; }
        public string? UserFullName { get; set; }
    }
}
