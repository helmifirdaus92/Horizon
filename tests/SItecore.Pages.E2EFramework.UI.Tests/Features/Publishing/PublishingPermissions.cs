// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Publishing;

public class PublishingPermissions : BaseFixture
{
    private Item TestPage;
    string TestPageWithLanguageVersions = "TestPageWithLanguageVersions";
    string PageWithMultipleVersions = "PageWithMultipleVersions";

    /*
     * Add language as a one time setup and open the context site, SXAHeadlessSite
     */
    [OneTimeSetUp]
    public void AddDanishLanguageBeforeTests()
    {
        Preconditions.OpenSXAHeadlessSite();
    }

    /*
     * Create a test page for each scenarios and set final workflow state.
     * Ensure default language selected at the beginning of the test.
     */
    [SetUp]
    public void CreateTestData()
    {
        Preconditions.SelectPageByNameFromSiteTree("Home");
        TestPage = Preconditions.CreatePage(displayName: "TestPage");
        TestPage.SetWorkflowState(WorkflowInfo.SampleWorkflow.WorkflowStateApproved);
        if (Context.Browser.Queries.Get("sc_lang") != "en")
        {
            Context.Pages.Editor.TopBar.SelectLanguage("English");
        }
    }

    /*
     * Check publishing restriction with __Never publish field
     * __Never publish takes value '1' for true.
     */
    [Test]
    public void NonPublishablePage_PublishButtonIsDisabled()
    {
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(TestPage.itemId, "__Never publish", "1");
        Preconditions.OpenPageInSiteTree(TestPage.displayName);

        Context.Pages.TopBar.WorkflowBar.PublishButton.IsDisabled.Should().BeTrue();
        Context.Pages.TopBar.WorkflowBar.PublishButton.Container.Hover();
        Context.Pages.TopBar.WorkflowBar.PublishButton.OverlayInfoText
            .Should().BeEquivalentTo("Publishing settings for the selected page prohibit you from publishing now");
    }

    /*
     * Check publishing restriction with __Publish field.
     * For publishing date set to 1 day before the date of execution
     */
    [Test]
    public void ItemHasPositivePublishingRestrictions_PublishButtonIsEnabled()
    {
        var formattedDate = Wrappers.Helpers.GetFormattedDateString(DateTime.Now.AddDays(-1));
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(TestPage.itemId, "__Publish", formattedDate);
        Preconditions.OpenPageInSiteTree(TestPage.displayName);

        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.IsDisabled.Should().BeFalse();
    }

    /*
     * Check publishing restriction with __Publish field.
     * For publishing date set to 1 day after the date of execution
     */
    [Test]
    public void ItemHasNegativePublishingRestrictions_PublishButtonIsDisabled()
    {
        var formattedDate = Wrappers.Helpers.GetFormattedDateString(DateTime.Now.AddDays(1));
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(TestPage.itemId, "__Publish", formattedDate);
        Preconditions.OpenPageInSiteTree(TestPage.displayName);

        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.IsDisabled.Should().BeTrue();
        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.Container.Hover();
        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.OverlayInfoText
            .Should().BeEquivalentTo("Publishing settings for the selected page prohibit you from publishing now");
    }


    /*
     * Check publishing restriction with __Valid from field for different versions.
     * This field is not shared between versions and thus can hold different restriction on each versions.
     */
    [Test]
    public void ItemVersionHasPublishingRestrictions_PublishButtonIsEnabledAccordingly()
    {
        Preconditions.CreatePage(name: TestPageWithLanguageVersions);
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(Context.TestItems[TestPageWithLanguageVersions].itemId, "__Workflow State", WorkflowInfo.SampleWorkflow.WorkflowStateApproved);
        Context.TestItems[TestPageWithLanguageVersions].AddVersion(language: "da");
        var positivePublishingDate = Wrappers.Helpers.GetFormattedDateString(DateTime.Now.AddDays(-1));
        var negativePublishingDate = Wrappers.Helpers.GetFormattedDateString(DateTime.Now.AddDays(1));
        Context.ApiHelper.PlatformGraphQlClient
            .UpdateItemField(Context.TestItems[TestPageWithLanguageVersions].itemId, "__Valid from", positivePublishingDate, language: "en");
        Context.ApiHelper.PlatformGraphQlClient
            .UpdateItemField(Context.TestItems[TestPageWithLanguageVersions].itemId, "__Valid from", negativePublishingDate, language: "da");
        Preconditions.OpenPageInSiteTree(Context.TestItems[TestPageWithLanguageVersions].name);

        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.IsDisabled.Should().BeFalse();
        Context.Pages.Editor.TopBar.SelectLanguage("Danish");

        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.IsDisabled.Should().BeTrue();
        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.Container.Hover();
        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.OverlayInfoText
            .Should().BeEquivalentTo("Publishing settings for the selected page prohibit you from publishing now");
    }

