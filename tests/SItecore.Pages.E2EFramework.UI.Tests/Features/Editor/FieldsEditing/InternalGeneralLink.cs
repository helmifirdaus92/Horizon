// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel.ElementOptions;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.FieldsEditing;

public class InternalGeneralLink : BaseFixture
{
    private Item _pageA;
    private Item _pageB;
    private readonly string _linkListName = "Link root";
    private Item _linkItem;

    [OneTimeSetUp]
    public void OpenSXASite()
    {
        Preconditions.OpenSXAHeadlessSite();
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    [SetUp]
    public void AddPageAndComponent()
    {
        if (Context.Pages.Editor.TopBar.GetSelectedLanguage() != "English")
        {
            Context.Pages.Editor.TopBar.SelectLanguage("English");
        }

        _pageA = Preconditions.CreatePage();
        _pageB = Preconditions.CreatePage();

        Preconditions.AddComponent(_pageA.itemId, _pageA.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.LinkList), _linkListName);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(_pageA.name);

        //Thread.Sleep(1000);
        _linkItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{_pageA.path}/Data/{_linkListName}/Link 1");
    }

    [Test]
    public void UndoRedoOnLinkProperties()
    {
        string path = $"Home/{_pageB.name}";
        string linkText = "Sitecore";
        string linkTitle = "SitecoreAltText";
        string queryString = "sc_lang=da";
        string anchor = "anchor";

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();

        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        //linkOptions.OpenLinkTypeDropList().SelectDropListItem("Internal");
        linkOptions.SelectLinkType("internal");
        linkOptions.EnterLinkText(linkText);

        linkOptions.InvokeInternalLinkDialog().ItemsTree.GetItemByPath(path).Select();
        Context.Pages.Editor.ContentItemDialog.AddLink();

        linkOptions.EnterLinkTitle(linkTitle);
        linkOptions.EnterLinkAnchor(anchor);
        linkOptions.EnterQueryString(queryString);
        linkOptions.CheckOpenInNewWindow(true);
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();

        // Undo\Redo
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Undo(false);
        Context.Pages.Editor.RightHandPanel.LinkElementOptions.IsOpenInNewWindowChecked().Should().BeFalse();

        Context.Pages.Editor.EditorHeader.IsRedoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Redo(false);
        Context.Pages.Editor.RightHandPanel.LinkElementOptions.IsOpenInNewWindowChecked().Should().BeTrue();

        // Check link changed
        string linkValue = _linkItem.GetFieldValue("Link");
        linkValue.Should().Contain("linktype=\"internal\"");
        linkValue.Should().Contain($"text=\"{linkText}\"");
        linkValue.Should().Contain($"anchor=\"{anchor}\"");
        linkValue.Should().Contain($"querystring=\"{queryString}\"");
        linkValue.Should().Contain($"title=\"{linkTitle}\"");

        ContentItemDialog dialog = Context.Pages.Editor.RightHandPanel.LinkElementOptions.InvokeInternalLinkDialog();
        dialog.GetSelectedLanguage().Should().BeEquivalentTo("Danish");
        dialog.Cancel();
    }

    [Test]
    public void CancelLinkPickingInContentItemDialog()
    {
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();

        Context.Pages.Editor.RightHandPanel.LinkElementOptions.SelectLinkType("internal");
        ContentItemDialog internalLinkDialog = Context.Pages.Editor.RightHandPanel.LinkElementOptions.InvokeInternalLinkDialog();
        internalLinkDialog.ItemsTree.GetItemByPath($"Home/{_pageB.name}").Select();
        internalLinkDialog.SelectLanguage("Danish");
        Context.Pages.Editor.ContentItemDialog.Cancel();

        Context.Pages.Editor.EditorHeader.ReloadCanvas();

        _linkItem.GetFieldValue("Link").Should().BeEquivalentTo(string.Empty);
    }

    [Test]
    public void UndoOperationOnPathLeadsToEmptyPath()
    {
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        //linkOptions.OpenLinkTypeDropList().SelectDropListItem("Internal");
        linkOptions.SelectLinkType("internal");

        // Set path
        linkOptions.InvokeInternalLinkDialog().ItemsTree.GetItemByPath($"Home/{_pageB.name}").Select();
        Context.Pages.Editor.ContentItemDialog.AddLink();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.Click();
        string linkValue = _linkItem.GetFieldValue("Link");
        linkValue.Should().NotBeEmpty();

        // Undo
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Undo(true);
        linkValue = _linkItem.GetFieldValue("Link");
        linkValue.Should().BeEmpty();
        Context.Pages.Editor.RightHandPanel.LinkElementOptions.LinkPath.Should().BeNullOrEmpty();
    }

