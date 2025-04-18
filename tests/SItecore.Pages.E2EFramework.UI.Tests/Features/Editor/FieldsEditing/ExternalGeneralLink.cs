// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel.ElementOptions;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.FieldsEditing;

public class ExternalGeneralLink : BaseFixture
{
    private Item _page;
    private readonly string _linkListName = "Link root";

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
        _page = Preconditions.CreatePage();
        Preconditions.AddComponent(_page.itemId, _page.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.LinkList), _linkListName);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(_page.name);
    }

    [Test]
    public void RemovingAllFieldsWillRemoveTheLinkFromThePageAndShowsWatermark()
    {
        Item linkItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{_page.path}/Data/{_linkListName}/Link 1");
        UpdateLinkFieldForAnItem(linkItem.itemId, "https://www.sitecore.com", "Sitecore", "SitecoreAltText", true);

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        Context.Pages.Editor.RightHandPanel.LinkElementOptions.ClearLinkValueButton.Click();
        Context.Browser.WaitForHorizonIsStable();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Text.Should().BeEquivalentTo("[No text in field]");
        Context.ApiHelper.PlatformGraphQlClient.GetItemFieldValue(linkItem.path, "Link").Should().Be(string.Empty);
    }

    [TestCase("https://www.sitecore.com", true, "Sitecore", "SitecoreAltText")]
    [TestCase("", false, "", "")]
    [TestCase("https://somesite", false, "", "")]
    [TestCase("https://somesite2", true, "somesite2", "")]
    [TestCase("", true, "", "")]
    public void GeneralFieldSectionCorrectlyShowsExistingExternalLinkData(string url, bool openInNewTab, string linkText, string linkTitle)
    {
        Item linkItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{_page.path}/Data/{_linkListName}/Link 1");
        UpdateLinkFieldForAnItem(linkItem.itemId, url, linkText, linkTitle, openInNewTab);

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();

        Context.Browser.WaitForHorizonIsStable();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.LinkUrl.Should().BeEquivalentTo(url);
        linkOptions.LinkText.Should().BeEquivalentTo(linkText);
        linkOptions.LinkTitle.Should().BeEquivalentTo(linkTitle);
        linkOptions.IsOpenInNewWindowChecked().Should().Be(openInNewTab);
    }

    [TestCase("https://www.sitecore.com", true, "Sitecore", "SitecoreAltText")]
    [TestCase("https://somesite", false, "", "")]
    [TestCase("https://somesite2", true, "somesite2", "")]
    [TestCase("", true, "", "")]
    public void ExternalLinkIsSavedToGeneralField(string url, bool openInNewTab, string linkText, string linkTitle)
    {
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        SetupLinkFields(url, linkText, linkTitle, openInNewTab);

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();

        Context.Browser.WaitForHorizonIsStable();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.LinkUrl.Should().BeEquivalentTo(url);
        linkOptions.LinkText.Should().BeEquivalentTo(linkText);
        linkOptions.LinkTitle.Should().BeEquivalentTo(linkTitle);
        linkOptions.IsOpenInNewWindowChecked().Should().Be(openInNewTab);
    }

    [Test]
    public void CheckDefaultValues()
    {
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.SelectedLinkType.Should().Contain("Internal");
        linkOptions.LinkPath.Should().BeEquivalentTo(string.Empty);
        linkOptions.LinkText.Should().BeEquivalentTo(string.Empty);
        linkOptions.LinkTitle.Should().BeEquivalentTo(string.Empty);
        linkOptions.IsOpenInNewWindowChecked().Should().Be(false);
    }

    [Test]
    public void EveryFieldsDataIsSavedWhenFocusMovesToTheCanvas()
    {
        string linkText = "Test link";
        string linkTitle = "Ext Link Test";
        Item linkItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{_page.path}/Data/{_linkListName}/Link 1");

        // Check link text
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        Context.Pages.Editor.RightHandPanel.LinkElementOptions.EnterLinkText(linkText);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.Click();

        Thread.Sleep(1000);

        string linkValue = Context.ApiHelper.PlatformGraphQlClient.GetItemFieldValue(linkItem.path, "Link");
        linkValue.Should().Contain("linktype=\"internal\"");
        linkValue.Should().Contain($"text=\"{linkText}\"");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Text.Should().BeEquivalentTo(linkText);

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        Context.Pages.Editor.RightHandPanel.LinkElementOptions.LinkText.Should().BeEquivalentTo(linkText);

        // Check link text and url
       // Context.Pages.Editor.RightHandPanel.LinkElementOptions.EnterLinkUrl(url);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.Click();

        Thread.Sleep(1000);

        linkValue = Context.ApiHelper.PlatformGraphQlClient.GetItemFieldValue(linkItem.path, "Link");
        linkValue.Should().Contain("linktype=\"internal\"");
        linkValue.Should().Contain($"text=\"{linkText}\"");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Text.Should().BeEquivalentTo(linkText);

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();

        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.LinkText.Should().BeEquivalentTo(linkText);

        // Check link list, url and link title
        linkOptions.EnterLinkTitle(linkTitle);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.Click();

        Thread.Sleep(1000);

        linkValue = Context.ApiHelper.PlatformGraphQlClient.GetItemFieldValue(linkItem.path, "Link");
        linkValue.Should().Contain("linktype=\"internal\"");
        linkValue.Should().Contain($"text=\"{linkText}\"");
        linkValue.Should().Contain($"title=\"{linkTitle}\"");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Text.Should().BeEquivalentTo(linkText);

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();

        linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.LinkText.Should().BeEquivalentTo(linkText);
        linkOptions.LinkTitle.Should().BeEquivalentTo(linkTitle);

        // Check link list, url, link title and open in new page checker
        linkOptions.CheckOpenInNewWindow(true);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.Click();

        Thread.Sleep(1000);

        linkValue = Context.ApiHelper.PlatformGraphQlClient.GetItemFieldValue(linkItem.path, "Link");
        linkValue.Should().Contain("linktype=\"internal\"");
        linkValue.Should().Contain($"text=\"{linkText}\"");
        linkValue.Should().Contain($"title=\"{linkTitle}\"");
        linkValue.Should().Contain("target=\"_blank\"");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Text.Should().BeEquivalentTo(linkText);

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
        linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.LinkText.Should().BeEquivalentTo(linkText);
        linkOptions.LinkTitle.Should().BeEquivalentTo(linkTitle);
        linkOptions.IsOpenInNewWindowChecked().Should().BeTrue();
    }

    private void SetupLinkFields(string url, string linkText = "", string linkTitle = "", bool openInNewTab = false)
    {
        Link linkOptions = Context.Pages.Editor.RightHandPanel.LinkElementOptions;
        linkOptions.SelectLinkType("external");

        linkOptions.EnterLinkText(linkText);
        linkOptions.EnterLinkUrl(url);
        linkOptions.EnterLinkTitle(linkTitle);
        linkOptions.CheckOpenInNewWindow(openInNewTab);
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().LinkField.Click();
    }

    private void UpdateLinkFieldForAnItem(string itemId, string url, string linkText, string linkTitle, bool openInNewType)
    {
        string target = openInNewType ? "_blank" : "";
        string htmlTag = $"<link linktype=\"external\" url=\"{url}\" target=\"{target}\" class=\"css-class\" text=\"{linkText}\" title=\"{linkTitle}\"/>";
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(
            itemId,
            "Link",
            htmlTag);
        Context.Pages.Editor.EditorHeader.ReloadCanvas();
    }
}
