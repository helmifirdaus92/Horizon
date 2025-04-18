// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Xml.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Presentation;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template;
using XAttribute = UTF.HelperWebService.XAttribute;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public interface ILayoutSection
    {
        ILayoutSection AssignLayout(ILayoutItem layout, string device = Settings.DefaultDevice, string language = "en", int version = 1, bool isFinalLayout = false);

        ILayoutSection AddControl(IGenericItem rendering, string placeholder = "content", string datasourceId = null, string device = Settings.DefaultDevice,
            string language = "en", int version = 1, bool isFinalLayout = false);

        ILayoutSection SetRenderingDatasource(IGenericItem rendering, string datasourceId = null, string device = Settings.DefaultDevice, string language = "en",
            int version = 1, bool isFinalLayout = false);

        ILayoutSection AddPlaceholderSettings(IGenericItem placeholderItem, string placeholderKey, string datasourceId = null, string device = Settings.DefaultDevice,
            string language = "en", int version = 1, bool isFinalLayout = false);

        ILayoutSection AddRenderingPersonalization(IRenderingItem rendering, string ruleName, string conditionId, XAttribute[] conditionParameters,
            string actionId, XAttribute[] actionParameters, string device = Settings.DefaultDevice, string language = "en", int version = 1, bool isFinalLayout = false);

        void ChangeTemplate(ITemplateItem template);
        string[] GetRenderingsFromFinalLayout(string language = "en", int version = 1, string deviceId = Settings.DefaultDevice);
        public XDocument GetRawValue(string language = "en", int version = 1, bool isFinalLayout = true);
    }
}
