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
    public class ProjectAllocationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<ProjectAllocationCreateDto> _createValidator;
        private readonly IValidator<ProjectAllocationUpdateDto> _updateValidator;

        public ProjectAllocationsController(
            AppDbContext context,
            IValidator<ProjectAllocationCreateDto> createValidator,
            IValidator<ProjectAllocationUpdateDto> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<ProjectAllocationDto>>>> GetAll()
        {
            var list = await _context.ProjectAllocations.Include(a => a.Project).Include(a => a.Student).Include(a => a.Faculty).ToListAsync();
            var dtos = list.Select(a => new ProjectAllocationDto
            {
                ProjectAllocationId = a.ProjectAllocationId,
                ProjectId = a.ProjectId,
                StudentId = a.StudentId,
                FacultyId = a.FacultyId,
                AssignedDate = a.AssignedDate,
                ProjectStartDate = a.ProjectStartDate,
                ProjectEndDate = a.ProjectEndDate,
                TotalTasksGiven = a.TotalTasksGiven,
                TotalCompletedTasks = a.TotalCompletedTasks,
                ProgressPercentage = a.ProgressPercentage,
                OverAllGrade = a.OverAllGrade,
                ProjectTitle = a.Project?.ProjectTitle,
                StudentFullName = a.Student?.FullName,
                FacultyFullName = a.Faculty?.FullName
            }).ToList();

            return Ok(new ApiResponse<List<ProjectAllocationDto>>
            {
                Success = true,
                Message = "Project Allocations Retrieved Successfully",
                Data = dtos,
                Errors = null
            });
        }

        [HttpGet("{id:long}")]
        public async Task<ActionResult<ApiResponse<ProjectAllocationDto>>> GetById(long id)
        {
            var a = await _context.ProjectAllocations.Include(a => a.Project).Include(a => a.Student).Include(a => a.Faculty).FirstOrDefaultAsync(a => a.ProjectAllocationId == id);
            if (a is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Project Allocation Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No project allocation found with Id {id}"
                    }
                });
            }

            return Ok(new ApiResponse<ProjectAllocationDto>
            {
                Success = true,
                Message = "Project Allocation Retrieved Successfully",
                Data = new ProjectAllocationDto
                {
                    ProjectAllocationId = a.ProjectAllocationId,
                    ProjectId = a.ProjectId,
                    StudentId = a.StudentId,
                    FacultyId = a.FacultyId,
                    AssignedDate = a.AssignedDate,
                    ProjectStartDate = a.ProjectStartDate,
                    ProjectEndDate = a.ProjectEndDate,
                    TotalTasksGiven = a.TotalTasksGiven,
                    TotalCompletedTasks = a.TotalCompletedTasks,
                    ProgressPercentage = a.ProgressPercentage,
                    OverAllGrade = a.OverAllGrade,
                    ProjectTitle = a.Project?.ProjectTitle,
                    StudentFullName = a.Student?.FullName,
                    FacultyFullName = a.Faculty?.FullName
                },
                Errors = null
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<ActionResult<ApiResponse<ProjectAllocationDto>>> Create(ProjectAllocationCreateDto create)
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

            var entity = new ProjectAllocation
            {
                ProjectId = create.ProjectId,
                StudentId = create.StudentId,
                FacultyId = create.FacultyId,
                AssignedDate = create.AssignedDate,
                ProjectStartDate = create.ProjectStartDate,
                ProjectEndDate = create.ProjectEndDate,
                TotalTasksGiven = create.TotalTasksGiven,
                TotalCompletedTasks = create.TotalCompletedTasks,
                ProgressPercentage = create.ProgressPercentage,
                OverAllGrade = create.OverAllGrade
            };

            _context.ProjectAllocations.Add(entity);
            await _context.SaveChangesAsync();

            var created = await _context.ProjectAllocations.Include(a => a.Project).Include(a => a.Student).Include(a => a.Faculty).FirstOrDefaultAsync(a => a.ProjectAllocationId == entity.ProjectAllocationId);

            var dto = new ProjectAllocationDto
            {
                ProjectAllocationId = created!.ProjectAllocationId,
                ProjectId = created.ProjectId,
                StudentId = created.StudentId,
                FacultyId = created.FacultyId,
                AssignedDate = created.AssignedDate,
                ProjectStartDate = created.ProjectStartDate,
                ProjectEndDate = created.ProjectEndDate,
                TotalTasksGiven = created.TotalTasksGiven,
                TotalCompletedTasks = created.TotalCompletedTasks,
                ProgressPercentage = created.ProgressPercentage,
                OverAllGrade = created.OverAllGrade,
                ProjectTitle = created.Project?.ProjectTitle,
                StudentFullName = created.Student?.FullName,
                FacultyFullName = created.Faculty?.FullName
            };

            return Ok(new ApiResponse<ProjectAllocationDto>
            {
                Success = true,
                Message = "Project Allocation Added Successfully",
                Data = dto,
                Errors = null
            });
        }

        [HttpPut("{id:long}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> Update(long id, ProjectAllocationUpdateDto dto)
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

            var existing = await _context.ProjectAllocations.FindAsync(id);
            if (existing is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Project Allocation Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No project allocation found with Id {id}"
                    }
                });
            }

            existing.ProjectId = dto.ProjectId;
            existing.StudentId = dto.StudentId;
            existing.FacultyId = dto.FacultyId;
            existing.AssignedDate = dto.AssignedDate;
            existing.ProjectStartDate = dto.ProjectStartDate;
            existing.ProjectEndDate = dto.ProjectEndDate;
            existing.TotalTasksGiven = dto.TotalTasksGiven;
            existing.TotalCompletedTasks = dto.TotalCompletedTasks;
            existing.ProgressPercentage = dto.ProgressPercentage;
            existing.OverAllGrade = dto.OverAllGrade;

            await _context.SaveChangesAsync();

            var updated = await _context.ProjectAllocations.Include(a => a.Project).Include(a => a.Student).Include(a => a.Faculty).FirstOrDefaultAsync(a => a.ProjectAllocationId == id);
            var updatedDto = new ProjectAllocationDto
            {
                ProjectAllocationId = updated!.ProjectAllocationId,
                ProjectId = updated.ProjectId,
                StudentId = updated.StudentId,
                FacultyId = updated.FacultyId,
                AssignedDate = updated.AssignedDate,
                ProjectStartDate = updated.ProjectStartDate,
                ProjectEndDate = updated.ProjectEndDate,
                TotalTasksGiven = updated.TotalTasksGiven,
                TotalCompletedTasks = updated.TotalCompletedTasks,
                ProgressPercentage = updated.ProgressPercentage,
                OverAllGrade = updated.OverAllGrade,
                ProjectTitle = updated.Project?.ProjectTitle,
                StudentFullName = updated.Student?.FullName,
                FacultyFullName = updated.Faculty?.FullName
            };

            return Ok(new ApiResponse<ProjectAllocationDto>
            {
                Success = true,
                Message = "Project Allocation Updated Successfully",
                Data = updatedDto,
                Errors = null
            });
        }

        [HttpDelete("{id:long}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> Delete(long id)
        {
            var allocation = await _context.ProjectAllocations.FindAsync(id);
            if (allocation is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Project Allocation Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No project allocation found with Id {id}"
                    }
                });
            }

            _context.ProjectAllocations.Remove(allocation);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Project Allocation Deleted Successfully",
                Data = null,
                Errors = null
            });
        }
    }
}