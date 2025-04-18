// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps.Templates;

public class EditPartialDesign : App
{
    private const string CanvasCssSelector = "iFrame";

    public EditPartialDesign(BrowserWrapper browser, string clientUrl) : base("editpartialdesign", browser, clientUrl)
    {
    }

    public PageLayout CurrentPage => GetCurrentPartialDesignInCanvas(CanvasCssSelector, Browser);

    public ComponentGalleryDialogPanel ComponentGalleryDialogPanel => new(Browser.RootDriver.FindElement("#galleryContainer"));
    public RightHandPanel RightHandPanel => new(Browser.RootDriver.FindElement(Constants.AppRightHandSideLocator));

    private IWebElement _close => Browser.RootDriver.FindElement("button.design-close-btn");
    private IWebElement Preview => Browser.RootDriver.FindElement("app-horizon-workspace-header-preview-link [title=Preview]");
    public EditorHeader EditorHeader => new(Browser.RootDriver.FindElement("app-editor-header"), WaitForNewPageInCanvasLoaded);


    public void Close()
    {
        _close.Click();
    }

    public void WaitForLoad()
    {
        Browser.WaitForCondition(c => IsOpened());
    }

    public void OpenPreview()
    {
        Browser.SwitchToDefaultContent();
        Preview.Click();
        Browser.WaitForHorizonIsStable();
        Browser.WaitForCondition(b => b.TabsCount > 1);
    }

    public bool IsOpened()
    {
        Browser.GetDriver().WaitForDotsLoader();
        return Browser.PageUrl.Contains("editpartialdesign?");
    }

    protected static PageLayout GetCurrentPartialDesignInCanvas(string frameSccSelector, BrowserWrapper browser)
    {
        var page = new PageLayout(frameSccSelector, browser.GetDriver());
        return page;
    }
}
