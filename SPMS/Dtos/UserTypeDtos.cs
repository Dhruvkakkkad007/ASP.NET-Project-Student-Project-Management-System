using System;

namespace SPMS.Dtos
{
    public class UserTypeCreateDto
    {
        public string UserTypeName { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class UserTypeUpdateDto
    {
        public string UserTypeName { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class UserTypeDto
    {
        public int UserTypeId { get; set; }
        public string UserTypeName { get; set; } = null!;
        public string? Description { get; set; }
    }
}
