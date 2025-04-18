// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopBar;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Versions;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps;

public class Editor : App
{
    private const string CanvasCssSelector = "iframe.editor";
    private const string SchedulePublishingAvailabilityLocator = ".cdk-overlay-pane app-version-publishing-settings";

    public Editor(BrowserWrapper browser, string clientUrl) : base("editor", browser, clientUrl)
    {
    }

    public PageLayout CurrentPage => GetCurrentPageInCanvas(CanvasCssSelector, Browser);
    public LeftHandPanel LeftHandPanel => new(Browser.RootDriver.FindElement(Constants.AppLeftHandSideLocator), WaitForNewPageInCanvasLoaded);
    public Rectangle LeftPanelRectangle => new(LeftHandPanel.Container.Location, LeftHandPanel.Container.Size);
    public RightHandPanel RightHandPanel => new(Browser.RootDriver.FindElement(Constants.AppRightHandSideLocator));
    public TopBar TopBar => new(Browser.RootDriver.FindElement("app-top-bar"), WaitForNewPageInCanvasLoaded);
    public EditorHeader EditorHeader => new(Browser.RootDriver.FindElement("app-editor-header"), WaitForNewPageInCanvasLoaded);
    public SchedulePublishingAvailabilityDialog SchedulePublishingAvailability => new(Browser.RootDriver.FindElement(SchedulePublishingAvailabilityLocator));
    public CreateDialog CreateVersionDialog => new(Browser.RootDriver.FindElement(Constants.DialogPanelLocator));
    public RenameDialog RenameVersionDialog => new(Browser.RootDriver.FindElement(Constants.DialogPanelLocator));
    public DeleteDialog DeleteDialog => new(Browser.RootDriver.FindElement(Constants.DialogPanelLocator));
    public DuplicateDialog DuplicateVersionDialog => new(Browser.RootDriver.FindElement(Constants.DialogPanelLocator));

    public PageDetailsDialog PageDetails => new(Browser.RootDriver.FindElement("app-page-details-dialog"));

    public MediaDialog MediaDialog => new(Browser.RootDriver.FindElement("app-media-dialog"));

    public ComponentGalleryDialogPanel ComponentGalleryDialogPanel => new(Browser.RootDriver.FindElement("#galleryContainer"));

    public Rectangle CanvasRectangle => new(Browser.RootDriver.FindElement(CanvasCssSelector).Location, Browser.RootDriver.FindElement(CanvasCssSelector).Size);

    public DatasourceDialog DatasourceDialog => new(Browser.FindElement(Constants.DatasourceDialogLocator));

    public ContentItemDialog ContentItemDialog => new(Browser.FindElement(Constants.ContentItemDialogLocator));

    public IWebElement OverlayContainer => Browser.RootDriver.FindElement(".cdk-overlay-container");

    public ConfirmationDialog SavingErrorDialog => new(OverlayContainer.FindElement("app-warning-dialog"));

    public AddPhoneNumberDialog AddPhoneNumberDialog => new(OverlayContainer.FindElement("app-add-phone-number"));

    public InternalLinkDialog InternalLinkDialog => new(OverlayContainer.FindElement("app-content-item-dialog"));

    public AddLinkBalloon AddLinkBalloon => new(Browser.FindElement("div.ck-balloon-rotator form"));

    private IWebElement Preview => Browser.FindElement("app-horizon-workspace-header-preview-link [title=Preview]");

    public bool IsMediaDialogOpened()
    {
        return Browser.RootDriver.CheckElementExists("app-media-dialog");
    }

    public void ReloadCanvas()
    {
        CanvasReloadButton.Click();
        WaitForNewPageInCanvasLoaded();
    }

    public bool? IsPublishingAvailabilityOpen()
    {
        return Browser.RootDriver?.CheckElementExists(SchedulePublishingAvailabilityLocator);
    }

    public Editor Open(string? site)
    {
        base.Open(site: site);
        WaitForNewPageInCanvasLoaded();
        return this;
    }

    public Editor Open(string pageId, string? site, bool waitForCanvasLoad = true, string? tenantName=null)
    {
        base.Open(pageId: pageId, site: site, tenantName: tenantName);
        if (waitForCanvasLoad)
        {
            WaitForNewPageInCanvasLoaded();
        }

        return this;
    }

    public void OpenPreview()
    {
        Browser.SwitchToDefaultContent();
        Preview.Click();
        Browser.WaitForHorizonIsStable();
        Browser.WaitForCondition(b => b.TabsCount > 1);
    }

    public Point GetDropPointOfRendering(string dropArea, CanvasControl rendering, int verticalDisposition = 5)
    {
        var renderingRectangle = rendering.ElementRectangle;
        int X = 0, Y = 0;
        switch (dropArea)
        {
            case "top":
                X = renderingRectangle.Left + renderingRectangle.Width / 2;
                Y = renderingRectangle.Top + verticalDisposition;
                break;
            case "bottom":
                X = renderingRectangle.Left + renderingRectangle.Width / 2;
                Y = renderingRectangle.Bottom - verticalDisposition;
                break;
        }

        return new Point(X + CanvasRectangle.X, Y + CanvasRectangle.Y);
    }
}
