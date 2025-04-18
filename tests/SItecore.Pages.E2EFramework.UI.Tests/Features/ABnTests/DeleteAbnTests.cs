// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests.DataModels;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests
{
    public class DeleteAbnTests : BaseFixture
    {
        private const string ExperimentName = "experimentToDelete";
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
        public void DeleteABnTest()
        {
            var serDada = CreateSerData_Simple(ExperimentName, "DRAFT");
            SetLocalStorage(serDada);

            var deleteDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetDeleteABnTestDialog();
            deleteDialog.Message.Should().Be($"Are you sure you want to delete the test \"{ExperimentName}\"?");

            deleteDialog.ClickCancelButton();

            Context.Pages.Editor.RightHandPanel.IsApplicationTestComponentSectionExists.Should().BeTrue();
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetExperimentName().Should().Be(ExperimentName);

            deleteDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetDeleteABnTestDialog();
            deleteDialog.ClickDeleteButton();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            Context.Pages.Editor.RightHandPanel.IsApplicationTestComponentSectionExists.Should().BeFalse();
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
