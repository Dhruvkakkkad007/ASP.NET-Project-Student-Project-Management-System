using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SPM_Backend.Data;
using SPM_Backend.Models;

namespace SPM_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserRoleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserRoleController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUserRole()
        {
            var userRoles = await _context.UserRoles.ToListAsync();

            return Ok(userRoles);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userRole = await _context.UserRoles.FindAsync(id);

            if (userRole == null)
            {
                return NotFound();
            }

            return Ok(userRole);
        }

        [HttpPost]
        public async Task<IActionResult> AddUserRole(SPM_UserRole userRole)
        {
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return Ok(userRole);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserRole(SPM_UserRole userRole, int id)
        {
            if (id != userRole.RolePermissionId)
            {
                return BadRequest();
            }

            _context.Entry(userRole).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserRole(int id)
        {
            var userRole = await _context.UserRoles.FindAsync(id);

            if (userRole == null)
            {
                return NotFound();
            }

            _context.UserRoles.Remove(userRole);

            await _context.SaveChangesAsync();

            return Ok("Deleted");
        }
    }
}
