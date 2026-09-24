using Microsoft.EntityFrameworkCore;
using SPMS;

namespace SPMS.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Role> Roles { get; set; } = null!;

        public DbSet<UserType> UserTypes { get; set; } = null!;

        public DbSet<User> Users { get; set; } = null!;

        public DbSet<UserRole> UserRoles { get; set; } = null!;

        public DbSet<TaskStatus> TaskStatuses { get; set; } = null!;

        public DbSet<TaskPriority> TaskPriorities { get; set; } = null!;

        public DbSet<ProjectMaster> ProjectMasters { get; set; } = null!;

        public DbSet<ProjectAllocation> ProjectAllocations { get; set; } = null!;

        public DbSet<ProjectTask> Tasks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("SPM_User");

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);

                entity.HasOne(e => e.UserType)
                    .WithMany(e => e.Users)
                    .HasForeignKey(e => e.UserTypeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.UserRoles)
                    .WithOne(e => e.User)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("SPM_Role");

                entity.HasMany(e => e.UserRoles)
                    .WithOne(e => e.Role)
                    .HasForeignKey(e => e.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserType>(entity =>
            {
                entity.ToTable("SPM_UserType");

                entity.HasMany(e => e.Users)
                    .WithOne(e => e.UserType)
                    .HasForeignKey(e => e.UserTypeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.ToTable("SPM_UserRole");

                entity.HasOne(e => e.Role)
                    .WithMany(e => e.UserRoles)
                    .HasForeignKey(e => e.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany(e => e.UserRoles)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TaskStatus>(entity =>
            {
                entity.ToTable("SPM_TaskStatus");

                entity.HasMany(e => e.Tasks)
                    .WithOne(e => e.TaskStatus)
                    .HasForeignKey(e => e.TaskStatusId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TaskPriority>(entity =>
            {
                entity.ToTable("SPM_TaskPriority");

                entity.HasMany(e => e.Tasks)
                    .WithOne(e => e.TaskPriority)
                    .HasForeignKey(e => e.TaskPriorityId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ProjectMaster>(entity =>
            {
                entity.ToTable("SPM_ProjectMaster");

                entity.HasMany(e => e.ProjectAllocations)
                    .WithOne(e => e.Project)
                    .HasForeignKey(e => e.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProjectAllocation>(entity =>
            {
                entity.ToTable("SPM_ProjectAllocation");

                entity.Property(e => e.AssignedDate)
                    .HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.Project)
                    .WithMany(e => e.ProjectAllocations)
                    .HasForeignKey(e => e.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Student)
                    .WithMany(e => e.StudentProjectAllocations)
                    .HasForeignKey(e => e.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Faculty)
                    .WithMany(e => e.FacultyProjectAllocations)
                    .HasForeignKey(e => e.FacultyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.Tasks)
                    .WithOne(e => e.ProjectAllocation)
                    .HasForeignKey(e => e.ProjectAllocationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProjectTask>(entity =>
            {
                entity.ToTable("SPM_Task");

                entity.HasOne(e => e.ProjectAllocation)
                    .WithMany(e => e.Tasks)
                    .HasForeignKey(e => e.ProjectAllocationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.TaskStatus)
                    .WithMany(e => e.Tasks)
                    .HasForeignKey(e => e.TaskStatusId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.TaskPriority)
                    .WithMany(e => e.Tasks)
                    .HasForeignKey(e => e.TaskPriorityId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
