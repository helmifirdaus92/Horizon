// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.PageDesigning;

public class DragComponentToOccupiedPlaceholder : BaseFixture
{
    private const string FirstComponent = "Image";
    private const string SecondComponent = "Rich Text";
    private const string PlaceholderName = "main";
    private Item _testPage;

    [SetUp]
    public void CreateTestPageDragAndDropComponent()
    {
        // create page
        _testPage = Preconditions.CreateAndOpenPage();

        // drag-and-drop image to empty placeholder
        Point placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].DropLocation;
        IWebElement image = Context.Pages.Editor.LeftHandPanel.OpenComponentsTab().GetMediaComponent(FirstComponent);
        image.DragToPoint(placeholder);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
    }

    [TearDown]
    public void UpdateFieldsToDefaultValues()
    {
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(DefaultScData.MainPlaceholderItemId, "Editable", "1");
    }

    [TestCase("top")]
    [TestCase("bottom")]
    public void DragAndDropComponentToOutlineToolbarOfRendering(string position)
    {
        //TODO move it to wrappers
        Preconditions.DragAndDropToTheOutlineToolbar(SecondComponent, position, FirstComponent);
        var renderingName = Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name;
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().Be(renderingName);

        List<Rendering> allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        allRenderingsUnderPh.Count.Should().Be(2);
        List<string> renderingsNames = allRenderingsUnderPh.Select(r => r.RenderingName).ToList();

        var oldRenderingIndex = renderingsNames.IndexOf(FirstComponent);
        var newRenderingIndex = renderingsNames.IndexOf(SecondComponent);
        (newRenderingIndex < oldRenderingIndex).Should().Be(position == "top");

        // Undo/redo
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Undo();
        allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        allRenderingsUnderPh.Count.Should().Be(1);
        allRenderingsUnderPh.First().RenderingName.Should().Be(FirstComponent);

        Context.Pages.Editor.EditorHeader.IsRedoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Redo();
        allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        allRenderingsUnderPh.Count.Should().Be(2);
    }

    [Test]
    public void FinalLayoutNotChangedWhenVersionDeleted()
    {
        // Add new version of _testPage
        CreateDialog createDialog = Context.Pages.Editor.EditorHeader.OpenVersions().OpenCreateVersionDialog();
        createDialog.EnterItemName("version 2").ClickCreateButton();
        Context.Pages.Editor.EditorHeader.CloseVersionsList();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        // Drag and drop component on new version
        Preconditions.DragAndDropToTheOutlineToolbar(SecondComponent, "top", FirstComponent);

        // Delete new version
        Context.Pages.Editor.EditorHeader.OpenVersions().OpenContextMenuOnVersion(2).InvokeDelete();
        Context.Pages.Editor.DeleteDialog.ClickDeleteButton();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.EditorHeader.VersionsList.SelectVersion(1,isVersionExpectedInContext:true);

        Context.Pages.Editor.EditorHeader.VersionInfo.Should().BeEquivalentTo("Version 1");
        List<Rendering> allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        allRenderingsUnderPh.Count.Should().Be(1);
        allRenderingsUnderPh.First().RenderingName.Should().Be(FirstComponent);

        string rendering = Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path).ToString();
        rendering.Should().Contain(DefaultScData.RenderingId(DefaultScData.SxaRenderings.Image));
        rendering.Should().NotContain(DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText));
    }

    [Test]
    public void AddRenderingToNotEditablePlaceholderNotAllowed()
    {
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(DefaultScData.MainPlaceholderItemId, "Editable", "");
        Context.Browser.Refresh();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        List<AngularAccordion> componentsGroups = Context.Pages.Editor.LeftHandPanel.OpenComponentsTab().ComponentGroups.ToList();
        componentsGroups.Count.Should().Be(0);

        List<Rendering> allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        allRenderingsUnderPh.Count.Should().Be(1);
        allRenderingsUnderPh.First().RenderingName.Should().Be(FirstComponent);
    }
}
