// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps.Templates
{
    public class PageTemplates : App
    {
        public PageTemplates(BrowserWrapper browser, string clientUrl) : base("templates", browser, clientUrl)
        {
        }

        public TemplatesPanel TemplatesPanel => new(Browser.FindElement("app-templates-lhs-panel"));

        public CardContainer CardContainer => new(Browser.FindElement(".card-container"));
        public HeaderContainer HeaderContainer => new(Browser.FindElement(".header-container"));

        public List<TemplateCard> Templates => CardContainer.GetItemCards().ConvertAll(new Converter<WebElement, TemplateCard>(WebElementToTemplateCard));
        public TemplateCard SelectedTemplateCard => Templates.Find(c => c.IsSelected());
        public string UsageCount => CardContainer.ItemDetails.FindElement("template-usage-count-label").Text;
        public PageDesignDialog PageDesignDialog => new(Browser.FindElement(".cdk-overlay-container app-assign-page-design-dialog"));

        public void InvokeCreateTemplate()
        {
            HeaderContainer.ctaButton.Click();
        }

        public new PageTemplates Open()
        {
            base.Open(site: Constants.SXAHeadlessSite);
            WaitForAnyTemplatesInfoToLoad();
            return this;
        }

        public PageTemplates Open(string site, bool expectedEmptyState = false)
        {
            base.Open(site: site);
            WaitForAnyTemplatesInfoToLoad(expectedEmptyState);
            return this;
        }

        public TemplateCard SelectTemplate(string name)
        {
            return Templates.Find(t => t.Name.Equals(name)).Select();
        }

        public void WaitForTemplatesInfoReFetch()
        {
            Browser.WaitForNetworkCalls();
            Templates.WaitForCondition(t => t.All(c => !c.IsSelected()), 500, 100);
        }

        private static TemplateCard WebElementToTemplateCard(WebElement element)
        {
            return new TemplateCard(element);
        }

        private void WaitForAnyTemplatesInfoToLoad(bool expectedEmptyState = false)
        {
            Browser.WaitForHorizonIsStable();
            Browser.WaitForCondition(b => b.CheckElementExists(".card-container"));
            Browser.WaitForNetworkCalls();
            if (!expectedEmptyState)
            {
                Browser.WaitForCondition(b => !b.CheckElementExists(".card-container app-empty-state"));
            }
        }
    }
}
