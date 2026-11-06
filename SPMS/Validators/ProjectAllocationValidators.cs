using FluentValidation;
using SPMS.Dtos;

namespace SPMS.Validators
{
    public class ProjectAllocationCreateDtoValidator : AbstractValidator<ProjectAllocationCreateDto>
    {
        public ProjectAllocationCreateDtoValidator()
        {
            // ProjectId is optional so the student can select a topic later.

            RuleFor(x => x.StudentId)
                // Student ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Student ID is required.");

            RuleFor(x => x.FacultyId)
                // Faculty ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Faculty ID is required.");

            RuleFor(x => x.AssignedDate)
                // Assigned Date is mandatory
                .NotEmpty()
                .WithMessage("Assigned Date is required.");

            RuleFor(x => x.ProjectStartDate)
                // Project Start Date is mandatory
                .NotEmpty()
                .WithMessage("Project Start Date is required.");

            RuleFor(x => x.ProjectEndDate)
                // Project End Date is mandatory
                .NotEmpty()
                .WithMessage("Project End Date is required.")

                // Project End Date must be greater than or equal to Start Date
                .GreaterThanOrEqualTo(x => x.ProjectStartDate)
                .WithMessage("Project End Date must be after or on the Project Start Date.");

            RuleFor(x => x.TotalTasksGiven)
                // Total Tasks Given cannot be negative
                .GreaterThanOrEqualTo(0)
                .WithMessage("Total Tasks Given cannot be negative.");

            RuleFor(x => x.TotalCompletedTasks)
                // Total Completed Tasks cannot be negative
                .GreaterThanOrEqualTo(0)
                .WithMessage("Total Completed Tasks cannot be negative.")

                // Total Completed Tasks cannot exceed Total Tasks Given
                .LessThanOrEqualTo(x => x.TotalTasksGiven)
                .WithMessage("Total Completed Tasks cannot exceed Total Tasks Given.");

            RuleFor(x => x.ProgressPercentage)
                // Progress Percentage must be between 0 and 100
                .InclusiveBetween(0, 100)
                .WithMessage("Progress Percentage must be between 0 and 100.");

            RuleFor(x => x.OverAllGrade)
                // Overall Grade maximum length is 10 characters when provided
                .MaximumLength(10)
                .WithMessage("Overall Grade cannot exceed 10 characters.")
                .When(x => !string.IsNullOrEmpty(x.OverAllGrade));
        }
    }

    public class ProjectAllocationUpdateDtoValidator : AbstractValidator<ProjectAllocationUpdateDto>
    {
        public ProjectAllocationUpdateDtoValidator()
        {
            // ProjectId is optional so the student can select a topic later.

            RuleFor(x => x.StudentId)
                // Student ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Student ID is required.");

            RuleFor(x => x.FacultyId)
                // Faculty ID is mandatory and must be greater than 0
                .GreaterThan(0)
                .WithMessage("Valid Faculty ID is required.");

            RuleFor(x => x.AssignedDate)
                // Assigned Date is mandatory
                .NotEmpty()
                .WithMessage("Assigned Date is required.");

            RuleFor(x => x.ProjectStartDate)
                // Project Start Date is mandatory
                .NotEmpty()
                .WithMessage("Project Start Date is required.");

            RuleFor(x => x.ProjectEndDate)
                // Project End Date is mandatory
                .NotEmpty()
                .WithMessage("Project End Date is required.")

                // Project End Date must be greater than or equal to Start Date
                .GreaterThanOrEqualTo(x => x.ProjectStartDate)
                .WithMessage("Project End Date must be after or on the Project Start Date.");

            RuleFor(x => x.TotalTasksGiven)
                // Total Tasks Given cannot be negative
                .GreaterThanOrEqualTo(0)
                .WithMessage("Total Tasks Given cannot be negative.");

            RuleFor(x => x.TotalCompletedTasks)
                // Total Completed Tasks cannot be negative
                .GreaterThanOrEqualTo(0)
                .WithMessage("Total Completed Tasks cannot be negative.")

                // Total Completed Tasks cannot exceed Total Tasks Given
                .LessThanOrEqualTo(x => x.TotalTasksGiven)
                .WithMessage("Total Completed Tasks cannot exceed Total Tasks Given.");

            RuleFor(x => x.ProgressPercentage)
                // Progress Percentage must be between 0 and 100
                .InclusiveBetween(0, 100)
                .WithMessage("Progress Percentage must be between 0 and 100.");

            RuleFor(x => x.OverAllGrade)
                // Overall Grade maximum length is 10 characters when provided
                .MaximumLength(10)
                .WithMessage("Overall Grade cannot exceed 10 characters.")
                .When(x => !string.IsNullOrEmpty(x.OverAllGrade));
        }
    }
}
