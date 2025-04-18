// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.PageDesigning;

public class RearrangeComponents : BaseFixture
{
    private const string FirstRendering = "Title";
    private const string SecondRendering = "Rich Text";
    private const string PlaceholderName = "main";

    [SetUp]
    public void OpenTestPage()
    {
        Preconditions.CreateAndOpenPage();

        // drag-and-drop rich text and title to empty placeholder
        Point placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].DropLocation;
        Context.Pages.Editor.LeftHandPanel.OpenComponentsTab().GetPageContentComponent(FirstRendering).DragToPoint(placeholder);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        Preconditions.DragAndDropToTheOutlineToolbar(SecondRendering, "bottom", FirstRendering);
    }

    [Test]
    public void MoveComponentsUsingArrowsInChipTitle()
    {
        // Move first rendering down
        Context.Pages.Editor.CurrentPage.GetRenderingByName(FirstRendering).Select();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.MoveRenderingDown();

        List<Rendering> allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        allRenderingsUnderPh.Count.Should().Be(2);
        List<string> renderingsNames = allRenderingsUnderPh.Select(r => r.RenderingName).ToList();
        renderingsNames.IndexOf(FirstRendering)
            .Should().BeGreaterThan(renderingsNames.IndexOf(SecondRendering));

        // Undo/redo
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Undo();

        allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        renderingsNames = allRenderingsUnderPh.Select(r => r.RenderingName).ToList();
        renderingsNames.IndexOf(FirstRendering)
            .Should().BeLessThan(renderingsNames.IndexOf(SecondRendering));

        Context.Pages.Editor.EditorHeader.IsRedoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Redo();

        allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        renderingsNames = allRenderingsUnderPh.Select(r => r.RenderingName).ToList();
        renderingsNames.IndexOf(FirstRendering)
            .Should().BeGreaterThan(renderingsNames.IndexOf(SecondRendering));

        // Move first rendering up
        Context.Pages.Editor.CurrentPage.GetRenderingByName(FirstRendering).Select();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.MoveRenderingUp();

        allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        renderingsNames = allRenderingsUnderPh.Select(r => r.RenderingName).ToList();
        renderingsNames.IndexOf(FirstRendering)
            .Should().BeLessThan(renderingsNames.IndexOf(SecondRendering));
    }

    [Test]
    public void MoveComponentsUsingDragAndDrop()
    {
        Preconditions.DragAndDropToTheOutlineToolbar("Image", "bottom", FirstRendering);

        IWebElement destinationRenderingControl = Context.Pages.Editor.CurrentPage.GetRenderingByName(FirstRendering).Container;
        destinationRenderingControl.ScrollIntoView();

        Context.Pages.Editor.CurrentPage.GetRenderingByName(SecondRendering).Select();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.GoToParent);
        ChipElement selectedRenderingChip = Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement;

        Context.Browser.GetDriver().DragAndDropElement(selectedRenderingChip.DragVertical, destinationRenderingControl);

        List<Rendering> allRenderingsUnderPh = Context.Pages.Editor.CurrentPage.GetAllRenderingsUnderPlaceholder(PlaceholderName);
        allRenderingsUnderPh.Count.Should().Be(3);
        List<string> renderingsNames = allRenderingsUnderPh.Select(r => r.RenderingName).ToList();
        renderingsNames.IndexOf(SecondRendering)
            .Should().BeLessThan(renderingsNames.IndexOf("Image"));
    }
}
