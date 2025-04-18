// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.File;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Configuration
{
    public class SitecoreSite : ISitecoreSite
    {
        private const string ItemLanguageFallbach = "enableItemLanguageFallback";
        private readonly HelperService _helperService;
        private readonly string _configPath;
        private string _name;
        private string _language;
        private string _startItem;
        private string _rootPath;

        public SitecoreSite(string name, string configPath, HelperService service)
        {
            _name = name;
            _helperService = service;
            _configPath = configPath.Remove(0, @"\App_Config".Length);
            PatchFile = new GenericFile(configPath);
            PatchFile.DoNotDelete = true;
            TestData.FilesToDelete.Add(PatchFile);
        }

        public GenericFile PatchFile { get; }

        public string Name
        {
            get => _name;
            set
            {
                SetSiteParam("name", value);
                _name = value;
            }
        }

        public string Language
        {
            get => _language ?? GetSiteParam("language");
            set
            {
                SetSiteParam("language", value);
                _language = value;
            }
        }

        public string RootPath
        {
            get => _rootPath ?? GetSiteParam("rootPath");
            set
            {
                SetSiteParam("rootPath", value);
                _rootPath = value;
            }
        }

        public string StartItem
        {
            get => _startItem ?? GetSiteParam("startItem");
            set
            {
                SetSiteParam("startItem", $"{value}");
                _startItem = value;
            }
        }

        public bool EnableFieldLanguageFallback
        {
            get => GetSiteParam(ItemLanguageFallbach) == "true";
            set => SetSiteParam(ItemLanguageFallbach, (value).ToString());
        }

        private string SiteXpath => $"//configuration/sitecore/sites/site[@name='{_name}']";

        private void SetSiteParam(string paramName, string value)
        {
            _helperService.EditConfig(_configPath, $"{SiteXpath}/@{paramName}", value);
        }

        private string GetSiteParam(string paramName)
        {
            var value = _helperService.GetXmlValue(@"\App_Config" + _configPath, $"{SiteXpath}/@{paramName}");
            return value;
        }
    }
}
