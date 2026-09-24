using FluentValidation;
using SPMS.Dtos;

namespace SPMS.Validators
{
    public class UserRoleCreateDtoValidator : AbstractValidator<UserRoleCreateDto>
    {
        public UserRoleCreateDtoValidator()
        {
            RuleFor(x => x.RoleId)
                // Role ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Role ID is required.");

            RuleFor(x => x.UserId)
                // User ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid User ID is required.");
        }
    }

    public class UserRoleUpdateDtoValidator : AbstractValidator<UserRoleUpdateDto>
    {
        public UserRoleUpdateDtoValidator()
        {
            RuleFor(x => x.RoleId)
                // Role ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Role ID is required.");

            RuleFor(x => x.UserId)
                // User ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid User ID is required.");
        }
    }
}
