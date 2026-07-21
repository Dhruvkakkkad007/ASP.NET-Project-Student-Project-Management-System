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
        public async Task<IActionResult> GetAllTaskPriority()
        {
            var taskPriorities = await _context.TaskPriorities.ToListAsync();

            return Ok(taskPriorities);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var taskPriority = await _context.TaskPriorities.FindAsync(id);

            if (taskPriority == null)
            {
                return NotFound();
            }

            return Ok(taskPriority);
        }

        [HttpPost]
        public async Task<IActionResult> AddTaskPriority(SPM_TaskPriority taskPriority)
        {
            _context.TaskPriorities.Add(taskPriority);

            await _context.SaveChangesAsync();

            return Ok(taskPriority);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTaskPriority(SPM_TaskPriority taskPriority, int id)
        {
            if (id != taskPriority.TaskPriorityID)
            {
                return BadRequest();
            }

            _context.Entry(taskPriority).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTaskPriority(int id)
        {
            var taskPriority = await _context.TaskPriorities.FindAsync(id);

            if (taskPriority == null)
            {
                return NotFound();
            }

            _context.TaskPriorities.Remove(taskPriority);

            await _context.SaveChangesAsync();

            return Ok("Deleted");
        }
    }
}
