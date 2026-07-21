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

        public DbSet<SPM_Role> Roles => Set<SPM_Role>();

        public DbSet<SPM_TaskStatus> Statuses => Set<SPM_TaskStatus>();

        public DbSet<SPM_TaskPriority> TaskPriorities => Set<SPM_TaskPriority>();

        public DbSet<SPM_ProjectMaster> Projects => Set<SPM_ProjectMaster>();

        public DbSet<SPM_Task> Tasks => Set<SPM_Task>();

        public DbSet<SPM_UserRole> UserRoles => Set<SPM_UserRole>();

        public DbSet<SPM_ProjectAllocation> ProjectAllocations => Set<SPM_ProjectAllocation>();


    //    protected override void OnModelCreating(ModelBuilder modelBuilder)
    //    {
    //        base.OnModelCreating(modelBuilder);


    //        modelBuilder.Entity<SPM_User>(entity =>
    //        {
    //            entity.HasKey(e => e.UserId);


    //            entity.Property(e => e.FullName)
    //            .IsRequired()
    //            .HasMaxLength(150);


    //            entity.Property(e => e.Email)
    //            .IsRequired()
    //            .HasMaxLength(150);

    //            entity.Property(e => e.Password)
    //            .IsRequired();

    //            entity.Property(e => e.MobileNumber)
    //            .IsRequired()
    //            .HasMaxLength(150);

    //            entity.Property(e => e.ProfilePicturePath)
    //            .IsRequired()
    //            .HasMaxLength(150);


    //            entity.Property(e => e.IsActive)
    //            .HasDefaultValue(true);

    //            entity.Property(e => e.IsDeleted)
    //            .HasDefaultValue(false);
    //        }
    //      );
    //    }
    }
}