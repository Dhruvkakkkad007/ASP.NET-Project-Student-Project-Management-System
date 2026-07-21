using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SPM_Backend.Data;
using SPM_Backend.Models;

namespace SPM_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProject()
        {
            var projects = await _context.Projects.ToListAsync();

            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            return Ok(project);
        }

        [HttpPost]
        public async Task<IActionResult> AddProject(SPM_ProjectMaster project)
        {
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return Ok(project);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(SPM_ProjectMaster project, int id)
        {
            if (id != project.ProjectID)
            {
                return BadRequest();
            }

            _context.Entry(project).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            _context.Projects.Remove(project);

            await _context.SaveChangesAsync();

            return Ok("Deleted");
        }
    }
}
