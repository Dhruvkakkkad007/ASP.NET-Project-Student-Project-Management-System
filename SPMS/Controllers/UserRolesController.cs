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
    public class UserRolesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<UserRoleCreateDto> _createValidator;
        private readonly IValidator<UserRoleUpdateDto> _updateValidator;

        public UserRolesController(
            AppDbContext context,
            IValidator<UserRoleCreateDto> createValidator,
            IValidator<UserRoleUpdateDto> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<UserRoleDto>>>> GetAll()
        {
            var list = await _context.UserRoles.Include(r => r.Role).Include(r => r.User).ToListAsync();
            var dtos = list.Select(r => new UserRoleDto
            {
                UserRoleId = r.UserRoleId,
                RoleId = r.RoleId,
                UserId = r.UserId,
                RoleName = r.Role?.RoleName,
                UserFullName = r.User?.FullName
            }).ToList();

            return Ok(new ApiResponse<List<UserRoleDto>>
            {
                Success = true,
                Message = "User Roles Retrieved Successfully",
                Data = dtos,
                Errors = null
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<UserRoleDto>>> GetById(int id)
        {
            var userRole = await _context.UserRoles.Include(r => r.Role).Include(r => r.User).FirstOrDefaultAsync(r => r.UserRoleId == id);
            if (userRole is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User Role Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No user role found with Id {id}"
                    }
                });
            }

            return Ok(new ApiResponse<UserRoleDto>
            {
                Success = true,
                Message = "User Role Retrieved Successfully",
                Data = new UserRoleDto
                {
                    UserRoleId = userRole.UserRoleId,
                    RoleId = userRole.RoleId,
                    UserId = userRole.UserId,
                    RoleName = userRole.Role?.RoleName,
                    UserFullName = userRole.User?.FullName
                },
                Errors = null
            });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<UserRoleDto>>> Create(UserRoleCreateDto create)
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

            var entity = new UserRole
            {
                RoleId = create.RoleId,
                UserId = create.UserId
            };
            _context.UserRoles.Add(entity);
            await _context.SaveChangesAsync();

            var created = await _context.UserRoles.Include(r => r.Role).Include(r => r.User).FirstOrDefaultAsync(r => r.UserRoleId == entity.UserRoleId);
            var dto = new UserRoleDto
            {
                UserRoleId = created!.UserRoleId,
                RoleId = created.RoleId,
                UserId = created.UserId,
                RoleName = created.Role?.RoleName,
                UserFullName = created.User?.FullName
            };

            return Ok(new ApiResponse<UserRoleDto>
            {
                Success = true,
                Message = "User Role Added Successfully",
                Data = dto,
                Errors = null
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UserRoleUpdateDto dto)
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

            var existing = await _context.UserRoles.FindAsync(id);
            if (existing is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User Role Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No user role found with Id {id}"
                    }
                });
            }

            existing.RoleId = dto.RoleId;
            existing.UserId = dto.UserId;

            await _context.SaveChangesAsync();

            var updated = await _context.UserRoles.Include(r => r.Role).Include(r => r.User).FirstOrDefaultAsync(r => r.UserRoleId == id);
            var updatedDto = new UserRoleDto
            {
                UserRoleId = updated!.UserRoleId,
                RoleId = updated.RoleId,
                UserId = updated.UserId,
                RoleName = updated.Role?.RoleName,
                UserFullName = updated.User?.FullName
            };

            return Ok(new ApiResponse<UserRoleDto>
            {
                Success = true,
                Message = "User Role Updated Successfully",
                Data = updatedDto,
                Errors = null
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userRole = await _context.UserRoles.FindAsync(id);
            if (userRole is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User Role Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No user role found with Id {id}"
                    }
                });
            }

            _context.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "User Role Deleted Successfully",
                Data = null,
                Errors = null
            });
        }
    }
}