// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Xml.Linq;
using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.LHSPanel;

public class CreatePage : BaseFixture
{
    private readonly string _insertOptionsFieldName = "__masters";

    [OneTimeSetUp]
    public void OpenSXASite()
    {
        Preconditions.OpenSXAHeadlessSite();
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    [SetUp]
    public void SelectEnglishLanguageAndHomePage()
    {
        Preconditions.OpenEnglishLanguage();

        if (!Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem.IsSelected)
        {
            Context.Pages.Editor.LeftHandPanel.SelectPage("Home");
        }

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
    }

    [TearDown]
    public void RefreshPage()
    {
        if (TestContext.CurrentContext.Test.Name == "CreatePageWithoutCreateRights_CreateNotAvailable")
        {
            Context.Browser.Refresh();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Context.Pages.Editor.WaitForNotificationToDisappear();
        }
    }

    [TestCase("folder", "loose focus")]
    [TestCase("page", "click Enter")]
    public void CreatePageUsingContextMenu(string parentItem, string confirmingAction)
    {
        Item parent = new();
        switch (parentItem)
        {
            case "page":
                parent = Preconditions.CreatePage();
                break;
            case "folder":
                Context.Browser.Refresh();
                Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

                parent = Preconditions.CreateFolder();
                parent.SetFieldValue(_insertOptionsFieldName, $"{Constants.TemplateFolderId}|{Constants.TemplatePageId}");
                break;
        }

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;
        string childName = $"Child {parent.name}";

        TreeItem parentTreeItem = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(parent.name);
        parentTreeItem.Container.Hover();

        CreateSubPage(parentTreeItem, childName, "Page", confirmingAction);

        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem;
        selectedItem.Name.Should().BeEquivalentTo(childName, "Newly created page must be selected in content tree.");
        selectedItem.Parent.Name.Should().BeEquivalentTo(parent.name);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount + 1);

        Item createdItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{parent.path}/{childName}");
        createdItem.template.templateId.Should().BeEquivalentTo(Constants.TemplatePageId, $"Item template must be same as selected template {Constants.TemplatePageId}");
    }

    [Test]
    public void CreatePageUsingCreatePageButton()
    {
        Item parent = Preconditions.CreatePage();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;
        string childName = $"Child {parent.name}";

        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SelectPage(parent.name);

        CreateSubPage(selectedItem, childName);

        selectedItem = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem;
        selectedItem.Name.Should().BeEquivalentTo(childName, "Newly created page must be selected in content tree.");
        selectedItem.Parent.Name.Should().BeEquivalentTo(parent.name);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount + 1);

