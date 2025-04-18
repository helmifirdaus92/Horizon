// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests.DataModels;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests
{
    public class ConfigureABTestSettingsTests : BaseFixture
    {
        private Item _testPage;
        private string _friendlyId;

        [OneTimeSetUp]
        public void OpenSiteAndCreatePage()
        {
            Preconditions.OpenSXAHeadlessSite();

            // Create test page
            _testPage = Preconditions.CreatePage(doNotDelete: true);

            // Add component to the page
            var presentationDetails = Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));

            string renderingInstanceId = MockDataHelper.ParseInstanceId(presentationDetails);
            _friendlyId = MockDataHelper.ConstructFriendlyId(_testPage.itemId, renderingInstanceId);
        }

        [OneTimeTearDown]
        public void CleanUpLocalStorageAndRefreshTheBrowser()
        {
            Context.Browser.Refresh();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        }

        [TearDown]
        public void CleanUp()
        {
            // remove the entry from local storage
            Context.Browser.ExecuteJavaScript("localStorage.removeItem('mock-flow-definitions');");
        }


        [Test]
        public void RenameExperiment()
        {
            var serDada = CreateSerData_TwoVariants("experiment1", "DRAFT");
            SetLocalStorage(serDada);

            //rename
            var configDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configDialog.EnterExperimentName("some new name");
            configDialog.ExpandAssignTrafficAccordion();
            configDialog.EvenlyDistributeTraffic();
            configDialog.ClickSaveButton();

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetExperimentStatus().Should().Be("DRAFT");
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetExperimentName().Should().Be("some new name");
        }

        [Test]
        public void ConfigureTestGoal_IncreasePageViews()
        {
            var serDada = CreateSerData_Simple("experimentSimple", "DRAFT");
            SetLocalStorage(serDada);

            var configDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configDialog.ExpandSelectPagesAccordion();
            configDialog.PagesTree.GetItemByPath("Home").Select();
            configDialog.PagesTree.GetItemByPath("About").Select();
            configDialog.IsGoalTagPresent("About").Should().BeTrue();
            configDialog.CloseGoalTag("About");
            configDialog.IsGoalTagPresent("About").Should().BeFalse();
            configDialog.ClickSaveButton();
            configDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configDialog.IsGoalTagPresent("Home").Should().BeTrue();
            configDialog.CloseGoalTag("Home");
            configDialog.IsGoalTagPresent("Home").Should().BeFalse();
        }

        [Test]
        public void ConfigureTestGoal_DecreaseBounceRateAndDecreaseExitRate()
        {
            var serDada = CreateSerData_Simple("experimentSimple", "DRAFT");
            SetLocalStorage(serDada);

            var configDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configDialog.CheckDecreaseBounceRate();
            configDialog.DecreaseBounceRate.Checked.Should().BeTrue();
            configDialog.ClickSaveButton();
            configDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configDialog.DecreaseBounceRate.Checked.Should().BeTrue();
            configDialog.CheckDecreaseExitRate();
            configDialog.DecreaseExitRate.Checked.Should().BeTrue();
            configDialog.ClickSaveButton();
            configDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configDialog.DecreaseExitRate.Checked.Should().BeTrue();
        }

        [Test]
        public void ConfigureTestGoal_AssignTraffic()
        {
            var serDada = CreateSerData_TwoVariants("experiment2", "DRAFT");
            SetLocalStorage(serDada);

            var configDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configDialog.ExpandAssignTrafficAccordion();
            configDialog.GetTrafficAllocation("Variant C").Should().Be(25);
            configDialog.SetTrafficAllocation("Variant B", 24);

            // check warning
            configDialog.GetTrafficAllocationWarning().Should().Be("Traffic allocation should sum up to 100%. Each split should have at least 1% allocation.");
            configDialog.SetTrafficAllocation("Variant C", 26);
            configDialog.CheckIfTrafficAllocationWarningExists().Should().BeFalse();
            configDialog.EvenlyDistributeTraffic();
            configDialog.GetTrafficAllocation("Rich Text (control)").Should().Be(34);
            configDialog.GetTrafficAllocation("Variant B").Should().Be(33);
            configDialog.GetTrafficAllocation("Variant C").Should().Be(33);
            configDialog.CollapseAssignTrafficAccordion();
            configDialog.GetAssignTrafficSummary()
                .Should().Contain("Rich Text (control): 34%")
                .And.Contain("Variant B: 33%")
                .And.Contain("Variant C: 33%");
        }

        [Test]
        public void OptionalConfiguration_AutomatedActions()
        {
            string AssignAllTrafficBackToTheControl = "Assign all traffic back to the control";
            string AssignAllTheTrafficBackToTheСontrolVariant = "Assign all the traffic back to the control variant";

            var serDada = CreateSerData_Simple("experimentSimple", "DRAFT");
            SetLocalStorage(serDada);

            var configDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configDialog.ExpandAutomatedActionsAccordion();
            configDialog.SelectIfThereIsAWinningVariant(AssignAllTrafficBackToTheControl);
            configDialog.SelectIfTestIsInconclusive("Assign all the traffic back to the control variant");
            configDialog.ClickSaveButton();
            configDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configDialog.ExpandAutomatedActionsAccordion();
            configDialog.GetSelectedOptionFromIfThereIsAWinningVariantDropList().Should().Be(AssignAllTrafficBackToTheControl);
            configDialog.GetSelectedOptionFromIfTestsIsInconclusiveDropList().Should().Be(AssignAllTheTrafficBackToTheСontrolVariant);
        }

        [Test]
        public void OptionalConfiguration_AdvancedOptions()
        {
            var serDada = CreateSerData_Simple("experimentSimple", "DRAFT");
            SetLocalStorage(serDada);

            var configDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configDialog.ExpandAdvancedOptionsAccordion();

            configDialog.SetTrafficAllocationOfVisitorsThatWillSeeThisTest(50);
            configDialog.SetBaseRate(43.5);
            configDialog.SetMinimumDetectableDifference(27);
            configDialog.SetConfidenceLevel(86);

            configDialog.GetTotal().Should().Be("195");

            configDialog.ClickSaveButton();

            configDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configDialog.ExpandAdvancedOptionsAccordion();

            configDialog.GetTrafficAllocationOfVisitorsThatWillSeeThisTest().Should().Be(50);
            configDialog.GetBaseRate().Should().Be(43.5);
            configDialog.GetMinimumDetectableDifference().Should().Be(27);
            configDialog.GetConfidenceLevel().Should().Be(86);
            Context.Pages.Editor.WaitForCondition(c => configDialog.GetTotal().Length > 1);
            configDialog.GetTotal().Should().Be("195");

            configDialog.ResetToDefault();
            configDialog.GetBaseRate().Should().Be(2);
            configDialog.GetMinimumDetectableDifference().Should().Be(20);
            configDialog.GetConfidenceLevel().Should().Be(95);
            configDialog.GetTotal().Should().Be("21,110");
        }


        private string CreateSerData_TwoVariants(string experimentName, string status)
        {
            return MockDataHelper.CreateAndFillMockFlowDefinitionsJson(
                _friendlyId,
                experimentName,
                Constants.SxaHeadlessSiteSiteGroupingItemId.ToLower(),
                status);
        }

        private string CreateSerData_Simple(string experimentName, string status)
        {
            return MockDataHelper.CreateAndFillSimpleMockFlowDefinitionsJson(
                _friendlyId,
                experimentName,
                Constants.SxaHeadlessSiteSiteGroupingItemId.ToLower(),
                status);
        }

        private void SetLocalStorage(string serData)
        {
            // Add local storage key
            Context.Browser.ExecuteJavaScript($"localStorage.setItem('mock-flow-definitions', JSON.stringify({serData}));");
            Context.Browser.Refresh();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            if (Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name != _testPage.name)
            {
                Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);
            }

            Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").Select();
        }
    }
}
