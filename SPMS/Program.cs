using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using Scalar.AspNetCore;
using SPMS.Common;
using SPMS.Data;
using SPMS.Services;
using TaskStatus = SPMS.TaskStatus;

namespace SPMS
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });

            // Register FluentValidation
            builder.Services.AddFluentValidationAutoValidation();
            builder.Services.AddFluentValidationClientsideAdapters();
            builder.Services.AddValidatorsFromAssemblyContaining<Program>();

            // Customize Model State validation response format
            builder.Services.Configure<ApiBehaviorOptions>(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState
                        .Where(e => e.Value?.Errors.Count > 0)
                        .SelectMany(e => e.Value!.Errors.Select(x => x.ErrorMessage))
                        .ToList();

                    var response = new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Validation Failed",
                        Data = null,
                        Errors = errors
                    };

                    return new BadRequestObjectResult(response);
                };
            });

            // Configure JWT Authentication
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    // Rules the app uses to check if a token is valid
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
                    )
                };
            });

            // Register TokenService
            builder.Services.AddScoped<TokenService>();

            // Configure OpenAPI
            builder.Services.AddOpenApi(options =>
            {
                options.AddDocumentTransformer((document, context, cancellationToken) =>
                {
                    document.Components ??= new();
                    document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
                    document.Components.SecuritySchemes.Add("Bearer", new OpenApiSecurityScheme
                    {
                        Type = SecuritySchemeType.Http,
                        Scheme = "bearer",
                        BearerFormat = "JWT",
                        In = ParameterLocation.Header,
                        Description = "Enter your JWT token here (no need to type 'Bearer' prefix)"
                    });
                    return Task.CompletedTask;
                });
            });

            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("connectionString"));
                options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            var app = builder.Build();

            // Automatically apply EF Core database migrations & seed core master data
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<AppDbContext>();
                    context.Database.Migrate();

                    // Ensure OverAllGrade column supports multi-character grades like A+, B+
                    try
                    {
                        context.Database.ExecuteSqlRaw("ALTER TABLE SPM_ProjectAllocation ALTER COLUMN OverAllGrade NVARCHAR(10) NULL;");
                    }
                    catch { }

                    try
                    {
                        AllocationSchemaFix.EnsureOptionalProjectId(context);
                    }
                    catch { }

                    try
                    {
                        AllocationSchemaFix.EnsureSwitchRequestTable(context);
                    }
                    catch { }

                    // Seed core UserTypes (Admin, Faculty, Student) if missing
                    var existingTypes = context.UserTypes.Select(u => u.UserTypeName.ToLower()).ToList();
                    if (!existingTypes.Contains("admin"))
                        context.UserTypes.Add(new UserType { UserTypeName = "Admin", Description = "System Administrator" });
                    if (!existingTypes.Contains("faculty"))
                        context.UserTypes.Add(new UserType { UserTypeName = "Faculty", Description = "Faculty Mentor / Project Guide" });
                    if (!existingTypes.Contains("student"))
                        context.UserTypes.Add(new UserType { UserTypeName = "Student", Description = "Student Undertaking Project" });

                    // Seed core Roles (Admin, Faculty, Student) if missing
                    var existingRoles = context.Roles.Select(r => r.RoleName.ToLower()).ToList();
                    if (!existingRoles.Contains("admin"))
                        context.Roles.Add(new Role { RoleName = "Admin", Description = "Administrator Privileges" });
                    if (!existingRoles.Contains("faculty"))
                        context.Roles.Add(new Role { RoleName = "Faculty", Description = "Faculty Supervisor Privileges" });
                    if (!existingRoles.Contains("student"))
                        context.Roles.Add(new Role { RoleName = "Student", Description = "Student Privileges" });

                    // Seed core Task Statuses
                    if (!context.TaskStatuses.Any())
                    {
                        context.TaskStatuses.AddRange(
                            new TaskStatus { TaskStatusName = "Pending", TaskStatusCssClass = "badge-warning" },
                            new TaskStatus { TaskStatusName = "In Progress", TaskStatusCssClass = "badge-primary" },
                            new TaskStatus { TaskStatusName = "Completed", TaskStatusCssClass = "badge-success" }
                        );
                    }

                    // Seed core Task Priorities
                    if (!context.TaskPriorities.Any())
                    {
                        context.TaskPriorities.AddRange(
                            new TaskPriority { TaskPriorityName = "Low", TaskPriorityCssClass = "badge-info" },
                            new TaskPriority { TaskPriorityName = "Medium", TaskPriorityCssClass = "badge-warning" },
                            new TaskPriority { TaskPriorityName = "High", TaskPriorityCssClass = "badge-danger" }
                        );
                    }

                    context.SaveChanges();
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogWarning(ex, "Database connection or migration warning during startup.");
                }
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference("/");
            }

            app.UseCors("AllowAll");

            app.UseStaticFiles();

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
