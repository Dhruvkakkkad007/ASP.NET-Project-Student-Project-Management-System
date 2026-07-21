using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SPM_Backend.Data;
using SPM_Backend.Models;

namespace SPM_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectAllocationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectAllocationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProjectAllocation()
        {
            var projectAllocations = await _context.ProjectAllocations.ToListAsync();

            return Ok(projectAllocations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var projectAllocation = await _context.ProjectAllocations.FindAsync(id);

            if (projectAllocation == null)
            {
                return NotFound();
            }

            return Ok(projectAllocation);
        }

        [HttpPost]
        public async Task<IActionResult> AddProjectAllocation(SPM_ProjectAllocation projectAllocation)
        {
            _context.ProjectAllocations.Add(projectAllocation);

            await _context.SaveChangesAsync();

            return Ok(projectAllocation);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProjectAllocation(SPM_ProjectAllocation projectAllocation, int id)
        {
            if (id != projectAllocation.ProjectAllocationID)
            {
                return BadRequest();
            }

            _context.Entry(projectAllocation).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProjectAllocation(int id)
        {
            var projectAllocation = await _context.ProjectAllocations.FindAsync(id);

            if (projectAllocation == null)
            {
                return NotFound();
            }

            _context.ProjectAllocations.Remove(projectAllocation);

            await _context.SaveChangesAsync();

            return Ok("Deleted");
        }
    }
}
