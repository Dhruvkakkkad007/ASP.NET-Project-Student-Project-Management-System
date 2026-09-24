using System;

namespace SPMS.Dtos
{
    public class TaskStatusCreateDto
    {
        public string TaskStatusName { get; set; } = null!;
        public string TaskStatusCssClass { get; set; } = null!;
    }

    public class TaskStatusUpdateDto
    {
        public string TaskStatusName { get; set; } = null!;
        public string TaskStatusCssClass { get; set; } = null!;
    }

    public class TaskStatusDto
    {
        public int TaskStatusId { get; set; }
        public string TaskStatusName { get; set; } = null!;
        public string TaskStatusCssClass { get; set; } = null!;
    }
}
