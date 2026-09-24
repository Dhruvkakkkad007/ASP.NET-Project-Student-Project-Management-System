using FluentValidation;
using SPMS.Dtos;

namespace SPMS.Validators
{
    public class ProjectTaskCreateDtoValidator : AbstractValidator<ProjectTaskCreateDto>
    {
        public ProjectTaskCreateDtoValidator()
        {
            RuleFor(x => x.ProjectAllocationId)
                // Project Allocation ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Project Allocation ID is required.");

            RuleFor(x => x.TaskTitle)
                // Task Title is mandatory
                .NotEmpty()
                .WithMessage("Task Title is required.")

                // Task Title should not contain only whitespace characters
                .Must(title => !string.IsNullOrWhiteSpace(title))
                .WithMessage("Task Title cannot be empty or whitespace.")

                // Task Title maximum length is 200 characters
                .MaximumLength(200)
                .WithMessage("Task Title cannot exceed 200 characters.");

            RuleFor(x => x.TaskStatusId)
                // Task Status ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Task Status ID is required.");

            RuleFor(x => x.TaskPriorityId)
                // Task Priority ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Task Priority ID is required.");

            RuleFor(x => x.AssignedScore)
                // Assigned Score cannot be negative
                .GreaterThanOrEqualTo(0)
                .WithMessage("Assigned Score cannot be negative.");

            RuleFor(x => x.EarnedScore)
                // Earned Score cannot be negative
                .GreaterThanOrEqualTo(0)
                .WithMessage("Earned Score cannot be negative.")

                // Earned Score cannot exceed Assigned Score
                .LessThanOrEqualTo(x => x.AssignedScore)
                .WithMessage("Earned Score cannot exceed Assigned Score.")
                .When(x => x.EarnedScore.HasValue);

            RuleFor(x => x.ProgressPercentage)
                // Progress Percentage must be between 0 and 100
                .InclusiveBetween(0, 100)
                .WithMessage("Progress Percentage must be between 0 and 100.");

            RuleFor(x => x.TaskAssignedDate)
                // Task Assigned Date is mandatory
                .NotEmpty()
                .WithMessage("Task Assigned Date is required.");

            RuleFor(x => x.TaskDueDate)
                // Task Due Date must be after or on Task Start Date
                .GreaterThanOrEqualTo(x => x.TaskStartDate!.Value)
                .WithMessage("Task Due Date must be after or on the Task Start Date.")
                .When(x => x.TaskStartDate.HasValue && x.TaskDueDate.HasValue);

            RuleFor(x => x.TaskCompletedDate)
                // Task Completed Date must be after or on Task Start Date
                .GreaterThanOrEqualTo(x => x.TaskStartDate!.Value)
                .WithMessage("Task Completed Date must be after or on the Task Start Date.")
                .When(x => x.TaskStartDate.HasValue && x.TaskCompletedDate.HasValue);

            RuleFor(x => x.TaskDescription)
                // Task Description maximum length is 1500 characters when provided
                .MaximumLength(1500)
                .WithMessage("Task Description cannot exceed 1500 characters.")
                .When(x => !string.IsNullOrEmpty(x.TaskDescription));

            RuleFor(x => x.FacultyRemarks)
                // Faculty Remarks maximum length is 500 characters when provided
                .MaximumLength(500)
                .WithMessage("Faculty Remarks cannot exceed 500 characters.")
                .When(x => !string.IsNullOrEmpty(x.FacultyRemarks));

            RuleFor(x => x.StudentRemarks)
                // Student Remarks maximum length is 500 characters when provided
                .MaximumLength(500)
                .WithMessage("Student Remarks cannot exceed 500 characters.")
                .When(x => !string.IsNullOrEmpty(x.StudentRemarks));
        }
    }

    public class ProjectTaskUpdateDtoValidator : AbstractValidator<ProjectTaskUpdateDto>
    {
        public ProjectTaskUpdateDtoValidator()
        {
            RuleFor(x => x.ProjectAllocationId)
                // Project Allocation ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Project Allocation ID is required.");

            RuleFor(x => x.TaskTitle)
                // Task Title is mandatory
                .NotEmpty()
                .WithMessage("Task Title is required.")

                // Task Title should not contain only whitespace characters
                .Must(title => !string.IsNullOrWhiteSpace(title))
                .WithMessage("Task Title cannot be empty or whitespace.")

                // Task Title maximum length is 200 characters
                .MaximumLength(200)
                .WithMessage("Task Title cannot exceed 200 characters.");

            RuleFor(x => x.TaskStatusId)
                // Task Status ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Task Status ID is required.");

            RuleFor(x => x.TaskPriorityId)
                // Task Priority ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Task Priority ID is required.");

            RuleFor(x => x.AssignedScore)
                // Assigned Score cannot be negative
                .GreaterThanOrEqualTo(0)
                .WithMessage("Assigned Score cannot be negative.");

            RuleFor(x => x.EarnedScore)
                // Earned Score cannot be negative
                .GreaterThanOrEqualTo(0)
                .WithMessage("Earned Score cannot be negative.")

                // Earned Score cannot exceed Assigned Score
                .LessThanOrEqualTo(x => x.AssignedScore)
                .WithMessage("Earned Score cannot exceed Assigned Score.")
                .When(x => x.EarnedScore.HasValue);

            RuleFor(x => x.ProgressPercentage)
                // Progress Percentage must be between 0 and 100
                .InclusiveBetween(0, 100)
                .WithMessage("Progress Percentage must be between 0 and 100.");

            RuleFor(x => x.TaskAssignedDate)
                // Task Assigned Date is mandatory
                .NotEmpty()
                .WithMessage("Task Assigned Date is required.");

            RuleFor(x => x.TaskDueDate)
                // Task Due Date must be after or on Task Start Date
                .GreaterThanOrEqualTo(x => x.TaskStartDate!.Value)
                .WithMessage("Task Due Date must be after or on the Task Start Date.")
                .When(x => x.TaskStartDate.HasValue && x.TaskDueDate.HasValue);

            RuleFor(x => x.TaskCompletedDate)
                // Task Completed Date must be after or on Task Start Date
                .GreaterThanOrEqualTo(x => x.TaskStartDate!.Value)
                .WithMessage("Task Completed Date must be after or on the Task Start Date.")
                .When(x => x.TaskStartDate.HasValue && x.TaskCompletedDate.HasValue);

            RuleFor(x => x.TaskDescription)
                // Task Description maximum length is 1500 characters when provided
                .MaximumLength(1500)
                .WithMessage("Task Description cannot exceed 1500 characters.")
                .When(x => !string.IsNullOrEmpty(x.TaskDescription));

            RuleFor(x => x.FacultyRemarks)
                // Faculty Remarks maximum length is 500 characters when provided
                .MaximumLength(500)
                .WithMessage("Faculty Remarks cannot exceed 500 characters.")
                .When(x => !string.IsNullOrEmpty(x.FacultyRemarks));

            RuleFor(x => x.StudentRemarks)
                // Student Remarks maximum length is 500 characters when provided
                .MaximumLength(500)
                .WithMessage("Student Remarks cannot exceed 500 characters.")
                .When(x => !string.IsNullOrEmpty(x.StudentRemarks));
        }
    }
}
