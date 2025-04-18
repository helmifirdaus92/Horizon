// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps
{
    public class Preview : App
    {
        public Preview(BrowserWrapper browser, string backEndUrl) : base("?sc_horizon=preview&sc_headless_mode=preview", browser, backEndUrl)
        {
        }

        public string HeaderText => _headerElementInMVCRendering.Text;

        private WebElement _headerElementInMVCRendering => Browser.FindElement("h1");

        public void WaitForContentDisplayed()
        {
            Browser.WaitForCondition(d=>d.CheckElementExists("h1"),millisecondsTimeout:120000,pollInterval:1000);
        }

        public void ClosePreviewAndSwitchToEditor()
        {
            Browser.CloseCurrentWindow();
            Browser.SwitchToRootTab();
        }

        public bool IsOpened()
        {
            return Browser.PageUrl.Contains("sc_horizon=preview");
        }
    }
}
