using FluentValidation;
using SPMS.Dtos;

namespace SPMS.Validators
{
    public class RoleCreateDtoValidator : AbstractValidator<RoleCreateDto>
    {
        public RoleCreateDtoValidator()
        {
            RuleFor(x => x.RoleName)
                // Role Name is mandatory
                .NotEmpty()
                .WithMessage("Role Name is required.")

                // Role Name should not contain only whitespace characters
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Role Name cannot be empty or whitespace.")

                // Role Name maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("Role Name cannot exceed 50 characters.");

            RuleFor(x => x.Description)
                // Description maximum length is 250 characters when provided
                .MaximumLength(250)
                .WithMessage("Description cannot exceed 250 characters.")
                .When(x => !string.IsNullOrEmpty(x.Description));
        }
    }

    public class RoleUpdateDtoValidator : AbstractValidator<RoleUpdateDto>
    {
        public RoleUpdateDtoValidator()
        {
            RuleFor(x => x.RoleName)
                // Role Name is mandatory
                .NotEmpty()
                .WithMessage("Role Name is required.")

                // Role Name should not contain only whitespace characters
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Role Name cannot be empty or whitespace.")

                // Role Name maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("Role Name cannot exceed 50 characters.");

            RuleFor(x => x.Description)
                // Description maximum length is 250 characters when provided
                .MaximumLength(250)
                .WithMessage("Description cannot exceed 250 characters.")
                .When(x => !string.IsNullOrEmpty(x.Description));
        }
    }
}
