// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.SiteSwitcher
{
    public class SiteSwitcherTests : BaseFixture
    {
        private const string NonExistItemId = "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF4}";

        static List<string> SiteNames => TestRunSettings.RunTestsEnv.Equals("LocalCM")
            ? Context.ApiHelper.PlatformGraphQlClient.GetSites().Select(s => s.name).ToList()
            : Context.XMAppsApi.GetSites().Select(s => s.displayName != "" ? s.displayName : s.name).ToList();

        [Test]
        public void UserSwitchesSites_SiteNameIsDisplayedOnTopBar()
        {
            // open SXAHeadlessSite
            Preconditions.OpenSXAHeadlessSite();
            Context.Pages.Editor.TopBar.GetSelectedSite().Should().Be(Constants.SXAHeadlessSite);
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be("Home");
            Context.Browser.PageUrl.Should().Contain("sc_lang=en")
                .And.Contain("sc_version=1")
                .And.Contain($"sc_site={Constants.SXAHeadlessSite}");

            // open EmptySite
            Context.Pages.Editor.TopBar.OpenSitesDropdown().SelectSite(site: Constants.EmptySite);
            Context.Pages.Editor.TopBar.GetSelectedSite().Should().Be(Constants.EmptySite);
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be("Home");
            Context.Browser.PageUrl.Should().Contain("sc_lang=en")
                .And.Contain("sc_version=1")
                .And.Contain($"sc_site={Constants.EmptySite}");
        }

        [Test]
        public void SiteSwitcherShows_AllSitesDefined()
        {
            var allSites = Context.Pages.TopBar.OpenSitesDropdown().GetAllSites();

            allSites.Count.Should().Be(SiteNames.Count);
            allSites.Should().Contain(SiteNames);
        }

        [Test]
        public void UserOpenSiteViaURL_SiteSwitcherHasCorrectSite()
        {
            Context.Pages.Editor.Open(site: Constants.EmptySite);
            Context.Pages.Editor.TopBar.GetSelectedSite().Should().Be(Constants.EmptySite);
            Context.Browser.PageUrl.Should().Contain("sc_lang=en")
                .And.Contain("sc_version=1")
                .And.Contain($"sc_site={Constants.EmptySite}");

            Context.Pages.Editor.Open(site: Constants.SXAHeadlessSite);
            Context.Pages.Editor.TopBar.GetSelectedSite().Should().Be(Constants.SXAHeadlessSite);
            Context.Browser.PageUrl.Should().Contain("sc_lang=en")
                .And.Contain("sc_version=1")
                .And.Contain($"sc_site={Constants.SXAHeadlessSite}");
        }

        [Test]
        public void UserOpens_PageWithoutPresentationViaUrl_DefaultSiteIsDisplayed()
        {
            var stdTemplate = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/templates/System/Templates/Standard template");
            var pageWithNoPresentation = Preconditions.CreatePage("PageWithNoPresentation", templateId: stdTemplate.itemId);
            Context.Pages.Editor.Open(pageId: pageWithNoPresentation.itemId, site: Constants.SXAHeadlessSite, waitForCanvasLoad: false, tenantName: Context.TestTenant);

            Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo(Constants.NoHavePermissionToViewTheItem);
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Context.Pages.Editor.TopBar.GetSelectedSite().Should().Be(Constants.SXAHeadlessSite);
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be("Home");
        }

        [Test]
        public void UserRequests_NonExistingPageViaUrl_DefaultSiteIsDisplayed()
        {
            Context.Pages.Editor.Open(NonExistItemId, site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

            Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be("Home");
            Context.Pages.Editor.TopBar.GetSelectedSite().Should().Be(Constants.SXAHeadlessSite);
            Context.Pages.TopBar.GetSelectedLanguage().Should().Be("English");
        }
    }
}
