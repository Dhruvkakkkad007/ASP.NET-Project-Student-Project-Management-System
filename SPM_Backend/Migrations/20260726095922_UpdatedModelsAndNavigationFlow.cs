using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SPM_Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedModelsAndNavigationFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserRoles",
                table: "UserRoles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tasks",
                table: "Tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskPriorities",
                table: "TaskPriorities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Statuses",
                table: "Statuses");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Roles",
                table: "Roles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Projects",
                table: "Projects");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProjectAllocations",
                table: "ProjectAllocations");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "SPM_User");

            migrationBuilder.RenameTable(
                name: "UserRoles",
                newName: "SPM_UserRole");

            migrationBuilder.RenameTable(
                name: "Tasks",
                newName: "SPM_Task");

            migrationBuilder.RenameTable(
                name: "TaskPriorities",
                newName: "SPM_TaskPriority");

            migrationBuilder.RenameTable(
                name: "Statuses",
                newName: "SPM_TaskStatus");

            migrationBuilder.RenameTable(
                name: "Roles",
                newName: "SPM_Role");

            migrationBuilder.RenameTable(
                name: "Projects",
                newName: "SPM_ProjectMaster");

            migrationBuilder.RenameTable(
                name: "ProjectAllocations",
                newName: "SPM_ProjectAllocation");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "SPM_UserRole",
                newName: "UserID");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                table: "SPM_UserRole",
                newName: "RoleID");

            migrationBuilder.RenameColumn(
                name: "RolePermissionId",
                table: "SPM_UserRole",
                newName: "RolePermissionID");

            migrationBuilder.RenameColumn(
                name: "TaskPriorityCssClass",
                table: "SPM_TaskPriority",
                newName: "TaskPriortyCssClass");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                table: "SPM_Role",
                newName: "RoleID");

            migrationBuilder.AlterColumn<string>(
                name: "UserCode",
                table: "SPM_User",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ProfilePicturePath",
                table: "SPM_User",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Password",
                table: "SPM_User",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MobileNumber",
                table: "SPM_User",
                type: "nvarchar(15)",
                maxLength: 15,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                table: "SPM_User",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "SPM_User",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "SPM_User",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TaskTitle",
                table: "SPM_Task",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "TaskStartDate",
                table: "SPM_Task",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "TaskDueDate",
                table: "SPM_Task",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "TaskDescription",
                table: "SPM_Task",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "TaskCompletedDate",
                table: "SPM_Task",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "StudentRemarks",
                table: "SPM_Task",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<decimal>(
                name: "ProgressPercentage",
                table: "SPM_Task",
                type: "decimal(5,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "NextFollowUpDate",
                table: "SPM_Task",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "FacultyRemarks",
                table: "SPM_Task",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<decimal>(
                name: "EarnedScore",
                table: "SPM_Task",
                type: "decimal(5,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "AssignedScore",
                table: "SPM_Task",
                type: "decimal(5,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<string>(
                name: "TaskPriorityName",
                table: "SPM_TaskPriority",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TaskPriortyCssClass",
                table: "SPM_TaskPriority",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TaskStatusName",
                table: "SPM_TaskStatus",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TaskStatusCssClass",
                table: "SPM_TaskStatus",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RoleName",
                table: "SPM_Role",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "SPM_Role",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ProjectTitle",
                table: "SPM_ProjectMaster",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "SPM_ProjectMaster",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<decimal>(
                name: "ProgressPercentage",
                table: "SPM_ProjectAllocation",
                type: "decimal(5,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<string>(
                name: "OverAllGrade",
                table: "SPM_ProjectAllocation",
                type: "nvarchar(1)",
                maxLength: 1,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SPM_User",
                table: "SPM_User",
                column: "UserID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SPM_UserRole",
                table: "SPM_UserRole",
                column: "RolePermissionID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SPM_Task",
                table: "SPM_Task",
                column: "TaskID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SPM_TaskPriority",
                table: "SPM_TaskPriority",
                column: "TaskPriorityID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SPM_TaskStatus",
                table: "SPM_TaskStatus",
                column: "TaskStatusID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SPM_Role",
                table: "SPM_Role",
                column: "RoleID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SPM_ProjectMaster",
                table: "SPM_ProjectMaster",
                column: "ProjectID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SPM_ProjectAllocation",
                table: "SPM_ProjectAllocation",
                column: "ProjectAllocationID");

            migrationBuilder.CreateTable(
                name: "SPM_UserType",
                columns: table => new
                {
                    UserTypeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserTypeName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SPM_UserType", x => x.UserTypeID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SPM_User_UserTypeID",
                table: "SPM_User",
                column: "UserTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_UserRole_RoleID",
                table: "SPM_UserRole",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_UserRole_UserID",
                table: "SPM_UserRole",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_Task_ProjectAllocationID",
                table: "SPM_Task",
                column: "ProjectAllocationID");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_Task_TaskPriorityID",
                table: "SPM_Task",
                column: "TaskPriorityID");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_Task_TaskStatusID",
                table: "SPM_Task",
                column: "TaskStatusID");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_ProjectAllocation_FacultyID",
                table: "SPM_ProjectAllocation",
                column: "FacultyID");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_ProjectAllocation_ProjectID",
                table: "SPM_ProjectAllocation",
                column: "ProjectID");

            migrationBuilder.CreateIndex(
                name: "IX_SPM_ProjectAllocation_StudentID",
                table: "SPM_ProjectAllocation",
                column: "StudentID");

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

            migrationBuilder.DropTable(
                name: "SPM_UserType");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SPM_UserRole",
                table: "SPM_UserRole");

            migrationBuilder.DropIndex(
                name: "IX_SPM_UserRole_RoleID",
                table: "SPM_UserRole");

            migrationBuilder.DropIndex(
                name: "IX_SPM_UserRole_UserID",
                table: "SPM_UserRole");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SPM_User",
                table: "SPM_User");

            migrationBuilder.DropIndex(
                name: "IX_SPM_User_UserTypeID",
                table: "SPM_User");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SPM_TaskStatus",
                table: "SPM_TaskStatus");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SPM_TaskPriority",
                table: "SPM_TaskPriority");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SPM_Task",
                table: "SPM_Task");

            migrationBuilder.DropIndex(
                name: "IX_SPM_Task_ProjectAllocationID",
                table: "SPM_Task");

            migrationBuilder.DropIndex(
                name: "IX_SPM_Task_TaskPriorityID",
                table: "SPM_Task");

            migrationBuilder.DropIndex(
                name: "IX_SPM_Task_TaskStatusID",
                table: "SPM_Task");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SPM_Role",
                table: "SPM_Role");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SPM_ProjectMaster",
                table: "SPM_ProjectMaster");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SPM_ProjectAllocation",
                table: "SPM_ProjectAllocation");

            migrationBuilder.DropIndex(
                name: "IX_SPM_ProjectAllocation_FacultyID",
                table: "SPM_ProjectAllocation");

            migrationBuilder.DropIndex(
                name: "IX_SPM_ProjectAllocation_ProjectID",
                table: "SPM_ProjectAllocation");

            migrationBuilder.DropIndex(
                name: "IX_SPM_ProjectAllocation_StudentID",
                table: "SPM_ProjectAllocation");

            migrationBuilder.RenameTable(
                name: "SPM_UserRole",
                newName: "UserRoles");

            migrationBuilder.RenameTable(
                name: "SPM_User",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "SPM_TaskStatus",
                newName: "Statuses");

            migrationBuilder.RenameTable(
                name: "SPM_TaskPriority",
                newName: "TaskPriorities");

            migrationBuilder.RenameTable(
                name: "SPM_Task",
                newName: "Tasks");

            migrationBuilder.RenameTable(
                name: "SPM_Role",
                newName: "Roles");

            migrationBuilder.RenameTable(
                name: "SPM_ProjectMaster",
                newName: "Projects");

            migrationBuilder.RenameTable(
                name: "SPM_ProjectAllocation",
                newName: "ProjectAllocations");

            migrationBuilder.RenameColumn(
                name: "UserID",
                table: "UserRoles",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "RoleID",
                table: "UserRoles",
                newName: "RoleId");

            migrationBuilder.RenameColumn(
                name: "RolePermissionID",
                table: "UserRoles",
                newName: "RolePermissionId");

            migrationBuilder.RenameColumn(
                name: "TaskPriortyCssClass",
                table: "TaskPriorities",
                newName: "TaskPriorityCssClass");

            migrationBuilder.RenameColumn(
                name: "RoleID",
                table: "Roles",
                newName: "RoleId");

            migrationBuilder.AlterColumn<string>(
                name: "UserCode",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ProfilePicturePath",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Password",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "MobileNumber",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(15)",
                oldMaxLength: 15);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "TaskStatusName",
                table: "Statuses",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "TaskStatusCssClass",
                table: "Statuses",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "TaskPriorityName",
                table: "TaskPriorities",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "TaskPriorityCssClass",
                table: "TaskPriorities",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "TaskTitle",
                table: "Tasks",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<DateTime>(
                name: "TaskStartDate",
                table: "Tasks",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "TaskDueDate",
                table: "Tasks",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TaskDescription",
                table: "Tasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "TaskCompletedDate",
                table: "Tasks",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "StudentRemarks",
                table: "Tasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ProgressPercentage",
                table: "Tasks",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "NextFollowUpDate",
                table: "Tasks",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FacultyRemarks",
                table: "Tasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "EarnedScore",
                table: "Tasks",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "AssignedScore",
                table: "Tasks",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)");

            migrationBuilder.AlterColumn<string>(
                name: "RoleName",
                table: "Roles",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Roles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ProjectTitle",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ProgressPercentage",
                table: "ProjectAllocations",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)");

            migrationBuilder.AlterColumn<string>(
                name: "OverAllGrade",
                table: "ProjectAllocations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(1)",
                oldMaxLength: 1,
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserRoles",
                table: "UserRoles",
                column: "RolePermissionId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "UserID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Statuses",
                table: "Statuses",
                column: "TaskStatusID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskPriorities",
                table: "TaskPriorities",
                column: "TaskPriorityID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tasks",
                table: "Tasks",
                column: "TaskID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Roles",
                table: "Roles",
                column: "RoleId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Projects",
                table: "Projects",
                column: "ProjectID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProjectAllocations",
                table: "ProjectAllocations",
                column: "ProjectAllocationID");
        }
    }
}
