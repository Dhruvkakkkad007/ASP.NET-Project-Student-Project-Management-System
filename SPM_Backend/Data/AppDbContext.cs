using Microsoft.EntityFrameworkCore;
using SPM_Backend.Models;

namespace SPM_Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        public DbSet<SPM_User> Users => Set<SPM_User>();
    }
}