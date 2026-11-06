using Microsoft.EntityFrameworkCore;
using SPMS.Data;

namespace SPMS.Services
{
    public static class AllocationSchemaFix
    {
        /// <summary>
        /// Makes ProjectId nullable so admin can allocate a student + faculty
        /// before the student chooses a project topic.
        /// </summary>
        public static void EnsureOptionalProjectId(AppDbContext context)
        {
            context.Database.ExecuteSqlRaw(@"
DECLARE @drop nvarchar(max) = N'';
SELECT @drop = @drop + N'ALTER TABLE [SPM_ProjectAllocation] DROP CONSTRAINT [' + fk.name + N'];'
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
INNER JOIN sys.columns c ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
INNER JOIN sys.tables t ON t.object_id = fk.parent_object_id
WHERE t.name = N'SPM_ProjectAllocation' AND c.name = N'ProjectId';

IF (@drop <> N'')
    EXEC sp_executesql @drop;

IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'SPM_ProjectAllocation')
      AND name = N'ProjectId'
      AND is_nullable = 0
)
    ALTER TABLE [SPM_ProjectAllocation] ALTER COLUMN [ProjectId] BIGINT NULL;

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_SPM_ProjectAllocation_SPM_ProjectMaster_ProjectId'
)
    ALTER TABLE [SPM_ProjectAllocation] WITH NOCHECK
    ADD CONSTRAINT [FK_SPM_ProjectAllocation_SPM_ProjectMaster_ProjectId]
        FOREIGN KEY ([ProjectId]) REFERENCES [SPM_ProjectMaster]([ProjectId]) ON DELETE SET NULL;
");
        }

        public static void EnsureSwitchRequestTable(AppDbContext context)
        {
            context.Database.ExecuteSqlRaw(@"
IF OBJECT_ID(N'SPM_ProjectSwitchRequest', N'U') IS NULL
BEGIN
    CREATE TABLE [SPM_ProjectSwitchRequest] (
        [ProjectSwitchRequestId] BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [ProjectAllocationId] BIGINT NOT NULL,
        [StudentId] BIGINT NOT NULL,
        [FacultyId] BIGINT NOT NULL,
        [CurrentProjectId] BIGINT NULL,
        [RequestedProjectId] BIGINT NOT NULL,
        [Reason] NVARCHAR(500) NULL,
        [Status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_SwitchRequest_Status] DEFAULT ('Pending'),
        [FacultyRemarks] NVARCHAR(500) NULL,
        [RequestedAt] DATETIME2(0) NOT NULL,
        [ReviewedAt] DATETIME2(0) NULL,
        CONSTRAINT [FK_SwitchRequest_Allocation] FOREIGN KEY ([ProjectAllocationId])
            REFERENCES [SPM_ProjectAllocation]([ProjectAllocationId]) ON DELETE CASCADE,
        CONSTRAINT [FK_SwitchRequest_Student] FOREIGN KEY ([StudentId])
            REFERENCES [SPM_User]([UserId]),
        CONSTRAINT [FK_SwitchRequest_Faculty] FOREIGN KEY ([FacultyId])
            REFERENCES [SPM_User]([UserId]),
        CONSTRAINT [FK_SwitchRequest_RequestedProject] FOREIGN KEY ([RequestedProjectId])
            REFERENCES [SPM_ProjectMaster]([ProjectId])
    );
END
");
        }
    }
}