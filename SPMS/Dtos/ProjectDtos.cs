using System;

namespace SPMS.Dtos
{
    public class ProjectCreateDto
    {
        public string ProjectTitle { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class ProjectUpdateDto
    {
        public string ProjectTitle { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class ProjectDto
    {
        public long ProjectId { get; set; }
        public string ProjectTitle { get; set; } = null!;
        public string? Description { get; set; }
    }
}
