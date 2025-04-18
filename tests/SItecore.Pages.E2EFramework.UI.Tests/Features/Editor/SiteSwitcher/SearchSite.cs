// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.SiteSwitcher;

public class SearchSite : BaseFixture
{
    public SiteSwitcherPopover SitesDropdown;

    static List<string> SiteNames => TestRunSettings.RunTestsEnv.Equals("LocalCM")
        ? Context.ApiHelper.PlatformGraphQlClient.GetSites().Select(s => s.name).ToList()
        : Context.XMAppsApi.GetSites().Select(s => s.displayName != "" ? s.displayName : s.name).ToList();

    [SetUp]
    public void OpenSearchPopover()
    {
        SitesDropdown = Context.Pages.Editor.TopBar.OpenSitesDropdown();
    }

    [Test]
    public void SearchSite_SiteExists()
    {
        // Get random site to search
        Random rnd = new();
        var randomSite = SiteNames[rnd.Next(SiteNames.Count)];

        List<string> foundSites = SitesDropdown.SearchSite(randomSite);

        List<string> sites = SiteNames.FindAll(s => s.ToLower().Contains(randomSite.ToLower()));

        SitesDropdown.CloseSitesDropdown();

        foundSites.Count.Should().Be(sites.Count);
        foundSites.Should().BeEquivalentTo(sites);
    }

    [Test]
    public void SearchNonExistingSite_NoSitesFound()
    {
        List<string> foundSites = SitesDropdown.SearchSite("nonexixting");

        SitesDropdown.CloseSitesDropdown();

        foundSites.Count.Should().Be(0);
    }

    [Test]
    public void SearchResultUpdatedWhileTyping()
    {
        SitesDropdown.SearchInput.SendKeys("s");

        List<string> foundSites = SitesDropdown.GetAllSites();
        List<string> sites = SiteNames.FindAll(s => s.ToLower().Contains("s"));
        foundSites.Count.Should().Be(sites.Count);
        foundSites.Should().BeEquivalentTo(sites);

        SitesDropdown.SearchInput.SendKeys("ite");
        SitesDropdown.SearchInput.Value().Should().BeEquivalentTo("site");

        foundSites = SitesDropdown.GetAllSites();
        sites = SiteNames.FindAll(s => s.ToLower().Contains("site"));

        SitesDropdown.CloseSitesDropdown();

        foundSites.Count.Should().Be(sites.Count);
        foundSites.Should().BeEquivalentTo(sites);
    }
}
