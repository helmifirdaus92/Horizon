// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Xml.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Presentation;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template;
using UTF.HelperWebService;
using XAttribute = UTF.HelperWebService.XAttribute;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public class LayoutSection : ILayoutSection
    {
        private readonly string _contextItemPath;
        private readonly DatabaseType _contextDatabase;
        private readonly HelperService _helperService;

        public LayoutSection(string contextItemPath, DatabaseType contextDatabase, HelperService helperService)
        {
            _contextItemPath = contextItemPath;
            _contextDatabase = contextDatabase;
            _helperService = helperService;
        }

        public ILayoutSection AssignLayout(ILayoutItem layout, string device = Settings.DefaultDevice, string language = "en", int version = 1,
            bool isFinalLayout = false)
        {
            if (isFinalLayout)
            {
                _helperService.SetLayoutToItemFinalLayout(_contextItemPath, language, version, layout.Id, device, (Database)_contextDatabase);
            }
            else
            {
                _helperService.SetLayoutToItemSharedLayout(_contextItemPath, layout.Id, device, (Database)_contextDatabase);
            }

            return this;
        }

        public XDocument GetRawValue(string language = "en", int version = 1, bool isFinalLayout = true)
        {
            string fieldName = isFinalLayout ? "__Final Renderings" : "__Renderings";
            var rawValueString = _helperService.GetFieldVersionValue(_contextItemPath, fieldName, language, version);
            return string.IsNullOrEmpty(rawValueString)? null : XDocument.Parse(rawValueString);
        }

        public ILayoutSection AddControl(IGenericItem rendering, string placeholder, string datasourceId = null, string device = Settings.DefaultDevice,
            string language = "en", int version = 1, bool isFinalLayout = false)
        {
            if (isFinalLayout)
            {
                _helperService.AddRenderingToItemFinalLayout(_contextItemPath, language, version, rendering.Id, placeholder, datasourceId, device, (Database)_contextDatabase);
            }
            else
            {
                _helperService.AddRenderingToItemSharedLayout(_contextItemPath, rendering.Id, placeholder, datasourceId, device, (Database)_contextDatabase);
            }

            return this;
        }

        public ILayoutSection SetRenderingDatasource(IGenericItem rendering, string datasourceId = null, string device = Settings.DefaultDevice,
            string language = "en", int version = 1, bool isFinalLayout = false)
        {
            if (isFinalLayout)
            {
                _helperService.SetRenderingDatasourceToItemFinalLayout(_contextItemPath, language, version, rendering.Id, datasourceId, device, (Database)_contextDatabase);
            }
            else
            {
                _helperService.SetRenderingDatasourceToItemSharedLayout(_contextItemPath, rendering.Id, datasourceId, device, (Database)_contextDatabase);
            }

            return this;
        }

        public ILayoutSection AddPlaceholderSettings(IGenericItem placeholderItem, string placeholderKey, string datasourceId = null,
            string device = Settings.DefaultDevice, string language = "en", int version = 1, bool isFinalLayout = false)
        {
            if (isFinalLayout)
            {
                _helperService.AssignPlaceholderSettingToItemFinalLayout(_contextItemPath, language, version, placeholderItem.Id, placeholderKey, device, (Database)_contextDatabase);
            }
            else
            {
                _helperService.AssignPlaceholderSettingToItemSharedLayout(_contextItemPath, placeholderItem.Id, placeholderKey, device, (Database)_contextDatabase);
            }

            return this;
        }

        public ILayoutSection AddRenderingPersonalization(IRenderingItem rendering, string ruleName, string conditionId, XAttribute[] conditionParameters,
            string actionId, XAttribute[] actionParameters, string device = Settings.DefaultDevice, string language = "en", int version = 1, bool isFinalLayout = false)
        {
            if (isFinalLayout)
            {
                _helperService.AddPersonalizationRuleToItemFinalLayout(_contextItemPath, language, version, rendering.Id, ruleName,
                    conditionId, conditionParameters, actionId, actionParameters, device, (Database)_contextDatabase);
            }
            else
            {
                _helperService.AddPersonalizationRuleToItemSharedLayout(_contextItemPath, rendering.Id, ruleName,
                    conditionId, conditionParameters, actionId, actionParameters, device, (Database)_contextDatabase);
            }

            return this;
        }

        public void ChangeTemplate(ITemplateItem template)
        {
            _helperService.ChangeItemTemplate(_contextItemPath, template.Id, (Database)_contextDatabase);
        }

        public string[] GetRenderingsFromFinalLayout(string language = "en", int version = 1, string deviceId = Settings.DefaultDevice)
        {
            return _helperService.GetRenderingsFromFinalLayout(_contextItemPath, language, version, deviceId, (Database)_contextDatabase);
        }
    }
}