        Item createdItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{parent.path}/{childName}");
        createdItem.template.templateId.Should().BeEquivalentTo(Constants.TemplatePageId, $"Item template must be same as selected template {Constants.TemplatePageId}");
    }

    [Test]
    public void CancelPageCreation()
    {
        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;

        SelectTemplateDialog selectTemplateDialog = Context.Pages.Editor.LeftHandPanel.SiteContentTree.InvokeCreatePage();
        selectTemplateDialog.AssignTemplate("Page");

        TreeItem createdPage = Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem.GetChildren().Last();
        createdPage.PressKey("ESC");

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo("Home");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount);
    }

    [TestCase("/*-+!@#$%&*()_.")]
    [TestCase("https://www.google.com.ua")]
    [TestCase("Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text")]
    public void SpecifyInvalidDisplayName_ItemNotCreated(string displayName)
    {
        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;

        CreateSubPage(Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem, displayName);

        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Message.Should().BeEquivalentTo($"'{displayName}' is not a valid name");
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo("Home");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount);
    }

   
    [TestCase("<script>window.location=\"http://google.com\"</script>")]
    [TestCase(" ")]
    public void SpecifyInvalidDisplayName_General_Message_ItemNotCreated(string displayName)
    {
        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;

        CreateSubPage(Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem, displayName);

        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Message.Should().BeOneOf($"'{displayName}' is not a valid name", $"The '{displayName}' page cannot be created");
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo("Home");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount);
    }

    [Test]
    public void SpecifyEmptyDisplayName_ItemNotCreated()
    {
        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;

        SelectTemplateDialog selectTemplateDialog = Context.Pages.Editor.LeftHandPanel.SiteContentTree.InvokeCreatePage();
        selectTemplateDialog.AssignTemplate("Page");

        TreeItem item = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem;
        item.GetTextElement().Clear();

        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Message.Should().BeEquivalentTo("The page name cannot be empty");
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo("Home");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount);
    }

    [Test]
    public void CreatePageWithoutInsertOptionsOnParentItem()
    {
        Item parent = Preconditions.CreateFolder();
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(parent.itemId, _insertOptionsFieldName, $"{Constants.TemplateFolderId}");

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        TreeItem parentTreeItem = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parent.name}");
        parentTreeItem.Container.Hover();

        SelectTemplateDialog selectTemplateDialog = parentTreeItem.InvokeContextMenu().InvokeCreateSubPage();

        selectTemplateDialog.GetEmptyState().WaitForCondition(e => !string.IsNullOrEmpty(e.Text));
        selectTemplateDialog.GetEmptyState().Should().NotBeNull();
        selectTemplateDialog.GetEmptyState().Text.Should().Contain("There are no available page templates", "Expected error notification when no insert option is present");

        selectTemplateDialog.Close();
    }

    [Test]
    public void CreatePageWithoutCreateRights_CreateNotAvailable()
    {
        Item parent = Preconditions.CreatePage();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        Context.ApiHelper.PlatformGraphQlClient.DenyCreateAccess(parent.itemId, TestRunSettings.UserEmail);

        TreeItem parentTreeItem = Context.Pages.Editor.LeftHandPanel.SelectPage(parent.name);
        string childName = $"Child {parent.name}";

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.IsCreatePageButtonEnabled().Should().BeFalse();

        CreateSubPage(parentTreeItem, childName);

        string notification = Context.Pages.Editor.TimedNotification.Message;
        Context.Pages.Editor.WaitForNotificationToDisappear();
        notification.Should().BeEquivalentTo($"The '{childName}' page cannot be created");
    }

    [Test]
    public void CreatePageForSpecificLanguage()
    {
        Item parent = Preconditions.CreatePage();
        string childName = $"Child {parent.name}";

        Context.Pages.Editor.TopBar.SelectLanguage("Danish");

        CreateSubPage(Context.Pages.Editor.LeftHandPanel.SelectPage(parent.name), childName);

        Item createdItemDa = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{parent.path}/{childName}", "da");
        Item createdItemEn = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{parent.path}/{childName}", "en");
        createdItemDa.versions.Count.Should().Be(1);
        createdItemDa.createdAt.Should().NotBeNull();
        createdItemEn.versions.Count.Should().Be(0);
        createdItemEn.createdAt.Should().BeNull();

        Context.Pages.Editor.TopBar.SelectLanguage("English");
        Context.Pages.Editor.TimedNotification.Close();
    }

    [Test]
    public void CreateFewPagesUsingBranchTemplate_PageWithoutPresentationNotAppearInTree()
    {
        Item branchTemplate = Preconditions.CreateItem("TestBranchTemplate", Constants.BranchesTemplateId, Constants.BranchTemplateId);

        var templateWithoutPresentation = Preconditions.CreateTemplate(
            "templateWithoutPresentation",
            Constants.SxaHeadlessSiteTemplatesParentId,
            new List<string>()
            {
                Constants.TemplateId
            });

        Item parent = Preconditions.CreateItem("$name", branchTemplate.itemId, Constants.TemplatePageId);
        Item page1 = Preconditions.CreateItem("page1", parent.itemId, Constants.TemplatePageId);
        Item page11 = Preconditions.CreateItem("page11", page1.itemId, Constants.TemplatePageId);
        Preconditions.CreateItem("page12", page1.itemId, templateWithoutPresentation.itemId);
        Item page2 = Preconditions.CreateItem("page2", parent.itemId, templateWithoutPresentation.itemId);
        Preconditions.CreateItem("page21", page2.itemId, Constants.TemplatePageId);

        Item page = Preconditions.CreatePage();
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(
            page.itemId,
            _insertOptionsFieldName,
            $"{Constants.RedirectItemId}|{Constants.TemplatePageId}|{{{Wrappers.Helpers.ConvertItemIdToGuid(branchTemplate.itemId)}}}");

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SelectPage(page.name);

        string subPageName = new Random().Next(10000, 99999).ToString();
        CreateSubPage(selectedItem, subPageName, branchTemplate.name);

        selectedItem = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem;
        selectedItem.Name.Should().BeEquivalentTo(subPageName);
        List<TreeItem> children = selectedItem.GetChildren().ToList();
        children.Count.Should().Be(1);
        TreeItem child = children.First();
        child.Name.Should().BeEquivalentTo(page1.name);
        child.Expand();
        List<TreeItem> grandChildren = child.GetChildren().ToList();
        grandChildren.Count.Should().Be(1);
        grandChildren.First().Name.Should().BeEquivalentTo(page11.name);
    }

    private void CreateSubPage(TreeItem parentItem, string name, string template = "Page", string confirmingAction = "click Enter")
    {
        SelectTemplateDialog selectTemplateDialog = parentItem.InvokeContextMenu().InvokeCreateSubPage();
        selectTemplateDialog.AssignTemplate(template);

        parentItem.IsExpanded.Should().BeTrue();
        SetDisplayName(name, confirmingAction);
    }

    private void SetDisplayName(string name, string confirmingAction = "click Enter")
    {
        Context.Browser.PressKey(name);

        switch (confirmingAction)
        {
            case "loose focus":
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.LooseFocus();
                break;
            case "click Enter":
                Context.Browser.PressKey(Keys.Enter);
                break;
        }

        Context.Browser.WaitForHorizonIsStable();
    }
}
