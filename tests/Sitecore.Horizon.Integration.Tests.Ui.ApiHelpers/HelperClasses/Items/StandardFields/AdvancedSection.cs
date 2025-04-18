// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public class AdvancedSection : IAdvancedSection
    {
        private readonly string _contextItemPath;
        private readonly DatabaseType _contextDatabase;
        private readonly HelperService _helperService;

        public AdvancedSection(string contextItemPath, DatabaseType contextDatabase, HelperService helperService)
        {
            _contextItemPath = contextItemPath;
            _contextDatabase = contextDatabase;
            _helperService = helperService;
        }

        public void SetFallbackLanguage(bool enabled)
        {
            string value = enabled == true ? "1" : "";
            _helperService.EditItem(_contextItemPath, "__Enable item fallback", value);
        }
    }
}
