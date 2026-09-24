using FluentValidation;
using SPMS.Dtos;

namespace SPMS.Validators
{
    public class TaskPriorityCreateDtoValidator : AbstractValidator<TaskPriorityCreateDto>
    {
        public TaskPriorityCreateDtoValidator()
        {
            RuleFor(x => x.TaskPriorityName)
                // Task Priority Name is mandatory
                .NotEmpty()
                .WithMessage("Task Priority Name is required.")

                // Task Priority Name should not contain only whitespace characters
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Task Priority Name cannot be empty or whitespace.")

                // Task Priority Name maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("Task Priority Name cannot exceed 50 characters.");

            RuleFor(x => x.TaskPriorityCssClass)
                // Task Priority CSS Class is mandatory
                .NotEmpty()
                .WithMessage("Task Priority CSS Class is required.")

                // Task Priority CSS Class should not contain only whitespace characters
                .Must(css => !string.IsNullOrWhiteSpace(css))
                .WithMessage("Task Priority CSS Class cannot be empty or whitespace.")

                // Task Priority CSS Class maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("Task Priority CSS Class cannot exceed 50 characters.");
        }
    }

    public class TaskPriorityUpdateDtoValidator : AbstractValidator<TaskPriorityUpdateDto>
    {
        public TaskPriorityUpdateDtoValidator()
        {
            RuleFor(x => x.TaskPriorityName)
                // Task Priority Name is mandatory
                .NotEmpty()
                .WithMessage("Task Priority Name is required.")

                // Task Priority Name should not contain only whitespace characters
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Task Priority Name cannot be empty or whitespace.")

                // Task Priority Name maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("Task Priority Name cannot exceed 50 characters.");

            RuleFor(x => x.TaskPriorityCssClass)
                // Task Priority CSS Class is mandatory
                .NotEmpty()
                .WithMessage("Task Priority CSS Class is required.")

                // Task Priority CSS Class should not contain only whitespace characters
                .Must(css => !string.IsNullOrWhiteSpace(css))
                .WithMessage("Task Priority CSS Class cannot be empty or whitespace.")

                // Task Priority CSS Class maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("Task Priority CSS Class cannot exceed 50 characters.");
        }
    }
}
