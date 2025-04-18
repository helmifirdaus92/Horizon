// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Personalization;

public class PersonalizationWithPos : BaseFixture
{
    private Item _site;

    [OneTimeSetUp]
    public void GetSiteData()
    {
        _site = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.SxaHeadlessSiteSettingsSiteGroupingPath);
    }

    [TearDown]
    public void ResetDefaultPosForSite()
    {
        Dictionary<string, string> posValues = new()
        {
            {
                "*", "SXAHeadlessSiteEN"
            }
        };

        SetPosValues(posValues);
    }

    [Test]
    public void PersonalizationTabRespectsPosSettings()
    {
        SetPosValues(null);
        Context.Pages.Editor.Open(site: Constants.SXAHeadlessSite);

        // Open Personalization tab
        Context.Pages.TopBar.AppNavigation.OpenPersonalizationPanel();
        Context.Pages.TopBar.AppNavigation.PersonalizationTabIsSelected.Should().BeTrue();

        CheckNoPosInPages();

        // Set POS value for en language
        var pos = new Dictionary<string, string>()
        {
            {
                "en", "SXAHeadlessSiteEN"
            }
        };
        SetPosValues(pos);
        Context.Browser.GetDriver().Navigate().Refresh();

        Context.Pages.TopBar.AppNavigation.PersonalizationTabIsSelected.Should().BeTrue();
        var a = Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.GetListOfVariants();
        a.Should().Contain("Visitor from Copenhagen");
        Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.SelectedVariantName.Should().Be("Default");

        // Select Danish language
        Context.Pages.TopBar.SelectLanguage("Danish");
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        CheckNoPosInPages();

        // Select English language
        Context.Pages.TopBar.SelectLanguage("English");
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        Context.Pages.TopBar.AppNavigation.PersonalizationTabIsSelected.Should().BeTrue();
        Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.SelectedVariantName.Should().Be("Default");
    }

    private void SetPosValues(Dictionary<string, string> posValues)
    {
        string value = string.Empty;
        if (posValues != null)
        {
            foreach (var pos in posValues)
            {
                value += pos.Key + "=" + pos.Value + "&";
            }

            value.TrimEnd('&');
        }

        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(_site.itemId, "POS", value);
    }

    private void CheckNoPosInPages()
    {
        Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.NoPosTemplateText.Should().Contain("Personalize not enabled")
            .And.Contain("You need to add an analytics identifier to this site to start personalizing pages");
        Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.SettingsLinkText.Should().Contain("Add analytics identifier");
        Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.SettingsUrl
            .Should().Contain($"analytics-and-personalization?");
    }
}
