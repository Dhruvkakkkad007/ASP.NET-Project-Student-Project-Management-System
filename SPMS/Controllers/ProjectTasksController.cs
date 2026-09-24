using FluentValidation;
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
    public class ProjectTasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<ProjectTaskCreateDto> _createValidator;
        private readonly IValidator<ProjectTaskUpdateDto> _updateValidator;

        public ProjectTasksController(
            AppDbContext context,
            IValidator<ProjectTaskCreateDto> createValidator,
            IValidator<ProjectTaskUpdateDto> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<ProjectTaskDto>>>> GetAll()
        {
            var list = await _context.Tasks.Include(t => t.TaskStatus).Include(t => t.TaskPriority).ToListAsync();
            var dtos = list.Select(t => new ProjectTaskDto
            {
                TaskId = t.TaskId,
                ProjectAllocationId = t.ProjectAllocationId,
                TaskTitle = t.TaskTitle,
                TaskDescription = t.TaskDescription,
                TaskStatusId = t.TaskStatusId,
                TaskPriorityId = t.TaskPriorityId,
                AssignedScore = t.AssignedScore,
                EarnedScore = t.EarnedScore,
                ProgressPercentage = t.ProgressPercentage,
                TaskAssignedDate = t.TaskAssignedDate,
                TaskStartDate = t.TaskStartDate,
                TaskDueDate = t.TaskDueDate,
                TaskCompletedDate = t.TaskCompletedDate,
                NextFollowUpDate = t.NextFollowUpDate,
                FacultyRemarks = t.FacultyRemarks,
                StudentRemarks = t.StudentRemarks,
                TaskStatusName = t.TaskStatus?.TaskStatusName,
                TaskPriorityName = t.TaskPriority?.TaskPriorityName
            }).ToList();

            return Ok(new ApiResponse<List<ProjectTaskDto>>
            {
                Success = true,
                Message = "Project Tasks Retrieved Successfully",
                Data = dtos,
                Errors = null
            });
        }

        [HttpGet("{id:long}")]
        public async Task<ActionResult<ApiResponse<ProjectTaskDto>>> GetById(long id)
        {
            var t = await _context.Tasks.Include(t => t.TaskStatus).Include(t => t.TaskPriority).FirstOrDefaultAsync(t => t.TaskId == id);
            if (t is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Project Task Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No project task found with Id {id}"
                    }
                });
            }

            return Ok(new ApiResponse<ProjectTaskDto>
            {
                Success = true,
                Message = "Project Task Retrieved Successfully",
                Data = new ProjectTaskDto
                {
                    TaskId = t.TaskId,
                    ProjectAllocationId = t.ProjectAllocationId,
                    TaskTitle = t.TaskTitle,
                    TaskDescription = t.TaskDescription,
                    TaskStatusId = t.TaskStatusId,
                    TaskPriorityId = t.TaskPriorityId,
                    AssignedScore = t.AssignedScore,
                    EarnedScore = t.EarnedScore,
                    ProgressPercentage = t.ProgressPercentage,
                    TaskAssignedDate = t.TaskAssignedDate,
                    TaskStartDate = t.TaskStartDate,
                    TaskDueDate = t.TaskDueDate,
                    TaskCompletedDate = t.TaskCompletedDate,
                    NextFollowUpDate = t.NextFollowUpDate,
                    FacultyRemarks = t.FacultyRemarks,
                    StudentRemarks = t.StudentRemarks,
                    TaskStatusName = t.TaskStatus?.TaskStatusName,
                    TaskPriorityName = t.TaskPriority?.TaskPriorityName
                },
                Errors = null
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<ActionResult<ApiResponse<ProjectTaskDto>>> Create(ProjectTaskCreateDto create)
        {
            var validationResult = await _createValidator.ValidateAsync(create);
            if (!validationResult.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation Failed",
                    Data = null,
                    Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                });
            }

            var entity = new ProjectTask
            {
                ProjectAllocationId = create.ProjectAllocationId,
                TaskTitle = create.TaskTitle,
                TaskDescription = create.TaskDescription,
                TaskStatusId = create.TaskStatusId,
                TaskPriorityId = create.TaskPriorityId,
                AssignedScore = create.AssignedScore,
                EarnedScore = create.EarnedScore,
                ProgressPercentage = create.ProgressPercentage,
                TaskAssignedDate = create.TaskAssignedDate,
                TaskStartDate = create.TaskStartDate,
                TaskDueDate = create.TaskDueDate,
                TaskCompletedDate = create.TaskCompletedDate,
                NextFollowUpDate = create.NextFollowUpDate,
                FacultyRemarks = create.FacultyRemarks,
                StudentRemarks = create.StudentRemarks
            };

            _context.Tasks.Add(entity);
            await _context.SaveChangesAsync();

            var created = await _context.Tasks.Include(t => t.TaskStatus).Include(t => t.TaskPriority).FirstOrDefaultAsync(t => t.TaskId == entity.TaskId);

            var dto = new ProjectTaskDto
            {
                TaskId = created!.TaskId,
                ProjectAllocationId = created.ProjectAllocationId,
                TaskTitle = created.TaskTitle,
                TaskDescription = created.TaskDescription,
                TaskStatusId = created.TaskStatusId,
                TaskPriorityId = created.TaskPriorityId,
                AssignedScore = created.AssignedScore,
                EarnedScore = created.EarnedScore,
                ProgressPercentage = created.ProgressPercentage,
                TaskAssignedDate = created.TaskAssignedDate,
                TaskStartDate = created.TaskStartDate,
                TaskDueDate = created.TaskDueDate,
                TaskCompletedDate = created.TaskCompletedDate,
                NextFollowUpDate = created.NextFollowUpDate,
                FacultyRemarks = created.FacultyRemarks,
                StudentRemarks = created.StudentRemarks,
                TaskStatusName = created.TaskStatus?.TaskStatusName,
                TaskPriorityName = created.TaskPriority?.TaskPriorityName
            };

            return Ok(new ApiResponse<ProjectTaskDto>
            {
                Success = true,
                Message = "Project Task Added Successfully",
                Data = dto,
                Errors = null
            });
        }

        [HttpPut("{id:long}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> Update(long id, ProjectTaskUpdateDto dto)
        {
            var validationResult = await _updateValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation Failed",
                    Data = null,
                    Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                });
            }

            var existing = await _context.Tasks.FindAsync(id);
            if (existing is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Project Task Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No project task found with Id {id}"
                    }
                });
            }

            existing.ProjectAllocationId = dto.ProjectAllocationId;
            existing.TaskTitle = dto.TaskTitle;
            existing.TaskDescription = dto.TaskDescription;
            existing.TaskStatusId = dto.TaskStatusId;
            existing.TaskPriorityId = dto.TaskPriorityId;
            existing.AssignedScore = dto.AssignedScore;
            existing.EarnedScore = dto.EarnedScore;
            existing.ProgressPercentage = dto.ProgressPercentage;
            existing.TaskAssignedDate = dto.TaskAssignedDate;
            existing.TaskStartDate = dto.TaskStartDate;
            existing.TaskDueDate = dto.TaskDueDate;
            existing.TaskCompletedDate = dto.TaskCompletedDate;
            existing.NextFollowUpDate = dto.NextFollowUpDate;
            existing.FacultyRemarks = dto.FacultyRemarks;
            existing.StudentRemarks = dto.StudentRemarks;

            await _context.SaveChangesAsync();

            var updated = await _context.Tasks.Include(t => t.TaskStatus).Include(t => t.TaskPriority).FirstOrDefaultAsync(t => t.TaskId == id);
            var updatedDto = new ProjectTaskDto
            {
                TaskId = updated!.TaskId,
                ProjectAllocationId = updated.ProjectAllocationId,
                TaskTitle = updated.TaskTitle,
                TaskDescription = updated.TaskDescription,
                TaskStatusId = updated.TaskStatusId,
                TaskPriorityId = updated.TaskPriorityId,
                AssignedScore = updated.AssignedScore,
                EarnedScore = updated.EarnedScore,
                ProgressPercentage = updated.ProgressPercentage,
                TaskAssignedDate = updated.TaskAssignedDate,
                TaskStartDate = updated.TaskStartDate,
                TaskDueDate = updated.TaskDueDate,
                TaskCompletedDate = updated.TaskCompletedDate,
                NextFollowUpDate = updated.NextFollowUpDate,
                FacultyRemarks = updated.FacultyRemarks,
                StudentRemarks = updated.StudentRemarks,
                TaskStatusName = updated.TaskStatus?.TaskStatusName,
                TaskPriorityName = updated.TaskPriority?.TaskPriorityName
            };

            return Ok(new ApiResponse<ProjectTaskDto>
            {
                Success = true,
                Message = "Project Task Updated Successfully",
                Data = updatedDto,
                Errors = null
            });
        }

        [HttpDelete("{id:long}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> Delete(long id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Project Task Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No project task found with Id {id}"
                    }
                });
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Project Task Deleted Successfully",
                Data = null,
                Errors = null
            });
        }
    }
}