    [Test]
    public void ItemWithMultipleVersions_PublishingInformationDisplayed()
    {
        Preconditions.CreatePage(PageWithMultipleVersions);
        for (int i = 1; i < 2; i++)
        {
            Context.TestItems[PageWithMultipleVersions].AddVersion();
        }

        /*
         * Update version 1 as:
         * | publishableFrom | publishableTo |
         * | Today + 10      | None          |
         */

        var publishableFrom = Wrappers.Helpers.GetFormattedDateString(DateTime.Now.AddDays(10));
        Context.ApiHelper.PlatformGraphQlClient
            .UpdateItemField(Context.TestItems[PageWithMultipleVersions].itemId, "__Workflow State", WorkflowInfo.SampleWorkflow.WorkflowStateApproved, version: 1);
        Context.ApiHelper.PlatformGraphQlClient
            .UpdateItemField(Context.TestItems[PageWithMultipleVersions].itemId, "__Valid from", publishableFrom, version: 1);

        /*
         * Update version 2 as unpublishable
         * Make a version unpublishable with field "__Hide version". "__Never publish" is shared among versions.
         */
        Context.ApiHelper.PlatformGraphQlClient
            .UpdateItemField(Context.TestItems[PageWithMultipleVersions].itemId, "__Workflow State", WorkflowInfo.SampleWorkflow.WorkflowStateApproved, version: 2);
        Context.ApiHelper.PlatformGraphQlClient
            .UpdateItemField(Context.TestItems[PageWithMultipleVersions].itemId, "__Hide version", "1", version: 2);
        Preconditions.OpenPageInSiteTree(Context.TestItems[PageWithMultipleVersions].name);

        /*
         * No version is publishable.
         */
        Context.Pages.Editor.EditorHeader.VersionInfo.Should().Contain("Version 2");
        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.IsDisabled.Should().BeTrue();
        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.Container.Hover();
        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.OverlayInfoText
            .Should().BeEquivalentTo("Publishing settings for the selected page prohibit you from publishing now");

        /*
         * Make version 1 publishable
         * And reselect item from tree to fetch updated page information
         */
        publishableFrom = Wrappers.Helpers.GetFormattedDateString(DateTime.Now.AddDays(-5));
        Context.ApiHelper.PlatformGraphQlClient
            .UpdateItemField(Context.TestItems[PageWithMultipleVersions].itemId, "__Valid from", publishableFrom, version: 1);
        Context.Pages.Editor.LeftHandPanel.SelectPage("Home");
        Context.Pages.Editor.LeftHandPanel.SelectPage(Context.TestItems[PageWithMultipleVersions].name);

        /*
         * Latest publishable version should be resolved in context, version 1.
         */
        Context.Pages.Editor.EditorHeader.VersionInfo.Should().Contain("Version 1");
        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.IsDisabled.Should().BeFalse();

        /*
         * Switch to version 2
         */
        Context.Pages.Editor.EditorHeader.OpenVersions().SelectVersion(2);
        Context.Pages.Editor.EditorHeader.VersionInfo.Should().Contain("Version 2");
        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.IsDisabled.Should().BeTrue();
        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.Container.Hover();
        Context.Pages.Editor.TopBar.WorkflowBar.PublishButton.OverlayInfoText
            .Should().BeEquivalentTo("The current version is not the latest publishable version of the page. Select Version 1 - to publish the page.");
    }
}
