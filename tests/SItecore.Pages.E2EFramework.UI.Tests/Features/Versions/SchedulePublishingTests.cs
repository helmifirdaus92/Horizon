// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using FluentAssertions.Execution;
using FluentAssertions.Extensions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Versions;

public class SchedulePublishingTests : BaseFixture
{
    private const string PageName = "page A";
    private const string FormatForDateFromApi = "yyyyMMddTHHmmssZ";

    [Test]
    public void OpenPublishingSettingsForAVersionFromVersionList_SchedulePublishingAvailabilityIsOpened()
    {
        //Open SchedulePublishingAvailability on version
        Context.Pages.Editor.EditorHeader.OpenVersions()
            .OpenContextMenuOnVersion(1)
            .InvokeSchedulePublishingAvailability();
        Context.Pages.Editor.SchedulePublishingAvailability.HeaderText.Should().Be("Schedule publishing availability");

        //Check Default settings for a new page
        CheckDefaultSettingsForPublishingAvailability();
        Context.Pages.Editor.SchedulePublishingAvailability.SetCustomDates("Now", "Today + 1");
        Context.Pages.Editor.SchedulePublishingAvailability.Cancel();

        //Check Default settings for a new page again after cancelling from dialog
        Context.Pages.Editor.EditorHeader.VersionsList
            .OpenContextMenuOnVersion(1)
            .InvokeSchedulePublishingAvailability();
        CheckDefaultSettingsForPublishingAvailability();
        Context.Pages.Editor.SchedulePublishingAvailability.Close();
        Context.Pages.Editor.EditorHeader.CloseVersionsList();
    }

    [TestCase(2, "Today", "Today + 1")]
    [TestCase(3, "Now", "Today")]
    [TestCase(4, "Now", "No end date")]
    [TestCase(5, "Today - 1", "No end date")]
    public void SetPublishingDates_ItemVersionUpdated(int version, string startDate, string endDate)
    {
        //Open SchedulePublishingAvailability on version
        Context.Pages.Editor.EditorHeader.OpenVersions()
            .OpenContextMenuOnVersion(version)
            .InvokeSchedulePublishingAvailability();

        //Update publishing settings for the version
        Context.Pages.Editor.SchedulePublishingAvailability.SetCustomDates(startDate, endDate);
        Context.Pages.Editor.SchedulePublishingAvailability.SaveEnabled.Should().BeTrue();
        Context.Pages.Editor.SchedulePublishingAvailability.Save();
        var dateTimeToMinutesNow = Wrappers.Helpers.TruncatedDateTimeToMinutes();
        bool hasStartDate = Wrappers.Helpers.TryParseDayTime(startDate, out DateTime publishableFrom);
        bool hasEndDate = Wrappers.Helpers.TryParseDayTime(endDate, out DateTime publishableTo);
        Context.Pages.Editor.EditorHeader.VersionsList
            .OpenContextMenuOnVersion(version)
            .InvokeSchedulePublishingAvailability();

        //Fetch publishing settings from BE
        var itemVersionStateNow = Context.ApiHelper.PlatformGraphQlClient.GetItem(Context.TestItems[PageName].path)
            .versions.Find(v => v.version.Equals(version));
        var dialog = Context.Pages.Editor.SchedulePublishingAvailability;


        //Validate publishing settings for the version in UI and also BE
        switch (hasStartDate)
        {
            case true when hasEndDate:
                dialog.GetStartDate().Should().Be(publishableFrom.Date);
                dialog.GetEndDate().Should().Be(publishableTo.Date);
                Wrappers.Helpers.GetDateFromString(itemVersionStateNow.publishableFrom.value, format: FormatForDateFromApi).Date
                    .Should().Be(publishableFrom);
                Wrappers.Helpers.GetDateFromString(itemVersionStateNow.publishableTo.value, format: FormatForDateFromApi).Date
                    .Should().Be(publishableTo);
                break;
            case true:
                dialog.GetStartDate().Should().Be(publishableFrom.Date);
                dialog.IsNoEndDateSelected().Should().BeTrue();
                Wrappers.Helpers.GetDateFromString(itemVersionStateNow.publishableFrom.value, format: FormatForDateFromApi).Date.Should().Be(publishableFrom.Date);
                itemVersionStateNow.publishableTo.value.Should().Be("");
                break;
            default:
            {
                if (hasEndDate)
                {
                    dialog.GetStartDate().Should().BeCloseTo(dateTimeToMinutesNow, 3.Seconds());
                    dialog.GetEndDate().Should().Be(publishableTo.Date);
                }
                else
                {
                    dialog.GetStartDate().Should().BeCloseTo(dateTimeToMinutesNow, 3.Seconds());
                    dialog.IsNoEndDateSelected().Should().BeTrue();
                    dialog.IsCustomEndDateSelected().Should().BeFalse();
                }

                break;
            }
        }
        dialog.Close();
        Context.Pages.Editor.EditorHeader.CloseVersionsList();
    }

