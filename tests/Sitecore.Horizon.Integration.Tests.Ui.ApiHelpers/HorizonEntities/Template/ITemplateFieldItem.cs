// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template
{
    public interface ITemplateFieldItem : IGenericItem
    {
        PageFieldType FieldType { get; }
        void SetValidation(string text);
        void SetValidationRule(ValidationRule validationRule);
    }
}
