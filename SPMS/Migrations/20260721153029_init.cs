using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SPMS.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SPM_ProjectMaster",
                columns: table => new
                {
                    ProjectId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SPM_ProjectMaster", x => x.ProjectId);
                });

            migrationBuilder.CreateTable(
                name: "SPM_Role",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SPM_Role", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "SPM_TaskPriority",
                columns: table => new
                {
                    TaskPriorityId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskPriorityName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TaskPriorityCssClass = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SPM_TaskPriority", x => x.TaskPriorityId);
                });

            migrationBuilder.CreateTable(
                name: "SPM_TaskStatus",
                columns: table => new
                {
                    TaskStatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskStatusName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TaskStatusCssClass = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SPM_TaskStatus", x => x.TaskStatusId);
                });

            migrationBuilder.CreateTable(
                name: "SPM_UserType",
                columns: table => new
                {
                    UserTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserTypeName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SPM_UserType", x => x.UserTypeId);
                });

            migrationBuilder.CreateTable(
                name: "SPM_User",
                columns: table => new
                {
                    UserId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserTypeId = table.Column<int>(type: "int", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    UserCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    MobileNumber = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    ProfilePicturePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SPM_User", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_SPM_User_SPM_UserType_UserTypeId",
                        column: x => x.UserTypeId,
                        principalTable: "SPM_UserType",
                        principalColumn: "UserTypeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SPM_ProjectAllocation",
                columns: table => new
                {
                    ProjectAllocationId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<long>(type: "bigint", nullable: false),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    FacultyId = table.Column<long>(type: "bigint", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "datetime2(0)", precision: 0, nullable: false, defaultValueSql: "GETDATE()"),
                    ProjectStartDate = table.Column<DateTime>(type: "datetime2(0)", precision: 0, nullable: false),
                    ProjectEndDate = table.Column<DateTime>(type: "datetime2(0)", precision: 0, nullable: false),
                    TotalTasksGiven = table.Column<int>(type: "int", nullable: false),
                    TotalCompletedTasks = table.Column<int>(type: "int", nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    OverAllGrade = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SPM_ProjectAllocation", x => x.ProjectAllocationId);
                    table.ForeignKey(
                        name: "FK_SPM_ProjectAllocation_SPM_ProjectMaster_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "SPM_ProjectMaster",
                        principalColumn: "ProjectId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SPM_ProjectAllocation_SPM_User_FacultyId",
                        column: x => x.FacultyId,
                        principalTable: "SPM_User",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SPM_ProjectAllocation_SPM_User_StudentId",
                        column: x => x.StudentId,
                        principalTable: "SPM_User",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SPM_UserRole",
                columns: table => new
                {
                    UserRoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SPM_UserRole", x => x.UserRoleId);
                    table.ForeignKey(
                        name: "FK_SPM_UserRole_SPM_Role_RoleId",
                        column: x => x.RoleId,
                        principalTable: "SPM_Role",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SPM_UserRole_SPM_User_UserId",
                        column: x => x.UserId,
                        principalTable: "SPM_User",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SPM_Task",
                columns: table => new
                {
                    TaskId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectAllocationId = table.Column<long>(type: "bigint", nullable: false),
                    TaskTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TaskDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskStatusId = table.Column<int>(type: "int", nullable: false),
                    TaskPriorityId = table.Column<int>(type: "int", nullable: false),
                    AssignedScore = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    EarnedScore = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    TaskAssignedDate = table.Column<DateTime>(type: "datetime2(0)", precision: 0, nullable: false),
                    TaskStartDate = table.Column<DateTime>(type: "datetime2(0)", precision: 0, nullable: true),
                    TaskDueDate = table.Column<DateTime>(type: "datetime2(0)", precision: 0, nullable: true),
                    TaskCompletedDate = table.Column<DateTime>(type: "datetime2(0)", precision: 0, nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "datetime2(0)", precision: 0, nullable: true),
                    FacultyRemarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StudentRemarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SPM_Task", x => x.TaskId);
                    table.ForeignKey(
                        name: "FK_SPM_Task_SPM_ProjectAllocation_ProjectAllocationId",
                        column: x => x.ProjectAllocationId,
                        principalTable: "SPM_ProjectAllocation",
                        principalColumn: "ProjectAllocationId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SPM_Task_SPM_TaskPriority_TaskPriorityId",
                        column: x => x.TaskPriorityId,
                        principalTable: "SPM_TaskPriority",
                        principalColumn: "TaskPriorityId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SPM_Task_SPM_TaskStatus_TaskStatusId",
                        column: x => x.TaskStatusId,
                        principalTable: "SPM_TaskStatus",
                        principalColumn: "TaskStatusId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SPM_ProjectAllocation_FacultyId",
                table: "SPM_ProjectAllocation",
                column: "FacultyId");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_ProjectAllocation_ProjectId",
                table: "SPM_ProjectAllocation",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_ProjectAllocation_StudentId",
                table: "SPM_ProjectAllocation",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_Task_ProjectAllocationId",
                table: "SPM_Task",
                column: "ProjectAllocationId");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_Task_TaskPriorityId",
                table: "SPM_Task",
                column: "TaskPriorityId");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_Task_TaskStatusId",
                table: "SPM_Task",
                column: "TaskStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_User_Email",
                table: "SPM_User",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SPM_User_UserTypeId",
                table: "SPM_User",
                column: "UserTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_UserRole_RoleId_UserId",
                table: "SPM_UserRole",
                columns: new[] { "RoleId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SPM_UserRole_UserId",
                table: "SPM_UserRole",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SPM_Task");

            migrationBuilder.DropTable(
                name: "SPM_UserRole");

            migrationBuilder.DropTable(
                name: "SPM_ProjectAllocation");

            migrationBuilder.DropTable(
                name: "SPM_TaskPriority");

            migrationBuilder.DropTable(
                name: "SPM_TaskStatus");

            migrationBuilder.DropTable(
                name: "SPM_Role");

            migrationBuilder.DropTable(
                name: "SPM_ProjectMaster");

            migrationBuilder.DropTable(
                name: "SPM_User");

            migrationBuilder.DropTable(
                name: "SPM_UserType");
        }
    }
}
