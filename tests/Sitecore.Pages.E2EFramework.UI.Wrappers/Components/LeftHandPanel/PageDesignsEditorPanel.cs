// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel
{
    public class PageDesignsEditorPanel : BaseControl
    {
        //app-page-designs-lhs-panel
        public PageDesignsEditorPanel(IWebElement container) : base(container)
        {
        }

        private List<IWebElement> EditPageDesignTabs => Container.FindElements("ng-spd-tab-group button").ToList();
        private IWebElement SearchBox => Container.FindElement(".search input");
        public EditPageDesignDetailsPanel EditPageDesignDetailsPanel => new (Container.FindElement(".design-tabs div[class^='edit-page-desing-details-panel']"));
        public List<IWebElement> AvailablePartialDesigns => Container.FindElements(".available-partial-designs-list div[class^='available-partial-design-item']").ToList();
        public void Search(string value)
        {
            Container.GetDriver().WaitForNetworkCalls();
            Container.GetDriver().WaitForHorizonIsStable();
            SearchBox.Clear();
            SearchBox.SendKeys(value);
            Container.GetDriver().WaitForDotsLoader();
        }

        public void OpenDetails()
        {
            EditPageDesignTabs.First(c => c.Text == "Details").Click();
        }
    }
}
