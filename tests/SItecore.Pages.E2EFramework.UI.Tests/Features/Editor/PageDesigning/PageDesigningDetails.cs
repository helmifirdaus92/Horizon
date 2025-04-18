// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel.ElementOptions;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;
using Image = Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel.ElementOptions.Image;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.PageDesigning;

public class PageDesigningDetails : BaseFixture
{
    private const string Component = "Promo";
    private Item _testPage;

    [SetUp]
    public void CreateAndOpenPage()
    {
        _testPage = Preconditions.CreateAndOpenPage();
    }

    [Test]
    public void CheckDetailsOfComponent()
    {
        // create datasource
        Item localDataSourceId = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Data", _testPage.itemId, SxaDataSourceTemplateId);
        Item promo = Preconditions.CreateItem("Promo", localDataSourceId.itemId, RenderingDataSourceTemplate(SxaRenderings.Promo));

        // drag-and-drop component to empty placeholder
        Point placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].DropLocation;
        Context.Pages.Editor.LeftHandPanel.OpenComponentsTab().GetPageContentComponent(Component).DragToPoint(placeholder);
        DatasourceDialog dialog = Context.Pages.Editor.DatasourceDialog;
        dialog.DatasourceItemTree.GetItemByPath("Data/Promo").Select(waitForLoad: false);
        dialog.Assign();
        Context.Browser.GetDriver().WaitForDotsLoader();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name.Should().BeEquivalentTo(Component);

        // check Image
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Click();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name.Should().BeEquivalentTo("Image");
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo("Image");
        Image imageOptions = Context.Pages.Editor.RightHandPanel.ImageElementOptions;
        imageOptions.IsAddButtonEnabled().Should().BeTrue();
        imageOptions.ImagePathInput.GetAttribute("placeholder").Should().BeEquivalentTo("Specify the path to the image");

        // check Link
        Context.Pages.Editor.CurrentPage.GetRenderingByName(Component).LinkField.Click();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name.Should().BeEquivalentTo("Link");
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo("Link");
        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.LinkType.Exists().Should().BeTrue();
        linkOptions.SelectedLinkType.Should().Contain("Internal");
        linkOptions.IsOpenInNewWindowChecked().Should().BeFalse();
        linkOptions.ClearLinkValueButton.Displayed.Should().BeTrue();
    }

    [Test]
    public void CheckDetailsOfPlaceholder()
    {
        CanvasPlaceholder emptyPlaceholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0];
        Point dropLocation = emptyPlaceholder.DropLocation;

        // check highlight on hover
        emptyPlaceholder.Container.Hover();
        emptyPlaceholder.IsValidFrameRectangle(Context.Pages.Editor.CurrentPage.GetHoveredFrame().Rectangle)
            .Should().BeTrue($"Placeholder 'Main' is not highlighted or highlight border is not in place");
        Context.Pages.Editor.CurrentPage.GetHoveredFrame().ChipTitle.Should().Be("Main");

        Context.Pages.Editor.LeftHandPanel.OpenComponentsTab().GetPageContentComponent("Title").DragToPoint(dropLocation);
        Context.Browser.GetDriver().WaitForDotsLoader();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.NavigateUp();

        // check placeholder details
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo("Main");
        Context.Pages.Editor.RightHandPanel.PlaceholderDetails.PlaceholderKey.Should().BeEquivalentTo("headless-main");
    }
}
