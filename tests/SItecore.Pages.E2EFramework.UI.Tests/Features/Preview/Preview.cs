// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Preview;

public class Preview : BaseFixture
{
    [Test]
    public void PreviewTabShowsPageContextOpenedInPagesTab()
    {
        string finalRenderings = "<r xmlns:p=\"p\" xmlns:s=\"s\" p:p=\"1\"><d id=\"{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}\"><r uid=\"{AE9B2506-3491-4819-B7A1-ADE617DC44E6}\" s:id=\"{3836D951-BB14-43AC-9231-649B7F245DC5}\" s:par=\"GridParameters=%7B7465D855-992E-4DC2-9855-A03250DFA74B%7D&amp;FieldNames=%7BB10CF040-2EA2-49CA-B6DA-41CA8CAFD0C4%7D&amp;Styles&amp;CacheClearingBehavior=Clear%20on%20publish&amp;RenderingIdentifier&amp;CSSStyles&amp;DynamicPlaceholderId=1\" s:ph=\"headless-main\" /></d></r>";

        // crete test page
        Item testPage = Preconditions.CreatePage();

        // add versions
        AddVersionsForItemInLanguage(testPage, "en", 2);
        AddVersionsForItemInLanguage(testPage, "da", 2);

        // update title field for versions
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(
            testPage.itemId,
            "__Final Renderings",
            finalRenderings,
            "en",
            1);
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(testPage.itemId, "Title", "Version1en", "en", 1);

        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(
            testPage.itemId,
            "__Final Renderings",
            finalRenderings,
            "da",
            2);
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(testPage.itemId, "Title", "Version2da", "da", 2);

        // check version 2 for Danish language
        Context.Pages.Editor.Open(testPage.itemId, "da", site: Constants.SXAHeadlessSite, version: "2",tenantName:Context.TestTenant);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.OpenPreview();
        Context.Browser.SwitchToTab("sc_horizon=preview");
        Context.Pages.Preview.IsOpened().Should().BeTrue();
        Context.Pages.Preview.HeaderText.Should().Contain("Version2da");
        Context.Browser.PageUrl.Should().Contain("sc_version=2");
        Context.Browser.PageUrl.Should().Contain("sc_lang=da");
        Context.Browser.GetDriver().CloseCurrentTab();

        // check version 1 for English language
        Context.Pages.Editor.Open(testPage.itemId, "en", site: Constants.SXAHeadlessSite, version: "1",tenantName:Context.TestTenant);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.OpenPreview();
        Context.Browser.SwitchToTab("sc_horizon=preview");
        Context.Pages.Preview.IsOpened().Should().BeTrue();
        Context.Browser.PageUrl.Should().Contain("sc_version=1");
        Context.Browser.PageUrl.Should().Contain("sc_lang=en");
    }

    private void AddVersionsForItemInLanguage(Item item, string language, int totalNoOfVersions)
    {
        int a = Context.ApiHelper.PlatformGraphQlClient.GetItem(item.path, language).versions.Count;
        for (int i = 1; i <= totalNoOfVersions - a; i++)
        {
            Context.ApiHelper.PlatformGraphQlClient.AddItemVersion(item.path, language);
        }
    }
}
