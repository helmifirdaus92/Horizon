// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Pages
{
    public class NoOrgError : BaseControl
    {
        public NoOrgError(IWebElement container) : base(container)
        {
            Container.GetDriver().WaitForAngular();
        }

        public string Header => Container.FindElement(".ng-spd-empty-state-wrapper h4").Text;
        public string Content => Container.FindElement(".ng-spd-empty-state-content p").Text;
        public string PortalLinkText => PortalLink.Text;
        public string PortalLinkUrl => PortalLink.GetAttribute("href");
        public Button LogOutButton => Container.FindControl<Button>("app-logout-link a");
        private IWebElement PortalLink => Container.FindElement(".ng-spd-empty-state-content a");
    }
}
