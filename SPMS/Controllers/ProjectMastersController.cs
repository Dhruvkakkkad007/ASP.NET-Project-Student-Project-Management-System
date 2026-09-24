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
    public class ProjectMastersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<ProjectCreateDto> _createValidator;
        private readonly IValidator<ProjectUpdateDto> _updateValidator;

        public ProjectMastersController(
            AppDbContext context,
            IValidator<ProjectCreateDto> createValidator,
            IValidator<ProjectUpdateDto> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<ProjectDto>>>> GetAll()
        {
            var list = await _context.ProjectMasters.ToListAsync();
            var dtos = list.Select(p => new ProjectDto { ProjectId = p.ProjectId, ProjectTitle = p.ProjectTitle, Description = p.Description }).ToList();

            return Ok(new ApiResponse<List<ProjectDto>>
            {
                Success = true,
                Message = "Projects Retrieved Successfully",
                Data = dtos,
                Errors = null
            });
        }

        [HttpGet("{id:long}")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> GetById(long id)
        {
            var project = await _context.ProjectMasters.FindAsync(id);
            if (project is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Project Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No project found with Id {id}"
                    }
                });
            }

            return Ok(new ApiResponse<ProjectDto>
            {
                Success = true,
                Message = "Project Retrieved Successfully",
                Data = new ProjectDto { ProjectId = project.ProjectId, ProjectTitle = project.ProjectTitle, Description = project.Description },
                Errors = null
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<ActionResult<ApiResponse<ProjectDto>>> Create(ProjectCreateDto create)
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

            var entity = new ProjectMaster { ProjectTitle = create.ProjectTitle, Description = create.Description };
            _context.ProjectMasters.Add(entity);
            await _context.SaveChangesAsync();

            var dto = new ProjectDto { ProjectId = entity.ProjectId, ProjectTitle = entity.ProjectTitle, Description = entity.Description };

            return Ok(new ApiResponse<ProjectDto>
            {
                Success = true,
                Message = "Project Added Successfully",
                Data = dto,
                Errors = null
            });
        }

        [HttpPut("{id:long}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> Update(long id, ProjectUpdateDto dto)
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

            var existing = await _context.ProjectMasters.FindAsync(id);
            if (existing is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Project Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No project found with Id {id}"
                    }
                });
            }

            existing.ProjectTitle = dto.ProjectTitle;
            existing.Description = dto.Description;

            await _context.SaveChangesAsync();

            var updatedDto = new ProjectDto { ProjectId = existing.ProjectId, ProjectTitle = existing.ProjectTitle, Description = existing.Description };

            return Ok(new ApiResponse<ProjectDto>
            {
                Success = true,
                Message = "Project Updated Successfully",
                Data = updatedDto,
                Errors = null
            });
        }

        [HttpDelete("{id:long}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> Delete(long id)
        {
            var project = await _context.ProjectMasters.FindAsync(id);
            if (project is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Project Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No project found with Id {id}"
                    }
                });
            }

            _context.ProjectMasters.Remove(project);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Project Deleted Successfully",
                Data = null,
                Errors = null
            });
        }
    }
}