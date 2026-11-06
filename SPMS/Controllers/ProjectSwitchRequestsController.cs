using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SPMS.Common;
using SPMS.Data;
using SPMS.Dtos;

namespace SPMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectSwitchRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectSwitchRequestsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<ProjectSwitchRequestDto>>>> GetAll()
        {
            var query = IncludeAll(_context.ProjectSwitchRequests);
            var userId = GetCurrentUserId();
            var role = GetCurrentRole();

            if (role.Equals("Student", StringComparison.OrdinalIgnoreCase) && userId.HasValue)
            {
                query = query.Where(r => r.StudentId == userId.Value);
            }
            else if (role.Equals("Faculty", StringComparison.OrdinalIgnoreCase) && userId.HasValue)
            {
                query = query.Where(r => r.FacultyId == userId.Value);
            }

            var list = await query.OrderByDescending(r => r.RequestedAt).ToListAsync();
            return Ok(new ApiResponse<List<ProjectSwitchRequestDto>>
            {
                Success = true,
                Message = "Project switch requests retrieved",
                Data = list.Select(Map).ToList()
            });
        }

        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<ApiResponse<ProjectSwitchRequestDto>>> Create(
            [FromBody] ProjectSwitchRequestCreateDto dto)
        {
            var studentId = GetCurrentUserId();
            if (!studentId.HasValue)
            {
                return Unauthorized(Fail("Your student account could not be identified. Please sign in again."));
            }

            if (dto.RequestedProjectId <= 0)
            {
                return BadRequest(Fail("Please select a project to switch to."));
            }

            var requestedProject = await _context.ProjectMasters.FindAsync(dto.RequestedProjectId);
            if (requestedProject is null)
            {
                return BadRequest(Fail("The requested project was not found."));
            }

            var allocation = await _context.ProjectAllocations
                .FirstOrDefaultAsync(a => a.StudentId == studentId.Value);
            if (allocation is null)
            {
                return BadRequest(Fail("You do not have a faculty allocation yet. Ask admin to assign a faculty guide first."));
            }

            if (!allocation.ProjectId.HasValue || allocation.ProjectId.Value <= 0)
            {
                return BadRequest(Fail("Select your first project directly. Faculty approval is only needed to switch later."));
            }

            if (allocation.ProjectId.Value == dto.RequestedProjectId)
            {
                return BadRequest(Fail("You are already enrolled in this project."));
            }

            var existingPending = await _context.ProjectSwitchRequests
                .FirstOrDefaultAsync(r =>
                    r.ProjectAllocationId == allocation.ProjectAllocationId &&
                    r.Status == "Pending");

            if (existingPending != null)
            {
                existingPending.RequestedProjectId = dto.RequestedProjectId;
                existingPending.Reason = string.IsNullOrWhiteSpace(dto.Reason) ? null : dto.Reason.Trim();
                existingPending.RequestedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var updated = await IncludeAll(_context.ProjectSwitchRequests)
                    .FirstAsync(r => r.ProjectSwitchRequestId == existingPending.ProjectSwitchRequestId);

                return Ok(new ApiResponse<ProjectSwitchRequestDto>
                {
                    Success = true,
                    Message = "Your previous pending switch request was updated and sent to your faculty guide.",
                    Data = Map(updated)
                });
            }

            var entity = new ProjectSwitchRequest
            {
                ProjectAllocationId = allocation.ProjectAllocationId,
                StudentId = allocation.StudentId,
                FacultyId = allocation.FacultyId,
                CurrentProjectId = allocation.ProjectId,
                RequestedProjectId = dto.RequestedProjectId,
                Reason = string.IsNullOrWhiteSpace(dto.Reason) ? null : dto.Reason.Trim(),
                Status = "Pending",
                RequestedAt = DateTime.UtcNow
            };

            _context.ProjectSwitchRequests.Add(entity);
            await _context.SaveChangesAsync();

            var created = await IncludeAll(_context.ProjectSwitchRequests)
                .FirstAsync(r => r.ProjectSwitchRequestId == entity.ProjectSwitchRequestId);

            return Ok(new ApiResponse<ProjectSwitchRequestDto>
            {
                Success = true,
                Message = "Switch request sent to your faculty guide for approval.",
                Data = Map(created)
            });
        }

        [HttpPost("{id:long}/accept")]
        [Authorize(Roles = "Faculty,Admin")]
        public async Task<ActionResult<ApiResponse<ProjectSwitchRequestDto>>> Accept(
            long id,
            [FromBody] ProjectSwitchRequestReviewDto? dto)
        {
            var request = await IncludeAll(_context.ProjectSwitchRequests)
                .FirstOrDefaultAsync(r => r.ProjectSwitchRequestId == id);
            if (request is null) return NotFound(Fail("Switch request not found."));
            if (request.Status != "Pending") return BadRequest(Fail("This request has already been reviewed."));

            if (!CanReview(request))
            {
                return StatusCode(403, Fail("Only the assigned faculty guide can accept this request."));
            }

            var allocation = await _context.ProjectAllocations.FindAsync(request.ProjectAllocationId);
            if (allocation is null) return BadRequest(Fail("The student allocation no longer exists."));

            allocation.ProjectId = request.RequestedProjectId;
            request.Status = "Accepted";
            request.FacultyRemarks = string.IsNullOrWhiteSpace(dto?.FacultyRemarks) ? null : dto!.FacultyRemarks.Trim();
            request.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updated = await IncludeAll(_context.ProjectSwitchRequests)
                .FirstAsync(r => r.ProjectSwitchRequestId == id);

            return Ok(new ApiResponse<ProjectSwitchRequestDto>
            {
                Success = true,
                Message = "Switch approved. Student, faculty, and admin records now show the new project.",
                Data = Map(updated)
            });
        }

        [HttpPost("{id:long}/decline")]
        [Authorize(Roles = "Faculty,Admin")]
        public async Task<ActionResult<ApiResponse<ProjectSwitchRequestDto>>> Decline(
            long id,
            [FromBody] ProjectSwitchRequestReviewDto? dto)
        {
            var request = await IncludeAll(_context.ProjectSwitchRequests)
                .FirstOrDefaultAsync(r => r.ProjectSwitchRequestId == id);
            if (request is null) return NotFound(Fail("Switch request not found."));
            if (request.Status != "Pending") return BadRequest(Fail("This request has already been reviewed."));

            if (!CanReview(request))
            {
                return StatusCode(403, Fail("Only the assigned faculty guide can decline this request."));
            }

            request.Status = "Declined";
            request.FacultyRemarks = string.IsNullOrWhiteSpace(dto?.FacultyRemarks) ? null : dto!.FacultyRemarks.Trim();
            request.ReviewedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var updated = await IncludeAll(_context.ProjectSwitchRequests)
                .FirstAsync(r => r.ProjectSwitchRequestId == id);

            return Ok(new ApiResponse<ProjectSwitchRequestDto>
            {
                Success = true,
                Message = "Switch request declined. The student remains on their current project.",
                Data = Map(updated)
            });
        }

        [HttpPost("{id:long}/cancel")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<ApiResponse<object>>> Cancel(long id)
        {
            var studentId = GetCurrentUserId();
            var request = await _context.ProjectSwitchRequests.FindAsync(id);
            if (request is null) return NotFound(Fail("Switch request not found."));
            if (studentId != request.StudentId) return StatusCode(403, Fail("You can only cancel your own request."));
            if (request.Status != "Pending") return BadRequest(Fail("Only a pending request can be cancelled."));

            _context.ProjectSwitchRequests.Remove(request);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Switch request cancelled.",
                Data = null
            });
        }

        private bool CanReview(ProjectSwitchRequest request)
        {
            var role = GetCurrentRole();
            if (role.Equals("Admin", StringComparison.OrdinalIgnoreCase)) return true;
            var userId = GetCurrentUserId();
            return userId.HasValue && userId.Value == request.FacultyId;
        }

        private long? GetCurrentUserId()
        {
            var raw = User.FindFirst("userId")?.Value;
            return long.TryParse(raw, out var id) ? id : null;
        }

        private string GetCurrentRole()
        {
            return User.FindFirst("role")?.Value
                ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
                ?? string.Empty;
        }

        private static IQueryable<ProjectSwitchRequest> IncludeAll(IQueryable<ProjectSwitchRequest> query)
        {
            return query
                .Include(r => r.Student)
                .Include(r => r.Faculty)
                .Include(r => r.CurrentProject)
                .Include(r => r.RequestedProject)
                .Include(r => r.ProjectAllocation);
        }

        private static ProjectSwitchRequestDto Map(ProjectSwitchRequest r)
        {
            return new ProjectSwitchRequestDto
            {
                ProjectSwitchRequestId = r.ProjectSwitchRequestId,
                ProjectAllocationId = r.ProjectAllocationId,
                StudentId = r.StudentId,
                FacultyId = r.FacultyId,
                CurrentProjectId = r.CurrentProjectId,
                RequestedProjectId = r.RequestedProjectId,
                Reason = r.Reason,
                Status = r.Status,
                FacultyRemarks = r.FacultyRemarks,
                RequestedAt = r.RequestedAt,
                ReviewedAt = r.ReviewedAt,
                StudentFullName = r.Student?.FullName,
                StudentEmail = r.Student?.Email,
                FacultyFullName = r.Faculty?.FullName,
                CurrentProjectTitle = r.CurrentProject?.ProjectTitle,
                RequestedProjectTitle = r.RequestedProject?.ProjectTitle
            };
        }

        private static ApiResponse<object> Fail(string message)
        {
            return new ApiResponse<object>
            {
                Success = false,
                Message = message,
                Data = null,
                Errors = new List<string> { message }
            };
        }
    }
}
