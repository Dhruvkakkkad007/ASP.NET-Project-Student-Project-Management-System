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
        private readonly IWebHostEnvironment _env;
        private readonly IValidator<UserCreateDto> _createValidator;
        private readonly IValidator<UserUpdateDto> _updateValidator;

        public UsersController(
            AppDbContext context,
            TokenService tokenService,
            IWebHostEnvironment env,
            IValidator<UserCreateDto> createValidator,
            IValidator<UserUpdateDto> updateValidator)
        {
            _context = context;
            _tokenService = tokenService;
            _env = env;
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
                    .Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                    .SingleOrDefaultAsync(u =>
                        u.Email == dto.Email &&
                        u.Password == dto.Password);

                if (user == null)
                {
                    return Unauthorized("Invalid Email or password");
                }

                // If UserType is null but has UserRole, resolve UserType
                if (user.UserType == null && user.UserRoles.Any())
                {
                    var firstRole = user.UserRoles.First().Role;
                    if (firstRole != null)
                    {
                        var matchingType = await _context.UserTypes
                            .FirstOrDefaultAsync(ut => ut.UserTypeName.ToLower() == firstRole.RoleName.ToLower());
                        if (matchingType != null)
                        {
                            user.UserTypeId = matchingType.UserTypeId;
                            user.UserType = matchingType;
                            await _context.SaveChangesAsync();
                        }   
                    }
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
            var users = await _context.Users
                .Include(u => u.UserType)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .ToListAsync();

            var dtos = users.Select(u => new UserDto
            {
                UserId = u.UserId,
                UserTypeId = u.UserTypeId,
                UserTypeName = u.UserType?.UserTypeName ?? u.UserRoles.FirstOrDefault()?.Role?.RoleName ?? "User",
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
            var user = await _context.Users
                .Include(u => u.UserType)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);

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
                    UserTypeName = user.UserType?.UserTypeName ?? user.UserRoles.FirstOrDefault()?.Role?.RoleName ?? "User",
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

        [HttpGet("me")]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetMe()
        {
            var user = await LoadCurrentUserAsync();
            if (user is null)
            {
                return Unauthorized(Fail("Your account could not be identified. Please sign in again."));
            }

            return Ok(new ApiResponse<UserDto>
            {
                Success = true,
                Message = "Profile retrieved",
                Data = MapUser(user)
            });
        }

        [HttpPut("me")]
        public async Task<ActionResult<ApiResponse<ProfileSaveResultDto>>> UpdateMe([FromBody] ProfileUpdateDto dto)
        {
            var user = await LoadCurrentUserAsync();
            if (user is null)
            {
                return Unauthorized(Fail("Your account could not be identified. Please sign in again."));
            }

            user.FullName = (dto.FullName ?? string.Empty).Trim();
            user.MobileNumber = (dto.MobileNumber ?? string.Empty).Trim();
            await _context.SaveChangesAsync();

            var updated = await LoadCurrentUserAsync();
            var token = _tokenService.GenerateToken(updated!);

            return Ok(new ApiResponse<ProfileSaveResultDto>
            {
                Success = true,
                Message = "Profile updated successfully",
                Data = new ProfileSaveResultDto
                {
                    User = MapUser(updated!),
                    Token = token
                }
            });
        }

        [HttpPost("me/change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var user = await LoadCurrentUserAsync();
            if (user is null)
            {
                return Unauthorized(Fail("Your account could not be identified. Please sign in again."));
            }

            if (user.Password != dto.CurrentPassword)
            {
                return BadRequest(Fail("Current password is incorrect."));
            }

            user.Password = dto.NewPassword;
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Password changed successfully",
                Data = null
            });
        }

        [HttpPost("me/photo")]
        [RequestSizeLimit(2_097_152)]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ApiResponse<ProfileSaveResultDto>>> UploadPhoto([FromForm] IFormFile file)
        {
            var user = await LoadCurrentUserAsync();
            if (user is null)
            {
                return Unauthorized(Fail("Your account could not be identified. Please sign in again."));
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest(Fail("Please choose a profile image to upload."));
            }

            if (file.Length > 2_097_152)
            {
                return BadRequest(Fail("Profile image must be 2 MB or smaller."));
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            if (!allowed.Contains(extension))
            {
                return BadRequest(Fail("Use a JPG, PNG, WEBP, or GIF image."));
            }

            var folder = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads", "profiles");
            Directory.CreateDirectory(folder);

            var fileName = $"{user.UserId}_{Guid.NewGuid():N}{extension}";
            var savePath = Path.Combine(folder, fileName);

            await using (var stream = System.IO.File.Create(savePath))
            {
                await file.CopyToAsync(stream);
            }

            if (!string.IsNullOrWhiteSpace(user.ProfilePicturePath) &&
                user.ProfilePicturePath.StartsWith("/uploads/profiles/", StringComparison.OrdinalIgnoreCase))
            {
                var oldName = Path.GetFileName(user.ProfilePicturePath);
                var oldPath = Path.Combine(folder, oldName);
                if (System.IO.File.Exists(oldPath))
                {
                    System.IO.File.Delete(oldPath);
                }
            }

            user.ProfilePicturePath = $"/uploads/profiles/{fileName}";
            await _context.SaveChangesAsync();

            var updated = await LoadCurrentUserAsync();
            var token = _tokenService.GenerateToken(updated!);

            return Ok(new ApiResponse<ProfileSaveResultDto>
            {
                Success = true,
                Message = "Profile photo updated",
                Data = new ProfileSaveResultDto
                {
                    User = MapUser(updated!),
                    Token = token
                }
            });
        }

        [AllowAnonymous]
        [HttpPost]
        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<UserDto>>> Create(UserCreateDto create)
        {
            // Auto-resolve UserTypeId by UserTypeName if supplied (e.g. Admin, Faculty, Student)
            if (!string.IsNullOrWhiteSpace(create.UserTypeName))
            {
                var targetRoleName = create.UserTypeName.Trim();
                var matched = await _context.UserTypes
                    .FirstOrDefaultAsync(u => u.UserTypeName.ToLower() == targetRoleName.ToLower());

                if (matched != null)
                {
                    create.UserTypeId = matched.UserTypeId;
                }
                else
                {
                    var newType = new UserType
                    {
                        UserTypeName = targetRoleName,
                        Description = $"{targetRoleName} Role"
                    };
                    _context.UserTypes.Add(newType);
                    await _context.SaveChangesAsync();
                    create.UserTypeId = newType.UserTypeId;
                }
            }

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

            var created = await _context.Users
                .Include(u => u.UserType)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == user.UserId);

            // Also ensure Role is associated in UserRole if matching Role exists
            if (created?.UserType != null)
            {
                var roleName = created.UserType.UserTypeName;
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName.ToLower() == roleName.ToLower());
                if (role != null)
                {
                    var hasUserRole = await _context.UserRoles.AnyAsync(ur => ur.UserId == user.UserId && ur.RoleId == role.RoleId);
                    if (!hasUserRole)
                    {
                        _context.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = role.RoleId });
                        await _context.SaveChangesAsync();
                    }
                }
            }

            var dto = new UserDto
            {
                UserId = created!.UserId,
                UserTypeId = created.UserTypeId,
                UserTypeName = created.UserType?.UserTypeName ?? created.UserRoles.FirstOrDefault()?.Role?.RoleName ?? "User",
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

            // If UserTypeName was supplied on update, resolve UserTypeId
            if (!string.IsNullOrWhiteSpace(dto.UserTypeName))
            {
                var matched = await _context.UserTypes
                    .FirstOrDefaultAsync(u => u.UserTypeName.ToLower() == dto.UserTypeName.Trim().ToLower());
                if (matched != null)
                {
                    dto.UserTypeId = matched.UserTypeId;
                }
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

            var updated = await _context.Users
                .Include(u => u.UserType)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);

            var updatedDto = new UserDto
            {
                UserId = updated!.UserId,
                UserTypeId = updated.UserTypeId,
                UserTypeName = updated.UserType?.UserTypeName ?? updated.UserRoles.FirstOrDefault()?.Role?.RoleName ?? "User",
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

        private async Task<User?> LoadCurrentUserAsync()
        {
            var raw = User.FindFirst("userId")?.Value;
            if (!long.TryParse(raw, out var userId))
            {
                return null;
            }

            return await _context.Users
                .Include(u => u.UserType)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }

        private static UserDto MapUser(User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                UserTypeId = user.UserTypeId,
                UserTypeName = user.UserType?.UserTypeName ?? user.UserRoles.FirstOrDefault()?.Role?.RoleName ?? "User",
                FullName = user.FullName,
                UserCode = user.UserCode,
                Email = user.Email,
                MobileNumber = user.MobileNumber,
                ProfilePicturePath = user.ProfilePicturePath,
                IsActive = user.IsActive,
                IsDeleted = user.IsDeleted
            };
        }

        private static ApiResponse<object> Fail(string message)
        {
            return new ApiResponse<object>
            {
                Success = false,
                Message = message,
                Data = null,
                Errors = new List<string> { message }
            };
        }
    }
}
