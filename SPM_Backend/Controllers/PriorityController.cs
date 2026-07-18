using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SPM_Backend.Data;
using SPM_Backend.Models;

namespace SPM_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PriorityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PriorityController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPriority()
        {
            var priorities = await _context.Priorities.ToListAsync();

            return Ok(priorities);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var priority = await _context.Priorities.FindAsync(id);

            if (priority == null)
            {
                return NotFound();
            }

            return Ok(priority);
        }

        [HttpPost]
        public async Task<IActionResult> AddPriority(SPM_Priority priority)
        {
            _context.Priorities.Add(priority);
            await _context.SaveChangesAsync();

            return Ok(priority);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePriority(SPM_Priority priority, int id)
        {
            if (id != priority.PriorityID)
            {
                return BadRequest();
            }

            _context.Entry(priority).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePriority(int id)
        {
            var priority = await _context.Priorities.FindAsync(id);

            if (priority == null)
            {
                return NotFound();
            }

            _context.Priorities.Remove(priority);

            await _context.SaveChangesAsync();

            return Ok("Deleted");
        }
    }
}
