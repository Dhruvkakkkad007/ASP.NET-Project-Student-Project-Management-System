using System;

namespace SPMS.Dtos
{
    public class ProjectSwitchRequestCreateDto
    {
        public long RequestedProjectId { get; set; }
        public string? Reason { get; set; }
    }

    public class ProjectSwitchRequestReviewDto
    {
        public string? FacultyRemarks { get; set; }
    }

    public class ProjectSwitchRequestDto
    {
        public long ProjectSwitchRequestId { get; set; }
        public long ProjectAllocationId { get; set; }
        public long StudentId { get; set; }
        public long FacultyId { get; set; }
        public long? CurrentProjectId { get; set; }
        public long RequestedProjectId { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; } = "Pending";
        public string? FacultyRemarks { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }

        public string? StudentFullName { get; set; }
        public string? StudentEmail { get; set; }
        public string? FacultyFullName { get; set; }
        public string? CurrentProjectTitle { get; set; }
        public string? RequestedProjectTitle { get; set; }
    }
}
