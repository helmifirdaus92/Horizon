// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using Sitecore.Data;
using Sitecore.Data.Validators;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    internal class ValidationError
    {
        public ValidationError(BaseValidator validator)
        {
            Assert.ArgumentNotNull(validator, nameof(validator));

            ErrorMessage = ValidatorManager.GetValidationErrorDetails(validator);
            FieldId = validator.FieldID;
            ErrorLevel = validator.Result;
        }

        public string ErrorMessage { get; set; }
        public ID FieldId { get; set; }
        public ValidatorResult ErrorLevel { get; set; }

        public bool ShouldAbortPipeline => ErrorLevel == ValidatorResult.Error || ErrorLevel == ValidatorResult.CriticalError || ErrorLevel == ValidatorResult.FatalError;
    }
}
