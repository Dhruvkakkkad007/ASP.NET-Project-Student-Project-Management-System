using FluentValidation;
using SPMS.Dtos;
using System.Linq;

namespace SPMS.Validators
{
    public class UserCreateDtoValidator : AbstractValidator<UserCreateDto>
    {
        public UserCreateDtoValidator()
        {
            RuleFor(x => x.UserTypeId)
                // User Type Id is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("User Type is required.");

            RuleFor(x => x.FullName)
                // Full Name is mandatory
                .NotEmpty()
                .WithMessage("Full Name is required.")

                // Full Name should not contain only whitespace characters
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Full Name cannot be empty or whitespace.")

                // Full Name cannot contain numbers
                .Must(name => !name.Any(char.IsDigit))
                .WithMessage("Full Name cannot contain digits.")

                // Full Name length must not exceed 100 characters
                .MaximumLength(100)
                .WithMessage("Full Name cannot exceed 100 characters.");

            RuleFor(x => x.Email)
                // Email is mandatory
                .NotEmpty()
                .WithMessage("Email is required.")

                // Email must be a valid email format
                .EmailAddress()
                .WithMessage("A valid email address is required.")

                // Email length must not exceed 100 characters
                .MaximumLength(100)
                .WithMessage("Email cannot exceed 100 characters.");

            RuleFor(x => x.Password)
                // Password is mandatory
                .NotEmpty()
                .WithMessage("Password is required.")

                // Password minimum length is 6 characters
                .MinimumLength(6)
                .WithMessage("Password must be at least 6 characters long.")

                // Password maximum length is 100 characters
                .MaximumLength(100)
                .WithMessage("Password cannot exceed 100 characters.");

            RuleFor(x => x.MobileNumber)
                // Mobile Number is mandatory
                .NotEmpty()
                .WithMessage("Mobile Number is required.")

                // Mobile Number must be valid format
                .Matches(@"^[0-9+\-\s]{7,15}$")
                .WithMessage("Mobile Number is invalid.")

                // Mobile Number maximum length is 15 characters
                .MaximumLength(15)
                .WithMessage("Mobile Number cannot exceed 15 characters.");

            RuleFor(x => x.ProfilePicturePath)
                // Profile Picture Path maximum length is 255 characters
                .MaximumLength(255)
                .WithMessage("Profile Picture Path cannot exceed 255 characters.");

            RuleFor(x => x.UserCode)
                // User Code maximum length is 50 characters when provided
                .MaximumLength(50)
                .WithMessage("User Code cannot exceed 50 characters.")
                .When(x => !string.IsNullOrEmpty(x.UserCode));
        }
    }

    public class UserUpdateDtoValidator : AbstractValidator<UserUpdateDto>
    {
        public UserUpdateDtoValidator()
        {
            RuleFor(x => x.UserTypeId)
                // User Type Id is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("User Type is required.");

            RuleFor(x => x.FullName)
                // Full Name is mandatory
                .NotEmpty()
                .WithMessage("Full Name is required.")

                // Full Name should not contain only whitespace characters
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Full Name cannot be empty or whitespace.")

                // Full Name cannot contain numbers
                .Must(name => !name.Any(char.IsDigit))
                .WithMessage("Full Name cannot contain digits.")

                // Full Name length must not exceed 100 characters
                .MaximumLength(100)
                .WithMessage("Full Name cannot exceed 100 characters.");

            RuleFor(x => x.Email)
                // Email is mandatory
                .NotEmpty()
                .WithMessage("Email is required.")

                // Email must be a valid email format
                .EmailAddress()
                .WithMessage("A valid email address is required.")

                // Email length must not exceed 100 characters
                .MaximumLength(100)
                .WithMessage("Email cannot exceed 100 characters.");

            RuleFor(x => x.Password)
                // Password is mandatory
                .NotEmpty()
                .WithMessage("Password is required.")

                // Password minimum length is 6 characters
                .MinimumLength(6)
                .WithMessage("Password must be at least 6 characters long.")

                // Password maximum length is 100 characters
                .MaximumLength(100)
                .WithMessage("Password cannot exceed 100 characters.");

            RuleFor(x => x.MobileNumber)
                // Mobile Number is mandatory
                .NotEmpty()
                .WithMessage("Mobile Number is required.")

                // Mobile Number must be valid format
                .Matches(@"^[0-9+\-\s]{7,15}$")
                .WithMessage("Mobile Number is invalid.")

                // Mobile Number maximum length is 15 characters
                .MaximumLength(15)
                .WithMessage("Mobile Number cannot exceed 15 characters.");

            RuleFor(x => x.ProfilePicturePath)
                // Profile Picture Path maximum length is 255 characters
                .MaximumLength(255)
                .WithMessage("Profile Picture Path cannot exceed 255 characters.");

            RuleFor(x => x.UserCode)
                // User Code maximum length is 50 characters when provided
                .MaximumLength(50)
                .WithMessage("User Code cannot exceed 50 characters.")
                .When(x => !string.IsNullOrEmpty(x.UserCode));
        }
    }

    public class UserLoginDtoValidator : AbstractValidator<UserLoginDto>
    {
        public UserLoginDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .EmailAddress()
                .WithMessage("A valid email address is required.");

            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Password is required.");
        }
    }
}
