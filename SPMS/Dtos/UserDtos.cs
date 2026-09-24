using System;

namespace SPMS.Dtos
{
    public class UserCreateDto
    {
        public int UserTypeId { get; set; }
        public string FullName { get; set; } = null!;
        public string? UserCode { get; set; }
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string MobileNumber { get; set; } = null!;
        public string ProfilePicturePath { get; set; } = null!;
        public bool IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class UserUpdateDto
    {
        public int UserTypeId { get; set; }
        public string FullName { get; set; } = null!;
        public string? UserCode { get; set; }
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string MobileNumber { get; set; } = null!;
        public string ProfilePicturePath { get; set; } = null!;
        public bool IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class UserDto
    {
        public long UserId { get; set; }
        public int UserTypeId { get; set; }
        public string? UserTypeName { get; set; }
        public string FullName { get; set; } = null!;
        public string? UserCode { get; set; }
        public string Email { get; set; } = null!;
        public string MobileNumber { get; set; } = null!;
        public string ProfilePicturePath { get; set; } = null!;
        public bool IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class UserLoginDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
