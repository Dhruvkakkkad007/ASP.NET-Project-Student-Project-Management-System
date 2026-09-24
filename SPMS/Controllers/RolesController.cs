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
    [Authorize(Roles = "Admin")]
    public class RolesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<RoleCreateDto> _createValidator;
        private readonly IValidator<RoleUpdateDto> _updateValidator;

        public RolesController(
            AppDbContext context,
            IValidator<RoleCreateDto> createValidator,
            IValidator<RoleUpdateDto> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<RoleDto>>>> GetAll()
        {
            var list = await _context.Roles.ToListAsync();
            var dtos = list.Select(r => new RoleDto { RoleId = r.RoleId, RoleName = r.RoleName, Description = r.Description }).ToList();

            return Ok(new ApiResponse<List<RoleDto>>
            {
                Success = true,
                Message = "Roles Retrieved Successfully",
                Data = dtos,
                Errors = null
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<RoleDto>>> GetById(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Role Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No role found with Id {id}"
                    }
                });
            }

            return Ok(new ApiResponse<RoleDto>
            {
                Success = true,
                Message = "Role Retrieved Successfully",
                Data = new RoleDto { RoleId = role.RoleId, RoleName = role.RoleName, Description = role.Description },
                Errors = null
            });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<RoleDto>>> Create(RoleCreateDto create)
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

            var entity = new Role { RoleName = create.RoleName, Description = create.Description };
            _context.Roles.Add(entity);
            await _context.SaveChangesAsync();

            var dto = new RoleDto { RoleId = entity.RoleId, RoleName = entity.RoleName, Description = entity.Description };

            return Ok(new ApiResponse<RoleDto>
            {
                Success = true,
                Message = "Role Added Successfully",
                Data = dto,
                Errors = null
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, RoleUpdateDto dto)
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

            var existing = await _context.Roles.FindAsync(id);
            if (existing is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Role Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No role found with Id {id}"
                    }
                });
            }

            existing.RoleName = dto.RoleName;
            existing.Description = dto.Description;

            await _context.SaveChangesAsync();

            var updatedDto = new RoleDto { RoleId = existing.RoleId, RoleName = existing.RoleName, Description = existing.Description };

            return Ok(new ApiResponse<RoleDto>
            {
                Success = true,
                Message = "Role Updated Successfully",
                Data = updatedDto,
                Errors = null
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Role Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No role found with Id {id}"
                    }
                });
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Role Deleted Successfully",
                Data = null,
                Errors = null
            });
        }
    }
}