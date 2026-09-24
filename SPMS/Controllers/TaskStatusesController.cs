using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SPMS.Common;
using SPMS.Data;
using SPMS.Dtos;
using TaskStatus = SPMS.TaskStatus;

namespace SPMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TaskStatusesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<TaskStatusCreateDto> _createValidator;
        private readonly IValidator<TaskStatusUpdateDto> _updateValidator;

        public TaskStatusesController(
            AppDbContext context,
            IValidator<TaskStatusCreateDto> createValidator,
            IValidator<TaskStatusUpdateDto> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<TaskStatusDto>>>> GetAll()
        {
            var list = await _context.TaskStatuses.ToListAsync();
            var dtos = list.Select(t => new TaskStatusDto { TaskStatusId = t.TaskStatusId, TaskStatusName = t.TaskStatusName, TaskStatusCssClass = t.TaskStatusCssClass }).ToList();

            return Ok(new ApiResponse<List<TaskStatusDto>>
            {
                Success = true,
                Message = "Task Statuses Retrieved Successfully",
                Data = dtos,
                Errors = null
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<TaskStatusDto>>> GetById(int id)
        {
            var taskStatus = await _context.TaskStatuses.FindAsync(id);
            if (taskStatus is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Task Status Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No task status found with Id {id}"
                    }
                });
            }

            return Ok(new ApiResponse<TaskStatusDto>
            {
                Success = true,
                Message = "Task Status Retrieved Successfully",
                Data = new TaskStatusDto { TaskStatusId = taskStatus.TaskStatusId, TaskStatusName = taskStatus.TaskStatusName, TaskStatusCssClass = taskStatus.TaskStatusCssClass },
                Errors = null
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<TaskStatusDto>>> Create(TaskStatusCreateDto create)
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

            var entity = new TaskStatus { TaskStatusName = create.TaskStatusName, TaskStatusCssClass = create.TaskStatusCssClass };
            _context.TaskStatuses.Add(entity);
            await _context.SaveChangesAsync();

            var dto = new TaskStatusDto { TaskStatusId = entity.TaskStatusId, TaskStatusName = entity.TaskStatusName, TaskStatusCssClass = entity.TaskStatusCssClass };

            return Ok(new ApiResponse<TaskStatusDto>
            {
                Success = true,
                Message = "Task Status Added Successfully",
                Data = dto,
                Errors = null
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, TaskStatusUpdateDto dto)
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

            var existing = await _context.TaskStatuses.FindAsync(id);
            if (existing is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Task Status Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No task status found with Id {id}"
                    }
                });
            }

            existing.TaskStatusName = dto.TaskStatusName;
            existing.TaskStatusCssClass = dto.TaskStatusCssClass;

            await _context.SaveChangesAsync();

            var updatedDto = new TaskStatusDto { TaskStatusId = existing.TaskStatusId, TaskStatusName = existing.TaskStatusName, TaskStatusCssClass = existing.TaskStatusCssClass };

            return Ok(new ApiResponse<TaskStatusDto>
            {
                Success = true,
                Message = "Task Status Updated Successfully",
                Data = updatedDto,
                Errors = null
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var taskStatus = await _context.TaskStatuses.FindAsync(id);
            if (taskStatus is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Task Status Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No task status found with Id {id}"
                    }
                });
            }

            _context.TaskStatuses.Remove(taskStatus);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Task Status Deleted Successfully",
                Data = null,
                Errors = null
            });
        }
    }
}