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
    public class TaskPrioritiesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<TaskPriorityCreateDto> _createValidator;
        private readonly IValidator<TaskPriorityUpdateDto> _updateValidator;

        public TaskPrioritiesController(
            AppDbContext context,
            IValidator<TaskPriorityCreateDto> createValidator,
            IValidator<TaskPriorityUpdateDto> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<TaskPriorityDto>>>> GetAll()
        {
            var list = await _context.TaskPriorities.ToListAsync();
            var dtos = list.Select(t => new TaskPriorityDto { TaskPriorityId = t.TaskPriorityId, TaskPriorityName = t.TaskPriorityName, TaskPriorityCssClass = t.TaskPriorityCssClass }).ToList();

            return Ok(new ApiResponse<List<TaskPriorityDto>>
            {
                Success = true,
                Message = "Task Priorities Retrieved Successfully",
                Data = dtos,
                Errors = null
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<TaskPriorityDto>>> GetById(int id)
        {
            var taskPriority = await _context.TaskPriorities.FindAsync(id);
            if (taskPriority is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Task Priority Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No task priority found with Id {id}"
                    }
                });
            }

            return Ok(new ApiResponse<TaskPriorityDto>
            {
                Success = true,
                Message = "Task Priority Retrieved Successfully",
                Data = new TaskPriorityDto { TaskPriorityId = taskPriority.TaskPriorityId, TaskPriorityName = taskPriority.TaskPriorityName, TaskPriorityCssClass = taskPriority.TaskPriorityCssClass },
                Errors = null
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<TaskPriorityDto>>> Create(TaskPriorityCreateDto create)
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

            var entity = new TaskPriority { TaskPriorityName = create.TaskPriorityName, TaskPriorityCssClass = create.TaskPriorityCssClass };
            _context.TaskPriorities.Add(entity);
            await _context.SaveChangesAsync();

            var dto = new TaskPriorityDto { TaskPriorityId = entity.TaskPriorityId, TaskPriorityName = entity.TaskPriorityName, TaskPriorityCssClass = entity.TaskPriorityCssClass };

            return Ok(new ApiResponse<TaskPriorityDto>
            {
                Success = true,
                Message = "Task Priority Added Successfully",
                Data = dto,
                Errors = null
            });
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, TaskPriorityUpdateDto dto)
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

            var existing = await _context.TaskPriorities.FindAsync(id);
            if (existing is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Task Priority Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No task priority found with Id {id}"
                    }
                });
            }

            existing.TaskPriorityName = dto.TaskPriorityName;
            existing.TaskPriorityCssClass = dto.TaskPriorityCssClass;

            await _context.SaveChangesAsync();

            var updatedDto = new TaskPriorityDto { TaskPriorityId = existing.TaskPriorityId, TaskPriorityName = existing.TaskPriorityName, TaskPriorityCssClass = existing.TaskPriorityCssClass };

            return Ok(new ApiResponse<TaskPriorityDto>
            {
                Success = true,
                Message = "Task Priority Updated Successfully",
                Data = updatedDto,
                Errors = null
            });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var taskPriority = await _context.TaskPriorities.FindAsync(id);
            if (taskPriority is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Task Priority Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No task priority found with Id {id}"
                    }
                });
            }

            _context.TaskPriorities.Remove(taskPriority);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Task Priority Deleted Successfully",
                Data = null,
                Errors = null
            });
        }
    }
}