// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps.Templates
{
    public class PageDesignEditor : App
    {
        public PageDesignEditor(BrowserWrapper browser, string clientUrl) : base("editpagedesign", browser, clientUrl)
        {
        }

        private WebElement _close => Browser.FindElement("button.design-close-btn");

        public bool IsOpened()
        {
            Browser.WaitForDotsLoader();
            return Browser.PageUrl.Contains("editpagedesign?");
        }

        public void Close()
        {
            _close.Click();
            Browser.WaitForDocumentLoaded();
        }

        public void WaitForLoad()
        {
            Browser.WaitForDocumentLoaded();
            Browser.WaitForCondition(c => IsOpened());
        }
    }
}
