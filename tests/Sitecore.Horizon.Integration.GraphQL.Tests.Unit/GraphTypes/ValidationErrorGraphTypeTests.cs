// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.AutoNSubstitute;
using Sitecore.Data.Validators;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ValidationErrorGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(ValidationErrorGraphType sut, [Substitute] BaseValidator validator, string errorMessage)
        {
            var validationError = new ValidationError(validator)
            {
                ErrorMessage = errorMessage,
                ErrorLevel = ValidatorResult.Error
            };

            // act & assert
            sut.Should().ResolveFieldValueTo("fieldId", validationError.FieldId, c => c.WithSource(validationError));
            sut.Should().ResolveFieldValueTo("errorMessage", errorMessage, c => c.WithSource(validationError));
            sut.Should().ResolveFieldValueTo("errorLevel", validationError.ErrorLevel, c => c.WithSource(validationError));
            sut.Should().ResolveFieldValueTo("aborted", validationError.ShouldAbortPipeline, c => c.WithSource(validationError));
        }
    }
}
