// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Newtonsoft.Json;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests.DataModels;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests
{
    public class AbnTestListTests : BaseFixture
    {
        private Item _testPage;
        private string _friendlyIdRTE;
        private string _friendlyIdImage;

        [OneTimeSetUp]
        public void OpenSiteAndCreatePage()
        {
            Preconditions.OpenSXAHeadlessSite();

            // Create test page
            _testPage = Preconditions.CreatePage(doNotDelete: true);

            // Add component to the page
            var presentationDetailsRTE = Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));
            var presentationDetailsImage = Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.Image));

            string renderingInstanceIdRTE = MockDataHelper.ParseInstanceId(presentationDetailsRTE);
            string renderingInstanceIdImage = MockDataHelper.ParseInstanceId(presentationDetailsImage);
            _friendlyIdRTE = MockDataHelper.ConstructFriendlyId(_testPage.itemId, renderingInstanceIdRTE);
            _friendlyIdImage = MockDataHelper.ConstructFriendlyId(_testPage.itemId, renderingInstanceIdImage);
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
        public void OpenAbnTestList_CheckAppliedConfigurations()
        {
            var serDada = CreateSerData_Simple("experimentSimple", "DRAFT");
            SetLocalStorage(serDada);

            PageAbnTestDetailsDialog abnTestDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree
                .GetItemByPath(_testPage.name).InvokeAbnTestsList();

            AppliedConfigurationsTab appliedConfigs = abnTestDetails.OpenAppliedConfigurationsTab();

            appliedConfigs.GetGoal().Should().Be("Increase page views");
            appliedConfigs.GetTrafficAllocation("Variant B").Should().Be("50%");
            appliedConfigs.GetAutomatedAction("If there is a winning variant").Should().Be("Assign all the traffic to the winning variant");
            appliedConfigs.GetAutomatedAction("If test is inconclusive").Should().Be("Keep running the test");
            appliedConfigs.GetAdvancedOption("Traffic allocation").Should().Be("100%");
            appliedConfigs.GetAdvancedOption("Base rate").Should().Be("2%");
            appliedConfigs.GetAdvancedOption("Minimum detectable difference").Should().Be("20%");
            appliedConfigs.GetAdvancedOption("Confidence level").Should().Be("95%");
            appliedConfigs.GetAdvancedOption("Total").Should().Be("21,110");
        }

        [Test, Category("StagingTests")]
        public void OpenAbnTestList_CheckLinkToXMApps()
        {
            var serDada = CreateSerData_TwoExperiments("experimentSimple1", "experimentSimple2", "DRAFT");
            SetLocalStorage(serDada);

            PageAbnTestDetailsDialog abnTestDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree
                .GetItemByPath(_testPage.name).InvokeAbnTestsList();

            abnTestDetails.ClickAllAbnTestsLink();
            Context.Browser.SwitchToTab("xmapps");
            Context.Browser.WaitForProgressBarToDisappear();
            Context.Browser.PageUrl.Should().Contain(Context.SiteCollection.id);
            Context.Browser.PageUrl.Should().Contain(Context.TestTenant);
        }

        [Test]
        public void OpenAbnTestList_CheckList()
        {
            var serDada = CreateSerData_TwoExperiments("experimentSimple1", "experimentSimple2", "DRAFT");
            SetLocalStorage(serDada);

            PageAbnTestDetailsDialog abnTestDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree
                .GetItemByPath(_testPage.name).InvokeAbnTestsList();

            abnTestDetails.GetAbnTestList().Count.Should().Be(2);
            abnTestDetails.GetTestStatusFromTheList("experimentSimple2").Should().Be("DRAFT");
        }

        [Test]
        public void OpenAbnTestList_GoToTest()
        {
            var serDada = CreateSerData_TwoExperiments("experimentSimple1", "experimentSimple2", "DRAFT");
            SetLocalStorage(serDada);

            PageAbnTestDetailsDialog abnTestDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree
                .GetItemByPath(_testPage.name).InvokeAbnTestsList();

            abnTestDetails.ClickOnTheTest("experimentSimple2");
            abnTestDetails.ClickGoToTestButton();

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetExperimentName().Should().Be("experimentSimple2");
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetExperimentStatus().Should().Be("DRAFT");
        }

        private string CreateSerData_Simple(string experimentName, string status)
        {
            return MockDataHelper.CreateAndFillSimpleMockFlowDefinitionsJson(
                _friendlyIdRTE,
                experimentName,
                Constants.SxaHeadlessSiteSiteGroupingItemId.ToLower(),
                status);
        }

        private string CreateSerData_TwoExperiments(string experimentName1, string experimentName2, string status)
        {
            var experiment1 = MockDataHelper.CreateAndFillSimpleMockFlowDefinitionsJson(
                _friendlyIdRTE,
                experimentName1,
                Constants.SxaHeadlessSiteSiteGroupingItemId.ToLower(),
                status);

            var experiment2 = MockDataHelper.CreateAndFillSimpleMockFlowDefinitionsJson(
                _friendlyIdImage,
                experimentName2,
                Constants.SxaHeadlessSiteSiteGroupingItemId.ToLower(),
                status);

            var experimentsList = new List<MockFlowDefinitions>
            {
                JsonConvert.DeserializeObject<List<MockFlowDefinitions>>(experiment1)[0],
                JsonConvert.DeserializeObject<List<MockFlowDefinitions>>(experiment2)[0]
            };

            return JsonConvert.SerializeObject(experimentsList, Formatting.Indented);
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
