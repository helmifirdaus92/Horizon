// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps.Templates;

public class EditPageDesign : App
{
    private const string CanvasCssSelector = "iFrame";

    public EditPageDesign(BrowserWrapper browser, string clientUrl) : base("editpagedesign", browser, clientUrl)
    {
    }

    public PageLayout CurrentPage => GetCurrentPageDesignInCanvas(CanvasCssSelector, Browser);

    public LeftHandPanel LeftHandPanel => new(Browser.FindElement("app-left-hand-side"));

    private IWebElement _close => Browser.FindElement("button.design-close-btn");

    public bool IsOpened()
    {
        Browser.WaitForDotsLoader();
        return Browser.PageUrl.Contains("editpagedesign?");
    }

    public void Close()
    {
        _close.Click();
    }

    public void WaitForLoad()
    {
        Browser.WaitForCondition(c => IsOpened());
    }

    protected static PageLayout GetCurrentPageDesignInCanvas(string frameSccSelector, BrowserWrapper browser)
    {
        var page = new PageLayout(frameSccSelector, browser.GetDriver());
        return page;
    }
}
