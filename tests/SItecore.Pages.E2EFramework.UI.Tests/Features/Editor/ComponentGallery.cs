// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor;

public class ComponentGallery : BaseFixture
{
    [SetUp]
    public void SelectSXASite()
    {
        Preconditions.CreateAndOpenPage();
    }

    [TearDown]
    public void UpdateFieldsToDefaultValues()
    {
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(DefaultScData.MainPlaceholderItemId, "Allowed Controls", "");
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(DefaultScData.MainPlaceholderItemId, "Editable", "1");
    }

    [TestCase("tab")]
    [TestCase("inline")]
    public void CheckComponentsGallery(string location)
    {
        List<AngularAccordion> componentsGroups = new();
        switch (location)
        {
            case "tab":
                componentsGroups = Context.Pages.Editor.LeftHandPanel.OpenComponentsTab().ComponentGroups.ToList();
                break;
            case "inline":
                CanvasPlaceholder placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0];
                placeholder.AddComponentButton.Click();

                componentsGroups = Context.Pages.Editor.ComponentGalleryDialogPanel.ComponentsGallery.ComponentGroups.ToList();
                break;
        }

        componentsGroups.Count.Should().Be(5);

        AngularAccordion mediaComponents = componentsGroups.Find(i => i.Name == "Media");
        mediaComponents.Should().NotBeNull();
        List<IWebElement> mediaComponentsCards = mediaComponents.ComponentCards.ToList();
        mediaComponentsCards.Count.Should().Be(1);
        mediaComponentsCards.First().Text.Should().BeEquivalentTo("Image");

        AngularAccordion navigationComponents = componentsGroups.Find(i => i.Name == "Navigation");
        navigationComponents.Should().NotBeNull();
        List<IWebElement> navigationComponentsCards = navigationComponents.ComponentCards.ToList();
        navigationComponentsCards.Count.Should().Be(2);
        navigationComponentsCards.Find(i => i.Text == "Link List").Should().NotBeNull();
        navigationComponentsCards.Find(i => i.Text == "Navigation").Should().NotBeNull();

        AngularAccordion pageContentComponents = componentsGroups.Find(i => i.Name == "Page Content");
        pageContentComponents.Should().NotBeNull();
        List<IWebElement> pageContentComponentsCards = pageContentComponents.ComponentCards.ToList();
        pageContentComponentsCards.Count.Should().Be(4);
        pageContentComponentsCards.Find(i => i.Text == "Page Content").Should().NotBeNull();
        pageContentComponentsCards.Find(i => i.Text == "Promo").Should().NotBeNull();
        pageContentComponentsCards.Find(i => i.Text == "Rich Text").Should().NotBeNull();
        pageContentComponentsCards.Find(i => i.Text == "Title").Should().NotBeNull();

        AngularAccordion pageStructureComponents = componentsGroups.Find(i => i.Name == "Page Structure");
        pageStructureComponents.Should().NotBeNull();
        List<IWebElement> pageStructureComponentsCards = pageStructureComponents.ComponentCards.ToList();
        pageStructureComponentsCards.Count.Should().Be(3);
        pageStructureComponentsCards.Find(i => i.Text == "Column Splitter").Should().NotBeNull();
        pageStructureComponentsCards.Find(i => i.Text == "Container").Should().NotBeNull();
        pageStructureComponentsCards.Find(i => i.Text == "Row Splitter").Should().NotBeNull();

        if (location == "inline")
        {
            Context.Pages.Editor.ComponentGalleryDialogPanel.Close();
        }
    }

    [TestCase("tab")]
    [TestCase("inline")]
    public void CheckComponents_AllowedControlsEdited(string location)
    {
        // Edit Allowed Controls to be Allow Rich Text only
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(DefaultScData.MainPlaceholderItemId, "Allowed Controls", DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText));
        Context.Browser.Refresh();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        List<AngularAccordion> componentsGroups = new();
        switch (location)
        {
            case "tab":
                componentsGroups = Context.Pages.Editor.LeftHandPanel.OpenComponentsTab().ComponentGroups.ToList();
                break;
            case "inline":
                CanvasPlaceholder placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0];
                placeholder.AddComponentButton.Click();

                componentsGroups = Context.Pages.Editor.ComponentGalleryDialogPanel.ComponentsGallery.ComponentGroups.ToList();
                break;
        }

        componentsGroups.Count.Should().Be(1);
        componentsGroups.First().Name.Should().BeEquivalentTo("Page Content");

        List<IWebElement> availableComponents = componentsGroups.First().ComponentCards.ToList();
        availableComponents.Count.Should().Be(1);
        availableComponents.First().Text.Should().BeEquivalentTo("Rich Text");

        if (location == "inline")
        {
            Context.Pages.Editor.ComponentGalleryDialogPanel.Close();
        }
    }

    [Test]
    public void CheckComponents_PlaceholderNotEditable()
    {
        // Edit Allowed Controls to be Allow Rich Text only
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(DefaultScData.MainPlaceholderItemId, "Editable", "");
        Context.Browser.Refresh();

        List<AngularAccordion> componentsGroups = Context.Pages.Editor.LeftHandPanel.OpenComponentsTab().ComponentGroups.ToList();
        componentsGroups.Count.Should().Be(0);
    }
}
