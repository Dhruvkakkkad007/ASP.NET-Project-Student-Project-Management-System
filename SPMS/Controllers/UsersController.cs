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
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;
        private readonly IValidator<UserCreateDto> _createValidator;
        private readonly IValidator<UserUpdateDto> _updateValidator;

        public UsersController(
            AppDbContext context,
            TokenService tokenService,
            IValidator<UserCreateDto> createValidator,
            IValidator<UserUpdateDto> updateValidator)
        {
            _context = context;
            _tokenService = tokenService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        [HttpPost("~/api/User/login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.UserType)
                    .SingleOrDefaultAsync(u =>
                        u.Email == dto.Email &&
                        u.Password == dto.Password);

                if (user == null)
                {
                    return Unauthorized("Invalid Email or password");
                }

                var token = _tokenService.GenerateToken(user);
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Something went wrong: " + ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetAll()
        {
            var users = await _context.Users.Include(u => u.UserType).ToListAsync();
            var dtos = users.Select(u => new UserDto
            {
                UserId = u.UserId,
                UserTypeId = u.UserTypeId,
                UserTypeName = u.UserType?.UserTypeName,
                FullName = u.FullName,
                UserCode = u.UserCode,
                Email = u.Email,
                MobileNumber = u.MobileNumber,
                ProfilePicturePath = u.ProfilePicturePath,
                IsActive = u.IsActive,
                IsDeleted = u.IsDeleted
            }).ToList();

            return Ok(new ApiResponse<List<UserDto>>
            {
                Success = true,
                Message = "Users Retrieved Successfully",
                Data = dtos,
                Errors = null
            });
        }

        [HttpGet("{id:long}")]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetById(long id)
        {
            var user = await _context.Users.Include(u => u.UserType).FirstOrDefaultAsync(u => u.UserId == id);
            if (user is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No user found with Id {id}"
                    }
                });
            }

            return Ok(new ApiResponse<UserDto>
            {
                Success = true,
                Message = "User Retrieved Successfully",
                Data = new UserDto
                {
                    UserId = user.UserId,
                    UserTypeId = user.UserTypeId,
                    UserTypeName = user.UserType?.UserTypeName,
                    FullName = user.FullName,
                    UserCode = user.UserCode,
                    Email = user.Email,
                    MobileNumber = user.MobileNumber,
                    ProfilePicturePath = user.ProfilePicturePath,
                    IsActive = user.IsActive,
                    IsDeleted = user.IsDeleted
                },
                Errors = null
            });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<UserDto>>> Create(UserCreateDto create)
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

            var user = new User
            {
                UserTypeId = create.UserTypeId,
                FullName = create.FullName,
                UserCode = create.UserCode,
                Email = create.Email,
                Password = create.Password,
                MobileNumber = create.MobileNumber,
                ProfilePicturePath = create.ProfilePicturePath,
                IsActive = create.IsActive,
                IsDeleted = create.IsDeleted
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var created = await _context.Users.Include(u => u.UserType).FirstOrDefaultAsync(u => u.UserId == user.UserId);
            var dto = new UserDto
            {
                UserId = created!.UserId,
                UserTypeId = created.UserTypeId,
                UserTypeName = created.UserType?.UserTypeName,
                FullName = created.FullName,
                UserCode = created.UserCode,
                Email = created.Email,
                MobileNumber = created.MobileNumber,
                ProfilePicturePath = created.ProfilePicturePath,
                IsActive = created.IsActive,
                IsDeleted = created.IsDeleted
            };

            return Ok(new ApiResponse<UserDto>
            {
                Success = true,
                Message = "User Added Successfully",
                Data = dto,
                Errors = null
            });
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, UserUpdateDto dto)
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

            var existing = await _context.Users.FindAsync(id);
            if (existing is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No user found with Id {id}"
                    }
                });
            }

            existing.UserTypeId = dto.UserTypeId;
            existing.FullName = dto.FullName;
            existing.UserCode = dto.UserCode;
            existing.Email = dto.Email;
            existing.Password = dto.Password;
            existing.MobileNumber = dto.MobileNumber;
            existing.ProfilePicturePath = dto.ProfilePicturePath;
            existing.IsActive = dto.IsActive;
            existing.IsDeleted = dto.IsDeleted;

            await _context.SaveChangesAsync();

            var updated = await _context.Users.Include(u => u.UserType).FirstOrDefaultAsync(u => u.UserId == id);
            var updatedDto = new UserDto
            {
                UserId = updated!.UserId,
                UserTypeId = updated.UserTypeId,
                UserTypeName = updated.UserType?.UserTypeName,
                FullName = updated.FullName,
                UserCode = updated.UserCode,
                Email = updated.Email,
                MobileNumber = updated.MobileNumber,
                ProfilePicturePath = updated.ProfilePicturePath,
                IsActive = updated.IsActive,
                IsDeleted = updated.IsDeleted
            };

            return Ok(new ApiResponse<UserDto>
            {
                Success = true,
                Message = "User Updated Successfully",
                Data = updatedDto,
                Errors = null
            });
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User Not Found",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No user found with Id {id}"
                    }
                });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "User Deleted Successfully",
                Data = null,
                Errors = null
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }
    }
}