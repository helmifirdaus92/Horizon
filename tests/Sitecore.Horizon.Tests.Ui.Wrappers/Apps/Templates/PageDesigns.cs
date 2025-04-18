// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps.Templates
{
    public class PageDesigns : App
    {
        public PageDesigns(BrowserWrapper browser, string clientUrl) : base("templates/pagedesigns", browser, clientUrl)
        {
        }

        public CardContainer CardContainer => new CardContainer(Browser.FindElement(".card-container"));

        public TemplatesPanel TemplatesPanel => new TemplatesPanel(Browser.FindElement("app-templates-lhs-panel"));

        public new PageDesigns Open()
        {
            base.Open(site: Constants.SXAHeadlessSite);
            Browser.WaitForDotsLoader();
            Browser.WaitForCondition(b => b.CheckElementExists("app-page-designs"));
            Browser.WaitForNetworkCalls();
            return this;
        }
    }
}
