using FluentValidation;
using SPMS.Dtos;

namespace SPMS.Validators
{
    public class ProjectCreateDtoValidator : AbstractValidator<ProjectCreateDto>
    {
        public ProjectCreateDtoValidator()
        {
            RuleFor(x => x.ProjectTitle)
                // Project Title is mandatory
                .NotEmpty()
                .WithMessage("Project Title is required.")

                // Project Title should not contain only whitespace characters
                .Must(title => !string.IsNullOrWhiteSpace(title))
                .WithMessage("Project Title cannot be empty or whitespace.")

                // Project Title minimum length must be 3 characters
                .MinimumLength(3)
                .WithMessage("Project Title must be at least 3 characters long.")

                // Project Title maximum length must not exceed 150 characters
                .MaximumLength(150)
                .WithMessage("Project Title cannot exceed 150 characters.");

            RuleFor(x => x.Description)
                // Description maximum length is 1000 characters when provided
                .MaximumLength(1000)
                .WithMessage("Description cannot exceed 1000 characters.")
                .When(x => !string.IsNullOrEmpty(x.Description));
        }
    }

    public class ProjectUpdateDtoValidator : AbstractValidator<ProjectUpdateDto>
    {
        public ProjectUpdateDtoValidator()
        {
            RuleFor(x => x.ProjectTitle)
                // Project Title is mandatory
                .NotEmpty()
                .WithMessage("Project Title is required.")

                // Project Title should not contain only whitespace characters
                .Must(title => !string.IsNullOrWhiteSpace(title))
                .WithMessage("Project Title cannot be empty or whitespace.")

                // Project Title minimum length must be 3 characters
                .MinimumLength(3)
                .WithMessage("Project Title must be at least 3 characters long.")

                // Project Title maximum length must not exceed 150 characters
                .MaximumLength(150)
                .WithMessage("Project Title cannot exceed 150 characters.");

            RuleFor(x => x.Description)
                // Description maximum length is 1000 characters when provided
                .MaximumLength(1000)
                .WithMessage("Description cannot exceed 1000 characters.")
                .When(x => !string.IsNullOrEmpty(x.Description));
        }
    }
}
