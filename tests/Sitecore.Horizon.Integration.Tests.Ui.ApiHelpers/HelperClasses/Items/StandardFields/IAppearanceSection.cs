// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public interface IAppearanceSection
    {
        void SetDisplayName(string displayName, string language = "en", int version = 1);
        string GetDisplayName(string language = "en", int version = 1);
    }
}
