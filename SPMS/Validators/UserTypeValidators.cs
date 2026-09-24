using FluentValidation;
using SPMS.Dtos;

namespace SPMS.Validators
{
    public class UserTypeCreateDtoValidator : AbstractValidator<UserTypeCreateDto>
    {
        public UserTypeCreateDtoValidator()
        {
            RuleFor(x => x.UserTypeName)
                // User Type Name is mandatory
                .NotEmpty()
                .WithMessage("User Type Name is required.")

                // User Type Name should not contain only whitespace characters
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("User Type Name cannot be empty or whitespace.")

                // User Type Name maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("User Type Name cannot exceed 50 characters.");

            RuleFor(x => x.Description)
                // Description maximum length is 250 characters when provided
                .MaximumLength(250)
                .WithMessage("Description cannot exceed 250 characters.")
                .When(x => !string.IsNullOrEmpty(x.Description));
        }
    }

    public class UserTypeUpdateDtoValidator : AbstractValidator<UserTypeUpdateDto>
    {
        public UserTypeUpdateDtoValidator()
        {
            RuleFor(x => x.UserTypeName)
                // User Type Name is mandatory
                .NotEmpty()
                .WithMessage("User Type Name is required.")

                // User Type Name should not contain only whitespace characters
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("User Type Name cannot be empty or whitespace.")

                // User Type Name maximum length must not exceed 50 characters
                .MaximumLength(50)
                .WithMessage("User Type Name cannot exceed 50 characters.");

            RuleFor(x => x.Description)
                // Description maximum length is 250 characters when provided
                .MaximumLength(250)
                .WithMessage("Description cannot exceed 250 characters.")
                .When(x => !string.IsNullOrEmpty(x.Description));
        }
    }
}
