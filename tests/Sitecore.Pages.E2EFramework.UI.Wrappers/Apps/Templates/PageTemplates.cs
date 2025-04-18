// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Templates;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps.Templates
{
    public class PageTemplates : App
    {
        public PageTemplates(BrowserWrapper browser, string clientUrl) : base("templates", browser, clientUrl)
        {
        }

        public CardContainer CardContainer => new(Browser.FindElement("app-page-templates .card-container"));
        public List<TemplateInfo> Templates => CardContainer.Table.FindElements("tr").Select(row => new TemplateInfo(row)).ToList();
        public PageDesignDialog PageDesignDialog => new(Browser.FindElement(".cdk-overlay-container app-assign-page-design-dialog"));
        public TemplatesPanel TemplatesLHSPanel => _leftHandPanel.TemplatesPanel;
        private LeftHandPanel _leftHandPanel => new(Browser.FindElement(Constants.AppLeftHandSideLocator));

        public TemplateInfo? TemplateInfoByName(string name)
        {
            Browser.WaitForHorizonIsStable();
            return Templates.Find(t => t.Name.Equals(name));
        }
    }
}
