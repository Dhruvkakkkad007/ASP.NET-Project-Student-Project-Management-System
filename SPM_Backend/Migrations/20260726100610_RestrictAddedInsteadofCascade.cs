using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SPM_Backend.Migrations
{
    /// <inheritdoc />
    public partial class RestrictAddedInsteadofCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_ProjectMaster_ProjectID",
                table: "SPM_ProjectAllocation");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_User_FacultyID",
                table: "SPM_ProjectAllocation");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_User_StudentID",
                table: "SPM_ProjectAllocation");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_Task_SPM_ProjectAllocation_ProjectAllocationID",
                table: "SPM_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_Task_SPM_TaskPriority_TaskPriorityID",
                table: "SPM_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_Task_SPM_TaskStatus_TaskStatusID",
                table: "SPM_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_User_SPM_UserType_UserTypeID",
                table: "SPM_User");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_UserRole_SPM_Role_RoleID",
                table: "SPM_UserRole");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_UserRole_SPM_User_UserID",
                table: "SPM_UserRole");

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_ProjectMaster_ProjectID",
                table: "SPM_ProjectAllocation",
                column: "ProjectID",
                principalTable: "SPM_ProjectMaster",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_User_FacultyID",
                table: "SPM_ProjectAllocation",
                column: "FacultyID",
                principalTable: "SPM_User",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_User_StudentID",
                table: "SPM_ProjectAllocation",
                column: "StudentID",
                principalTable: "SPM_User",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_Task_SPM_ProjectAllocation_ProjectAllocationID",
                table: "SPM_Task",
                column: "ProjectAllocationID",
                principalTable: "SPM_ProjectAllocation",
                principalColumn: "ProjectAllocationID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_Task_SPM_TaskPriority_TaskPriorityID",
                table: "SPM_Task",
                column: "TaskPriorityID",
                principalTable: "SPM_TaskPriority",
                principalColumn: "TaskPriorityID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_Task_SPM_TaskStatus_TaskStatusID",
                table: "SPM_Task",
                column: "TaskStatusID",
                principalTable: "SPM_TaskStatus",
                principalColumn: "TaskStatusID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_User_SPM_UserType_UserTypeID",
                table: "SPM_User",
                column: "UserTypeID",
                principalTable: "SPM_UserType",
                principalColumn: "UserTypeID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_UserRole_SPM_Role_RoleID",
                table: "SPM_UserRole",
                column: "RoleID",
                principalTable: "SPM_Role",
                principalColumn: "RoleID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_UserRole_SPM_User_UserID",
                table: "SPM_UserRole",
                column: "UserID",
                principalTable: "SPM_User",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_ProjectMaster_ProjectID",
                table: "SPM_ProjectAllocation");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_User_FacultyID",
                table: "SPM_ProjectAllocation");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_User_StudentID",
                table: "SPM_ProjectAllocation");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_Task_SPM_ProjectAllocation_ProjectAllocationID",
                table: "SPM_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_Task_SPM_TaskPriority_TaskPriorityID",
                table: "SPM_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_Task_SPM_TaskStatus_TaskStatusID",
                table: "SPM_Task");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_User_SPM_UserType_UserTypeID",
                table: "SPM_User");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_UserRole_SPM_Role_RoleID",
                table: "SPM_UserRole");

            migrationBuilder.DropForeignKey(
                name: "FK_SPM_UserRole_SPM_User_UserID",
                table: "SPM_UserRole");

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_ProjectMaster_ProjectID",
                table: "SPM_ProjectAllocation",
                column: "ProjectID",
                principalTable: "SPM_ProjectMaster",
                principalColumn: "ProjectID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_User_FacultyID",
                table: "SPM_ProjectAllocation",
                column: "FacultyID",
                principalTable: "SPM_User",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_ProjectAllocation_SPM_User_StudentID",
                table: "SPM_ProjectAllocation",
                column: "StudentID",
                principalTable: "SPM_User",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_Task_SPM_ProjectAllocation_ProjectAllocationID",
                table: "SPM_Task",
                column: "ProjectAllocationID",
                principalTable: "SPM_ProjectAllocation",
                principalColumn: "ProjectAllocationID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_Task_SPM_TaskPriority_TaskPriorityID",
                table: "SPM_Task",
                column: "TaskPriorityID",
                principalTable: "SPM_TaskPriority",
                principalColumn: "TaskPriorityID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_Task_SPM_TaskStatus_TaskStatusID",
                table: "SPM_Task",
                column: "TaskStatusID",
                principalTable: "SPM_TaskStatus",
                principalColumn: "TaskStatusID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_User_SPM_UserType_UserTypeID",
                table: "SPM_User",
                column: "UserTypeID",
                principalTable: "SPM_UserType",
                principalColumn: "UserTypeID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_UserRole_SPM_Role_RoleID",
                table: "SPM_UserRole",
                column: "RoleID",
                principalTable: "SPM_Role",
                principalColumn: "RoleID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SPM_UserRole_SPM_User_UserID",
                table: "SPM_UserRole",
                column: "UserID",
                principalTable: "SPM_User",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
