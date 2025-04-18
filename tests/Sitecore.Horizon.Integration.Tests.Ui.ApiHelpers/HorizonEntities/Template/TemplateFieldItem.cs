// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template
{
    public class TemplateFieldItem : GenericItem, ITemplateFieldItem
    {
        public TemplateFieldItem(string itemIdOrPath, DatabaseType database, HelperService helperService) : base(itemIdOrPath, database, helperService)
        {
        }

        public PageFieldType FieldType
        {
            get
            {
                var fiedTypeRowValue = HelperService.GetItemFieldValue(Id, "Type");
                fiedTypeRowValue = fiedTypeRowValue.Replace("-", "").Replace(" ", "");
                var fieldTypeEnum = (PageFieldType)Enum.Parse(typeof(PageFieldType), fiedTypeRowValue);
                return fieldTypeEnum;
            }
        }


        public void SetValidation(string text)
        {
            HelperService.EditItem(Path, "Validation", text, (Database)Database);
        }

        public void SetValidationRule(ValidationRule validationRule)
        {
            string ruleId;
            switch (validationRule)
            {
                case ValidationRule.Required:
                    ruleId = "{59D4EE10-627C-4FD3-A964-61A88B092CBC}";
                    break;
                case ValidationRule.IsInteger:
                    ruleId = "{7CC88F55-8466-484B-A224-EF4984DCAEDA}";
                    break;
                case ValidationRule.MaxLength40:
                    ruleId = "{FCCB80B8-77A2-461D-9D9D-6A4C4D39ED17}";
                    break;
                case ValidationRule.MinimumLength8:
                    ruleId = "{F42F3E57-5A4B-49EF-A581-A60CEDC71305}";
                    break;
                case ValidationRule.Rating1To9:
                    ruleId = "{197DAE0B-F8C9-4C19-9C39-9CD3BAD94CE6}";
                    break;
                case ValidationRule.MustBeLowerCase:
                    ruleId = "{A76C1092-EE2E-4021-B9EE-21E541CDA1D7}";
                    break;
                case ValidationRule.MustBeUpperCase:
                    ruleId = "{E6D374A4-10BD-4B8B-94A6-5B1053E1E2C0}";
                    break;
                case ValidationRule.NoSpaces:
                    ruleId = "{8B1D42C8-3689-480C-89A2-62E6BD1EED57}";
                    break;
                case ValidationRule.NoTags:
                    ruleId = "{A8531E1B-30C6-4997-B6DB-2DDCA8772FA8}";
                    break;
                case ValidationRule.StartWithCapitalLetterAndEndWithDot:
                    ruleId = "{814B289A-6B89-4F54-97BE-BAD12EB297B0}";
                    break;
                default:
                    ruleId = "{59D4EE10-627C-4FD3-A964-61A88B092CBC}";
                    break;
            }

            HelperService.EditItem(Path, "Validator Bar", ruleId, (Database)Database);
        }
    }

    public enum ValidationRule
    {
        Required,
        MaxLength40,
        IsInteger,
        MinimumLength8,
        Rating1To9,
        MustBeLowerCase,
        MustBeUpperCase,
        NoSpaces,
        NoTags,
        StartWithCapitalLetterAndEndWithDot
    }
}