    [Test]
    public void SetVersionNotAvailableToPublish_ItemVersionMadeUnavailableToPublish()
    {
        //Open SchedulePublishingAvailability on version
        Context.Pages.Editor.EditorHeader.OpenVersions()
            .OpenContextMenuOnVersion(2)
            .InvokeSchedulePublishingAvailability();

        //Set version to be unavailable for publishing
        Context.Pages.Editor.SchedulePublishingAvailability.SetNotAvailable().Save();
        Context.Pages.Editor.EditorHeader.VersionsList
            .OpenContextMenuOnVersion(2)
            .InvokeSchedulePublishingAvailability();
        var dialog = Context.Pages.Editor.SchedulePublishingAvailability;

        using (new AssertionScope())
        {
            //Check radio buttons reflect non availability of the version for publishing
            dialog.StartNowEnabled().Should().BeFalse();
            dialog.StartCustomEnabled().Should().BeFalse();
            dialog.NoEndDateEnabled().Should().BeFalse();
            dialog.CustomEndDateEnabled().Should().BeFalse();

            //Check Hide version set in BE for the version
            var itemStateNow = Context.ApiHelper.PlatformGraphQlClient.GetItem(Context.TestItems[PageName].path);
            itemStateNow.versions.Find(v => v.version.Equals(2))
                .isPublishable.value.Should().Be("1"); // Value in graphql field '__Hide version': empty for available and '1' for not available
        }
        dialog.Close();
        Context.Pages.Editor.EditorHeader.CloseVersionsList();
    }

    [OneTimeSetUp]
    public void CreatePageWithVersions()
    {
        Preconditions.CreatePage(PageName, doNotDelete: true);
        for (int i = 0; i < 5 - 1; i++)
        {
            Context.TestItems[PageName].AddVersion();
        }
        
        Context.Pages.TopBar.OpenSitesDropdown().SelectSite(Constants.SXAHeadlessSite);
        Context.Pages.TopBar.AppNavigation.OpenEditor();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(PageName);
    }

    [OneTimeTearDown]
    public void CleanUpTestDataAfterAllTests()
    {
        Context.ApiHelper.CleanTestData(keepProtected: false);
        Context.TestItems.Clear(keepProtected: false);
    }

    /*
     * Check Default settings for a new page
     */
    private static void CheckDefaultSettingsForPublishingAvailability()
    {
        using (new AssertionScope())
        {
            Context.Pages.Editor.SchedulePublishingAvailability.IsAvailable().Should().BeTrue();
            Context.Pages.Editor.SchedulePublishingAvailability.IsNotAvailable().Should().BeFalse();
            Context.Pages.Editor.SchedulePublishingAvailability.SaveEnabled.Should().BeFalse();
            Context.Pages.Editor.SchedulePublishingAvailability.CancelEnabled.Should().BeTrue();
        }
    }
}
