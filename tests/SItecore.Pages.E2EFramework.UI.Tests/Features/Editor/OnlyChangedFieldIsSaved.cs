// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor;

public class OnlyChangedFieldIsSaved : BaseFixture
{
    private IItem _pageA;
    private IItem _pageB;
    private IItem _rteTextItem;

    [OneTimeSetUp]
    public void CreateTestPagesAndAddComponents()
    {
        _pageA = Preconditions.CreatePage("PageA", doNotDelete: true);
        _pageB = Preconditions.CreatePage("PageB", doNotDelete: true);
        Preconditions.AddComponent(_pageA.itemId, _pageA.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title));
        Preconditions.AddComponent(_pageA.itemId, _pageA.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText));
        Preconditions.AddComponent(_pageA.itemId, _pageA.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.PageContent));

        Preconditions.OpenSXAHeadlessSite();
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(_pageA.name).Select();
        _rteTextItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(_pageA.path + "/Data/Text 1");
        _rteTextItem.SetFieldValue("Text", "defaultValue");
    }

    [SetUp]
    public void SetContextToRootItem()
    {
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath("Home").Select();
    }

    [Test]
    [Ignore("https://sitecore.atlassian.net/browse/PGS-3358")]
    public void ChangePageContentAndLeavePageWithDSModifiedByAnotherUser_OnlyPageContentChangeIsSaved()
    {
        _rteTextItem.SetFieldValue("Text", "UpdatedDS");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(_pageB.name).Select();
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "UpdatedTitleB";
        Context.Pages.Editor.LeftHandPanel.SelectPage(_pageA.name);
        _pageB.GetFieldValue("Title").Should().Be("UpdatedTitleB");
        _rteTextItem.GetFieldValue("Text").Should().Be("UpdatedDS");
    }

    [Test]
    public void UndoChangesWithMultipleFields_fieldValuesArePreserved()
    {
        var oldValueInRte = _rteTextItem.GetFieldValue("Text");
        var oldValueInPageB = _pageB.GetFieldValue("Title");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(_pageA.name).Select();
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Title").SingleLineTextField.ClearAndSet("UpdatedTitle2");
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Page Content").RichTextField.Text = "UpdatedPage Content";
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").RichTextField.Text = "Updated RTE Content";
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.EditorHeader.Undo(layoutChange: false);
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Title").SingleLineTextField.Text.Should().Be("UpdatedTitle2");
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Page Content").RichTextField.Text.Should().Be("UpdatedPage Content");
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").RichTextField.Text.Should().Be(oldValueInRte);
        _rteTextItem.GetFieldValue("Text").Should().Contain(oldValueInRte).And.NotContain("Updated RTE Content");
        _pageA.GetFieldValue("Title").Should().Be("UpdatedTitle2");
        _pageA.GetFieldValue("Content").Should().Contain("UpdatedPage Content");
        _pageB.GetFieldValue("Title").Should().Be(oldValueInPageB);
    }
}
