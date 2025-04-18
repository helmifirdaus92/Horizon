// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps.Templates;

public class PartialDesignEditor : App
{
    private readonly string canvasCssSelector = "iframe:not([hidden])";

    public PartialDesignEditor(BrowserWrapper browser, string clientUrl) : base("editpartialdesign", browser, clientUrl)
    {
    }

    private WebElement _close => Browser.FindElement("button.design-close-btn");

    public bool IsOpened()
    {
        Browser.WaitForDotsLoader();
        return Browser.PageUrl.Contains("editpartialdesign?");
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

    public void WaitForPartialDesignInCanvasLoaded()
    {
        WaitForNewPageInCanvas(canvasCssSelector, Browser);
        Browser.WaitForHorizonIsStable();
    }

    public PageLayout CurrentPage => GetCurrentPageInCanvas(canvasCssSelector, Browser);
}
