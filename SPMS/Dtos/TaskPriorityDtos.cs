using System;

namespace SPMS.Dtos
{
    public class TaskPriorityCreateDto
    {
        public string TaskPriorityName { get; set; } = null!;
        public string TaskPriorityCssClass { get; set; } = null!;
    }

    public class TaskPriorityUpdateDto
    {
        public string TaskPriorityName { get; set; } = null!;
        public string TaskPriorityCssClass { get; set; } = null!;
    }

    public class TaskPriorityDto
    {
        public int TaskPriorityId { get; set; }
        public string TaskPriorityName { get; set; } = null!;
        public string TaskPriorityCssClass { get; set; } = null!;
    }
}