    [Test]
    public void EveryFieldsDataIsSavedWhenFocusMovesToTheCanvas()
    {
        string linkText = "Test link";
        string linkTitle = "Link Title Test";
        string queryString = "sc_lang=da";
        string anchor = "anchor";
        string pageBId = Wrappers.Helpers.ConvertItemIdToGuid(_pageB.itemId);

        // Link type and text
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        Context.Pages.Editor.RightHandPanel.LinkElementOptions.SelectLinkType("internal");
        Context.Pages.Editor.RightHandPanel.LinkElementOptions.EnterLinkText(linkText);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.Click();

        Thread.Sleep(1000);

        string linkValue = _linkItem.GetFieldValue("Link");
        linkValue.Should().Contain("linktype=\"internal\"");
        linkValue.Should().Contain($"text=\"{linkText}\"");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Text.Should().BeEquivalentTo(linkText);
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        Context.Pages.Editor.RightHandPanel.LinkElementOptions.LinkText.Should().BeEquivalentTo(linkText);

        // Set path
        Context.Pages.Editor.RightHandPanel.LinkElementOptions.InvokeInternalLinkDialog().ItemsTree.GetItemByPath($"Home/{_pageB.name}").Select();
        Context.Pages.Editor.ContentItemDialog.AddLink();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.Click();

        linkValue = _linkItem.GetFieldValue("Link");
        linkValue.Should().Contain("linktype=\"internal\"");
        linkValue.Should().Contain($"text=\"{linkText}\"");
        linkValue.Should().Contain($"id=\"{pageBId}\"");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.LinkPath.Should().BeEquivalentTo(_pageB.path);

        // Set link title
        linkOptions.EnterLinkTitle(linkTitle);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.Click();

        Thread.Sleep(1000);

        linkValue = _linkItem.GetFieldValue("Link");
        linkValue.Should().Contain("linktype=\"internal\"");
        linkValue.Should().Contain($"text=\"{linkText}\"");
        linkValue.Should().Contain($"id=\"{pageBId}\"");
        linkValue.Should().Contain($"title=\"{linkTitle}\"");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();

        linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.LinkTitle.Should().BeEquivalentTo(linkTitle);

        // Set query string
        linkOptions.EnterQueryString(queryString);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.Click();

        Thread.Sleep(1000);

        linkValue = _linkItem.GetFieldValue("Link");
        linkValue.Should().Contain("linktype=\"internal\"");
        linkValue.Should().Contain($"text=\"{linkText}\"");
        linkValue.Should().Contain($"id=\"{pageBId}\"");
        linkValue.Should().Contain($"title=\"{linkTitle}\"");
        linkValue.Should().Contain($"querystring=\"{queryString}\"");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();

        // Set anchor
        linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.EnterLinkAnchor(anchor);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.Click();

        Thread.Sleep(1000);

        linkValue = _linkItem.GetFieldValue("Link");
        linkValue.Should().Contain("linktype=\"internal\"");
        linkValue.Should().Contain($"text=\"{linkText}\"");
        linkValue.Should().Contain($"id=\"{pageBId}\"");
        linkValue.Should().Contain($"title=\"{linkTitle}\"");
        linkValue.Should().Contain($"querystring=\"{queryString}\"");
        linkValue.Should().Contain($"anchor=\"{anchor}\"");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();

        // Check open in new tab
        linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.CheckOpenInNewWindow(true);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.Click();

        Thread.Sleep(1000);

        linkValue = _linkItem.GetFieldValue("Link");
        linkValue.Should().Contain("linktype=\"internal\"");
        linkValue.Should().Contain($"text=\"{linkText}\"");
        linkValue.Should().Contain($"id=\"{pageBId}\"");
        linkValue.Should().Contain($"title=\"{linkTitle}\"");
        linkValue.Should().Contain($"querystring=\"{queryString}\"");
        linkValue.Should().Contain($"anchor=\"{anchor}\"");
        linkValue.Should().Contain("target=\"_blank\"");
    }

    [Test]
    public void ContentTreeInInternalLinkDialogHasItemsAtTheHomeLevel()
    {
        Item anotherHome = Preconditions.CreatePage(parentId: Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.SXAHeadlessSiteContentPath).itemId);

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.SelectLinkType("internal");

        ContentItemDialog dialog = linkOptions.InvokeInternalLinkDialog();
        dialog.ItemsTree.GetAllVisibleItems().First(item => item.Name.Contains(anotherHome.name));
        dialog.Close();
    }

    [Test]
    public void SearchSiteInInternalLinkDialog()
    {
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.SelectLinkType("internal");
        ContentItemDialog dialog = linkOptions.InvokeInternalLinkDialog();
        var dropdown = dialog.OpenSitesDropdown();

        List<string> siteNames = TestRunSettings.RunTestsEnv.Equals("LocalCM")
            ? Context.ApiHelper.PlatformGraphQlClient.GetSites().Select(s => s.name).ToList()
            : Context.XMAppsApi.GetSites().Select(s => s.displayName != "" ? s.displayName : s.name).ToList();

        Random rnd = new();
        string randomSite = siteNames[rnd.Next(siteNames.Count)];
        List<string> foundSites = dropdown.SearchSite(randomSite);
        dropdown.CloseSitesDropdown();
        dialog.Close();

        List<string> sites = siteNames.FindAll(s => s.ToLower().Contains(randomSite.ToLower()));

        foundSites.Count.Should().Be(sites.Count);
        foundSites.Should().BeEquivalentTo(sites);
    }

    [Test]
    public void SearchNonExistingInInternalLinkDialog()
    {
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.SelectLinkType("internal");
        ContentItemDialog dialog = linkOptions.InvokeInternalLinkDialog();
        var dropdown = dialog.OpenSitesDropdown();

        List<string> foundSites = dropdown.SearchSite("nonexisting");

        dropdown.CloseSitesDropdown();
        dialog.Close();

        foundSites.Count.Should().Be(0);
    }
}
