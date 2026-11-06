using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SPMS.Common;
using SPMS.Data;
using SPMS.Dtos;
using SPMS.Services;

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
            var allTasks = await _context.Tasks.ToListAsync();
            var tasksByAlloc = allTasks.GroupBy(t => t.ProjectAllocationId).ToDictionary(g => g.Key, g => g.ToList());

            bool dbNeedsSave = false;

            var dtos = list.Select(a =>
            {
                int totalTasks = a.TotalTasksGiven;
                int completedTasks = a.TotalCompletedTasks;
                decimal progress = a.ProgressPercentage;

                if (tasksByAlloc.TryGetValue(a.ProjectAllocationId, out var allocTasks) && allocTasks.Count > 0)
                {
                    totalTasks = allocTasks.Count;
                    completedTasks = allocTasks.Count(t => t.TaskStatusId == 3);
                    decimal totalProg = 0m;
                    foreach (var t in allocTasks)
                    {
                        if (t.TaskStatusId == 3)
                            totalProg += 100m;
                        else if (t.ProgressPercentage > 0)
                            totalProg += t.ProgressPercentage;
                        else if (t.TaskStatusId == 2)
                            totalProg += 50m;
                    }
                    progress = Math.Round(totalProg / totalTasks, 2);

                    if (a.TotalTasksGiven != totalTasks || a.TotalCompletedTasks != completedTasks || a.ProgressPercentage != progress)
                    {
                        a.TotalTasksGiven = totalTasks;
                        a.TotalCompletedTasks = completedTasks;
                        a.ProgressPercentage = progress;
                        dbNeedsSave = true;
                    }
                }

                return new ProjectAllocationDto
                {
                    ProjectAllocationId = a.ProjectAllocationId,
                    ProjectId = a.ProjectId,
                    StudentId = a.StudentId,
                    FacultyId = a.FacultyId,
                    AssignedDate = a.AssignedDate,
                    ProjectStartDate = a.ProjectStartDate,
                    ProjectEndDate = a.ProjectEndDate,
                    TotalTasksGiven = totalTasks,
                    TotalCompletedTasks = completedTasks,
                    ProgressPercentage = progress,
                    OverAllGrade = a.OverAllGrade,
                    ProjectTitle = a.Project?.ProjectTitle,
                    StudentFullName = a.Student?.FullName,
                    FacultyFullName = a.Faculty?.FullName,
                    StudentEmail = a.Student?.Email,
                    FacultyEmail = a.Faculty?.Email
                };
            }).ToList();

            if (dbNeedsSave)
            {
                try { await _context.SaveChangesAsync(); } catch { }
            }

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

            var allocTasks = await _context.Tasks.Where(t => t.ProjectAllocationId == id).ToListAsync();
            if (allocTasks.Count > 0)
            {
                a.TotalTasksGiven = allocTasks.Count;
                a.TotalCompletedTasks = allocTasks.Count(t => t.TaskStatusId == 3);
                decimal totalProg = 0m;
                foreach (var t in allocTasks)
                {
                    if (t.TaskStatusId == 3)
                        totalProg += 100m;
                    else if (t.ProgressPercentage > 0)
                        totalProg += t.ProgressPercentage;
                    else if (t.TaskStatusId == 2)
                        totalProg += 50m;
                }
                a.ProgressPercentage = Math.Round(totalProg / allocTasks.Count, 2);
                try { await _context.SaveChangesAsync(); } catch { }
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
                    FacultyFullName = a.Faculty?.FullName,
                    StudentEmail = a.Student?.Email,
                    FacultyEmail = a.Faculty?.Email
                },
                Errors = null
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Faculty,Student")]
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

            var projectId = create.ProjectId is > 0 ? create.ProjectId : null;
            if (projectId.HasValue && !await _context.ProjectMasters.AnyAsync(p => p.ProjectId == projectId.Value))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation Failed",
                    Data = null,
                    Errors = new List<string> { "Selected project was not found." }
                });
            }

            var alreadyAllocated = await _context.ProjectAllocations
                .AnyAsync(a => a.StudentId == create.StudentId);
            if (alreadyAllocated)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "This student already has a project allocation.",
                    Data = null,
                    Errors = new List<string> { "Edit the existing allocation, or wait for the student to select a project." }
                });
            }

            var entity = new ProjectAllocation
            {
                ProjectId = projectId,
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
            try
            {
                await SaveAllocationAsync(entity);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Could not save allocation. Restart the API if this is the first time using an empty project.",
                    Data = null,
                    Errors = new List<string> { ex.InnerException?.Message ?? ex.Message }
                });
            }

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
                FacultyFullName = created.Faculty?.FullName,
                StudentEmail = created.Student?.Email,
                FacultyEmail = created.Faculty?.Email
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
        [Authorize(Roles = "Admin,Faculty,Student")]
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

            var projectId = dto.ProjectId is > 0 ? dto.ProjectId : null;
            if (projectId.HasValue && !await _context.ProjectMasters.AnyAsync(p => p.ProjectId == projectId.Value))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation Failed",
                    Data = null,
                    Errors = new List<string> { "Selected project was not found." }
                });
            }

            var duplicateStudent = await _context.ProjectAllocations
                .AnyAsync(a => a.StudentId == dto.StudentId && a.ProjectAllocationId != id);
            if (duplicateStudent)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "This student already has another project allocation.",
                    Data = null,
                    Errors = new List<string> { "A student can only be assigned to one allocation." }
                });
            }

            existing.ProjectId = projectId;
            existing.StudentId = dto.StudentId;
            existing.FacultyId = dto.FacultyId;
            existing.AssignedDate = dto.AssignedDate;
            existing.ProjectStartDate = dto.ProjectStartDate;
            existing.ProjectEndDate = dto.ProjectEndDate;
            existing.TotalTasksGiven = dto.TotalTasksGiven;
            existing.ProgressPercentage = dto.ProgressPercentage;
            existing.TotalCompletedTasks = dto.ProgressPercentage >= 100 
                ? dto.TotalTasksGiven 
                : dto.TotalCompletedTasks;
            existing.OverAllGrade = dto.OverAllGrade;

            try
            {
                await SaveAllocationAsync(existing);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Could not update allocation.",
                    Data = null,
                    Errors = new List<string> { ex.InnerException?.Message ?? ex.Message }
                });
            }

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
                FacultyFullName = updated.Faculty?.FullName,
                StudentEmail = updated.Student?.Email,
                FacultyEmail = updated.Faculty?.Email
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
        [Authorize(Roles = "Admin")]
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

        private async Task SaveAllocationAsync(ProjectAllocation entity)
        {
            try
            {
                await _context.SaveChangesAsync();
                return;
            }
            catch (DbUpdateException)
            {
                try
                {
                    AllocationSchemaFix.EnsureOptionalProjectId(_context);
                    await _context.Database.ExecuteSqlRawAsync(
                        "ALTER TABLE SPM_ProjectAllocation ALTER COLUMN OverAllGrade NVARCHAR(10) NULL;");
                }
                catch
                {
                    // Column may already be nullable.
                }

                try
                {
                    await _context.SaveChangesAsync();
                    return;
                }
                catch (DbUpdateException)
                {
                    if (!string.IsNullOrEmpty(entity.OverAllGrade) && entity.OverAllGrade.Length > 1)
                    {
                        entity.OverAllGrade = entity.OverAllGrade.Substring(0, 1);
                        await _context.SaveChangesAsync();
                        return;
                    }

                    throw;
                }
            }
        }
    }
}
