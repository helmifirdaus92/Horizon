// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public interface IVersionSection
    {
        public string GetVersionName(string language, int versionNumber);
        public void SetVersionName(string value, string language, int versionNumber);
    }
}
