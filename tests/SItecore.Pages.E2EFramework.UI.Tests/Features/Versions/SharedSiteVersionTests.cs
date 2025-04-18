// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Versions;

public class SharedLayoutForVersionTests : BaseFixture
{
    private Item _testPage;
    private Rendering _richTextComponent => Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text");

    [OneTimeSetUp]
    public void CreatePageWithVersions()
    {
        _testPage = Preconditions.CreatePage(doNotDelete: true);
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText));

        Preconditions.OpenSXAHeadlessSite();
        Context.Pages.TopBar.AppNavigation.OpenEditor();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);
    }

    [OneTimeTearDown]
    public void ReturnToTheFinalLayout()
    {
        Context.Pages.Editor.TopBar.SetFinalLayout();
        Context.Pages.Editor.TopBar.CloseLanguagesDropdown();
    }

    [Test]
    public void VersionDoesNotVisible_InSharedLayout()
    {
        // Add RichTex component to the placeholder
        _richTextComponent.RichTextField.Text = "Edits version 2";
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();

        // Create new version using Create button
        Context.Pages.Editor.EditorHeader.OpenVersions()
            .OpenCreateVersionDialog()
            .ClickCreateButton();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.EditorHeader.VersionsList.Versions.Count.Should().Be(2);

        // New version should have changes from the previous version in context
        _richTextComponent.RichTextField.Text.Should().Be("Edits version 2");
        Context.Pages.Editor.EditorHeader.CloseVersionsList();

        // add Title component to the placeholder (new version)
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title), version: 2);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem.Select();
        Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);

        // Set shared layout
        Context.Pages.Editor.TopBar.SetSharedLayout();

        // Close language dialog
        Context.Pages.Editor.TopBar.CloseLanguagesDropdown();

        // Check notification msg
        Context.Pages.Editor.TimedNotification.IsVisible.Should().BeTrue();
        Context.Pages.Editor.TimedNotification.Message.Should().Be(Constants.SharedLayoutNotification);

        // Close notification
        Context.Pages.Editor.TimedNotification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        // Check that layout is empty
        Context.Pages.Editor.CurrentPage.Renderings.Count.Should().Be(0);
        Context.Pages.Editor.CurrentPage.IsRenderingPresentInPlaceholder("main", "Rich Text").Should().BeFalse();

        // Change Shared layout
        var placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].DropLocation;
        var imageComponent = Context.Pages.Editor.LeftHandPanel.OpenComponentsTab()
            .GetMediaComponent("Image");
        imageComponent.DragToPoint(placeholder);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        // Check Image component in the Shared layout
        Context.Pages.Editor.CurrentPage.Renderings.Count.Should().Be(1);
        Context.Pages.Editor.CurrentPage.IsRenderingPresentInPlaceholder("main", "Image").Should().BeTrue();

        // Check timed notification
        Context.Pages.Editor.TimedNotification.IsVisible.Should().BeTrue();
        Context.Pages.Editor.TimedNotification.Message.Should().Be(Constants.SharedLayoutNotification);
        Context.Pages.Editor.TimedNotification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        // Go to final layout
        Context.Pages.Editor.TopBar.SetFinalLayout();

        // Close language dialog
        Context.Pages.Editor.TopBar.CloseLanguagesDropdown();

        // Check Renderings
        Context.Pages.Editor.CurrentPage.Renderings.Count.Should().Be(3);
        Context.Pages.Editor.CurrentPage.IsRenderingPresentInPlaceholder("main", "Rich Text").Should().BeTrue();
        Context.Pages.Editor.CurrentPage.IsRenderingPresentInPlaceholder("main", "Title").Should().BeTrue();
        Context.Pages.Editor.CurrentPage.IsRenderingPresentInPlaceholder("main", "Image").Should().BeTrue();

        //Open version 6 in editor
        Context.Pages.Editor.EditorHeader.OpenVersions().SelectVersion(1);
        Context.Pages.Editor.EditorHeader.CloseVersionsList();

        // Check renderings
        Context.Pages.Editor.CurrentPage.Renderings.Count.Should().Be(2);
        Context.Pages.Editor.CurrentPage.IsRenderingPresentInPlaceholder("main", "Title").Should().BeFalse();

        // Go to Site tree - About page
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        Context.Pages.Editor.LeftHandPanel.SelectPage("About");

        // Go to shared layout
        Context.Pages.Editor.TopBar.SetSharedLayout();

        Context.Pages.Editor.TopBar.CloseLanguagesDropdown();

        // Check renderings
        Context.Pages.Editor.CurrentPage.IsRenderingPresentInPlaceholder("main", "Image").Should().BeFalse();
    }
}
