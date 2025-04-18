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
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.PageDesigning;

public class DeleteComponent : BaseFixture
{
    private const string Component = "Image";
    private const string PlaceholderName = "main";
    private Item _testPage;

    [SetUp]
    public void CreateAndOpenTestPage()
    {
        _testPage = Preconditions.CreateAndOpenPage();

        // drag-and-drop Image to empty placeholder
        Point placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].DropLocation;
        Context.Pages.Editor.LeftHandPanel.OpenComponentsTab().GetMediaComponent(Component).DragToPoint(placeholder);
        Context.Browser.GetDriver().WaitForDotsLoader();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
    }

    [TearDown]
    public void ResetFieldsToDefaultValue()
    {
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(DefaultScData.MainPlaceholderItemId, "Editable", "1");
    }

    [Test]
    public void DeleteComponentViaChipElementButton()
    {
        Context.Pages.Editor.CurrentPage.GetRenderingByName(Component).Select();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.DeleteElement();

        List<Rendering> allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        allRenderingsUnderPh.Count.Should().Be(0);

        // Undo/redo
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Undo();

        allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        allRenderingsUnderPh.Count.Should().Be(1);

        Context.Pages.Editor.EditorHeader.IsRedoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Redo();

        allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        allRenderingsUnderPh.Count.Should().Be(0);

        var finalLayout = Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path);
        finalLayout.Should().BeNull();
    }

    [Test]
    public void FixChildDeletionLogic_Bug1321()
    {
        //Remove Image component added in setup method
        Context.Pages.Editor.CurrentPage.GetRenderingByName(Component).Select();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.DeleteElement();

        //add 11 containers
        for (int i = 0; i < 11; i++)
        {
            Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Container));
        }

        // add Title component to the container-1
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title), placeholderKey: "/headless-main/container-1");
        // add Rich Text component to the container-11
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText), placeholderKey: "/headless-main/container-11");

        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem.Select();
        Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);

        //navigate to check that Rich Text was added to container-11
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").Select();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.GoToParent);
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.NavigateUp();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name.Should().Be("container-11");

        // navigate and delete container-1
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Title").Select();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.NavigateUp();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name.Should().Be("container-1");
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.NavigateUp();

        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.DeleteElement();

        //check that container-11 still exists with its datasource
        Context.Pages.Editor.CurrentPage.IsRenderingPresentInCanvas("Rich Text").Should().BeTrue();
    }

    [Test]
    public void DeleteComponentViaSendKeys()
    {
        Context.Pages.Editor.CurrentPage.GetRenderingByName(Component).Select();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.DeleteElementViaKey();

        List<Rendering> allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        allRenderingsUnderPh.Count.Should().Be(0);

        var finalLayout = Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path);
        finalLayout.Should().BeNull();
    }

    [Test]
    public void DeleteComponentNotAvailableWhenPlaceholderNotEditable()
    {
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(DefaultScData.MainPlaceholderItemId, "Editable", "");
        Context.Pages.Editor.EditorHeader.ReloadCanvas();

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().Select();

        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.IsDeleteButtonDisplayed().Should().BeFalse();
    }

    [Test]
    public void DeleteComponentNotAvailableWhenUserHasNoRights()
    {
        // Forbid write for test page
        Context.ApiHelper.PlatformGraphQlClient.DenyWriteAccess(_testPage.itemId, TestRunSettings.UserEmail);

        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        Context.Pages.Editor.LeftHandPanel.SelectPage("Home");
        Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);

        Context.Pages.Editor.CurrentPage.isRenderingNotEditable(Component).Should().BeTrue();
    }


    private void AddPageContentComponentToContainer(int containerIndex, string componentText)
    {
        CanvasPlaceholder placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[containerIndex];
        placeholder.AddComponentButton.Hover();
        placeholder.AddComponentButton.Click();

        List<AngularAccordion> componentGroups = Context.Pages.Editor.ComponentGalleryDialogPanel.ComponentsGallery.ComponentGroups.ToList();
        AngularAccordion pageContentComponents = componentGroups.Find(i => i.Name == "Page Content");
        List<IWebElement> componentCards = pageContentComponents.ComponentCards.ToList();
        componentCards.Find(i => i.Text == componentText).Click();
    }
}
