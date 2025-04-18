// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates;

public class EditPartialDesigns : BaseFixture
{
    private string _partialDesignName;
    private string _partialDesignId = string.Empty;

    [OneTimeSetUp]
    public void OpenPartialDesigns()
    {
        Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
        Context.Pages.TopBar.AppNavigation.OpenTemplates();
        Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPartialDesigns();
    }

    [SetUp]
    public void CreatePartialDesignItemAndOpenPage()
    {
        // Create partial design item
        _partialDesignName = "Partial Design A"+ DataHelper.RandomString();
        _partialDesignId = Preconditions.CreatePartialDesign(_partialDesignName).itemId;

        if (Context.Browser.PageUrl.Contains("/editpartialdesign?"))
        {
            Context.Pages.EditPartialDesign.Close();
        }

        if (Context.Pages.PageTemplates.TimedNotificationExists())
        {
            Context.Pages.PageTemplates.TimedNotification.Close();
        }

        Context.Pages.PartialDesigns.CardContainer
            .SelectSharedSiteTab()
            .SelectCurrentSiteTab(); //Refreshing context to bring new items to view
        Context.Pages.PartialDesigns.CardContainer.GetItemCardByName(_partialDesignName).Edit();
        Context.Pages.EditPartialDesign.WaitForNewPageInCanvasLoaded();
    }

    [OneTimeTearDown]
    public void CloseEditPartialDesignView()
    {
        if (Context.Browser.PageUrl.Contains("/editpartialdesign?"))
        {
            Context.Pages.Editor.Open(site: Constants.SXAHeadlessSite);
        }
    }

    [Test]
    public void OpenPartialDesignEditorInPages()
    {
        CheckPartialDesignEditorOpenedForItem();
        Context.Pages.EditPartialDesign.Close();
    }

    [Test]
    public void EditNewPartialDesign_DragAndDropComponent()
    {
        string componentName = "Title";
        CheckPartialDesignEditorOpenedForItem();

        // Add component to placeholder
        Point placeholder = Context.Pages.EditPartialDesign.CurrentPage.EmptyPlaceholders[0].DropLocation;
        ComponentGallery componentsGallery = Context.Pages.Editor.LeftHandPanel.ComponentGallery;
        IWebElement title = componentsGallery.GetPageContentComponent(componentName);
        title.DragToPoint(placeholder);
        Context.Pages.EditPartialDesign.WaitForNewPageInCanvasLoaded();

        Context.Pages.EditPartialDesign.CurrentPage.GetRenderingByName(componentName).Select();
        Context.Pages.EditPartialDesign.RightHandPanel.HeaderText.Should().Be(componentName);

        // Check undo/redo
        Context.Pages.EditPartialDesign.EditorHeader.IsUndoActive().Should().BeTrue();
        Context.Pages.EditPartialDesign.EditorHeader.Undo();
        Context.Pages.EditPartialDesign.EditorHeader.IsRedoActive().Should().BeTrue();
        Context.Pages.EditPartialDesign.EditorHeader.Redo();

        Context.Pages.EditPartialDesign.Close();
        Context.Pages.PartialDesigns.IsOpened().Should().BeTrue();

        Context.Pages.PartialDesigns.CardContainer.GetItemCardByName(_partialDesignName).Edit();
        Context.Pages.EditPartialDesign.WaitForNewPageInCanvasLoaded();

        Context.Pages.Editor.CurrentPage.GetRenderingByName(componentName).Select();
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().Be(componentName);

        // Check preview
        Context.Pages.EditPartialDesign.OpenPreview();
        Context.Browser.SwitchToTab("sc_horizon=preview");
        Context.Browser.PageUrl.Replace("-", "").Should().Contain($"sc_itemid={_partialDesignId}");
        Context.Pages.Preview.HeaderText.Should().BeEquivalentTo("Title field");
        CloseExtraTabsAndSwitchToPages();
        Context.Pages.EditPartialDesign.Close();
    }

    [Test]
    public void EditNewPartialDesign_InlineAddComponent()
    {
        string componentName = "Title";

        CheckPartialDesignEditorOpenedForItem();

        // Add Title component through inline add
        var placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0];
        placeholder.AddComponentButton.Click();
        Context.Pages.EditPartialDesign.ComponentGalleryDialogPanel.ComponentsGallery.SelectComponentThumbnail(componentName);
        Context.Pages.EditPartialDesign.WaitForNewPageInCanvasLoaded();


        Context.Pages.EditPartialDesign.CurrentPage.GetRenderingByName(componentName).Select();
        Context.Pages.EditPartialDesign.RightHandPanel.HeaderText.Should().Be(componentName);

        // Check undo/redo
        Context.Pages.EditPartialDesign.EditorHeader.IsUndoActive().Should().BeTrue();
        Context.Pages.EditPartialDesign.EditorHeader.Undo();
        Context.Pages.EditPartialDesign.EditorHeader.IsRedoActive().Should().BeTrue();
        Context.Pages.EditPartialDesign.EditorHeader.Redo();

        Context.Pages.EditPartialDesign.Close();
        Context.Pages.PartialDesigns.IsOpened().Should().BeTrue();

        Context.Pages.PartialDesigns.CardContainer.GetItemCardByName(_partialDesignName).Edit();
        Context.Pages.EditPartialDesign.WaitForNewPageInCanvasLoaded();

        Context.Pages.EditPartialDesign.CurrentPage.GetRenderingByName(componentName).Select();
        Context.Pages.EditPartialDesign.RightHandPanel.HeaderText.Should().Be(componentName);

        // Check preview
        Context.Pages.EditPartialDesign.OpenPreview();
        Context.Browser.SwitchToTab("sc_horizon=preview");
        Context.Browser.PageUrl.Replace("-", "").Should().Contain($"sc_itemid={_partialDesignId}");
        Context.Pages.Preview.HeaderText.Should().BeEquivalentTo("Title field");
        CloseExtraTabsAndSwitchToPages();
        Context.Pages.EditPartialDesign.Close();
    }

    private void CheckPartialDesignEditorOpenedForItem()
    {
        Context.Pages.EditPartialDesign.IsOpened().Should().BeTrue();
        string itemIdAsString = Context.Pages.EditPartialDesign.UrlQueryStrings["sc_itemid"].Replace("-", string.Empty);
        itemIdAsString.Should().BeEquivalentTo(_partialDesignId);
    }
}
