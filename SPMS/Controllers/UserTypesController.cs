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
    public class UserTypesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<UserTypeCreateDto> _createValidator;
        private readonly IValidator<UserTypeUpdateDto> _updateValidator;

        public UserTypesController(
            AppDbContext context,
            IValidator<UserTypeCreateDto> createValidator,
            IValidator<UserTypeUpdateDto> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<UserTypeDto>>>> GetAll()
        {
            var list = await _context.UserTypes.ToListAsync();
            var dtos = list.Select(u => new UserTypeDto { UserTypeId = u.UserTypeId, UserTypeName = u.UserTypeName, Description = u.Description }).ToList();

            return Ok(new ApiResponse<List<UserTypeDto>>
            {
                Success = true,
                Message = "User Types Retrieved Successfully",
                Data = dtos,
                Errors = null
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<UserTypeDto>>> GetById(int id)
        {
            var userType = await _context.UserTypes.FindAsync(id);
            if (userType is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User Type Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No user type found with Id {id}"
                    }
                });
            }

            return Ok(new ApiResponse<UserTypeDto>
            {
                Success = true,
                Message = "User Type Retrieved Successfully",
                Data = new UserTypeDto { UserTypeId = userType.UserTypeId, UserTypeName = userType.UserTypeName, Description = userType.Description },
                Errors = null
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<UserTypeDto>>> Create(UserTypeCreateDto create)
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

            var entity = new UserType { UserTypeName = create.UserTypeName, Description = create.Description };
            _context.UserTypes.Add(entity);
            await _context.SaveChangesAsync();

            var dto = new UserTypeDto { UserTypeId = entity.UserTypeId, UserTypeName = entity.UserTypeName, Description = entity.Description };

            return Ok(new ApiResponse<UserTypeDto>
            {
                Success = true,
                Message = "User Type Added Successfully",
                Data = dto,
                Errors = null
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UserTypeUpdateDto dto)
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

            var existing = await _context.UserTypes.FindAsync(id);
            if (existing is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User Type Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No user type found with Id {id}"
                    }
                });
            }

            existing.UserTypeName = dto.UserTypeName;
            existing.Description = dto.Description;

            await _context.SaveChangesAsync();

            var updatedDto = new UserTypeDto { UserTypeId = existing.UserTypeId, UserTypeName = existing.UserTypeName, Description = existing.Description };

            return Ok(new ApiResponse<UserTypeDto>
            {
                Success = true,
                Message = "User Type Updated Successfully",
                Data = updatedDto,
                Errors = null
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userType = await _context.UserTypes.FindAsync(id);
            if (userType is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User Type Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No user type found with Id {id}"
                    }
                });
            }

            _context.UserTypes.Remove(userType);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "User Type Deleted Successfully",
                Data = null,
                Errors = null
            });
        }
    }
}