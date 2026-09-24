using FluentValidation;
using SPMS.Dtos;

namespace SPMS.Validators
{
    public class TaskStatusCreateDtoValidator : AbstractValidator<TaskStatusCreateDto>
    {
        public TaskStatusCreateDtoValidator()
        {
            RuleFor(x => x.TaskStatusName)
                // Task Status Name is mandatory
                .NotEmpty()
                .WithMessage("Task Status Name is required.")

                // Task Status Name should not contain only whitespace characters
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Task Status Name cannot be empty or whitespace.")

                // Task Status Name maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("Task Status Name cannot exceed 50 characters.");

            RuleFor(x => x.TaskStatusCssClass)
                // Task Status CSS Class is mandatory
                .NotEmpty()
                .WithMessage("Task Status CSS Class is required.")

                // Task Status CSS Class should not contain only whitespace characters
                .Must(css => !string.IsNullOrWhiteSpace(css))
                .WithMessage("Task Status CSS Class cannot be empty or whitespace.")

                // Task Status CSS Class maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("Task Status CSS Class cannot exceed 50 characters.");
        }
    }

    public class TaskStatusUpdateDtoValidator : AbstractValidator<TaskStatusUpdateDto>
    {
        public TaskStatusUpdateDtoValidator()
        {
            RuleFor(x => x.TaskStatusName)
                // Task Status Name is mandatory
                .NotEmpty()
                .WithMessage("Task Status Name is required.")

                // Task Status Name should not contain only whitespace characters
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Task Status Name cannot be empty or whitespace.")

                // Task Status Name maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("Task Status Name cannot exceed 50 characters.");

            RuleFor(x => x.TaskStatusCssClass)
                // Task Status CSS Class is mandatory
                .NotEmpty()
                .WithMessage("Task Status CSS Class is required.")

                // Task Status CSS Class should not contain only whitespace characters
                .Must(css => !string.IsNullOrWhiteSpace(css))
                .WithMessage("Task Status CSS Class cannot be empty or whitespace.")

                // Task Status CSS Class maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("Task Status CSS Class cannot exceed 50 characters.");
        }
    }
}
