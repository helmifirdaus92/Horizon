// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests.DataModels;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests
{
    public class CanvasOptionsInAbnTests : BaseFixture
    {
        private Item _testPage;
        private string _friendlyId;

        [OneTimeSetUp]
        public void OpenSite()
        {
            Preconditions.OpenSXAHeadlessSite();
        }

        [SetUp]
        public void Setup()
        {
            // Create test page
            _testPage = Preconditions.CreatePage();

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
        public void AddNewVariantToAbTest()
        {
            string initVariantName = "Variant C";

            var serDada = CreateSerData_Simple("experimentSimple", "DRAFT");
            SetLocalStorage(serDada);

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.ClickAddNewVariant();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.VariantName.Should().Be(initVariantName);
        }

        [Test]
        public void RenameVariant()
        {
            string renamedVariantName = "renamed Variant Name";

            var serDada = CreateSerData_Simple("experimentSimple", "DRAFT");
            SetLocalStorage(serDada);

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.SelectVariantByName("Variant B");
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.RenameVariant(renamedVariantName);
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.VariantName.Should().Be(renamedVariantName);
        }

        [Test]
        public void DeleteVariant()
        {
            string defaultVariantName = "Rich Text (control)";
            string deleteVariantName = "Variant C";
            var serDada = CreateSerData_TwoVariants("experiment2", "DRAFT");
            SetLocalStorage(serDada);

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.SelectVariantByName(deleteVariantName);
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            var deleteDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetDeleteVariantDialog();
            deleteDialog.ClickCancelButton();
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.VariantName.Should().Be(deleteVariantName);

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.SelectVariantByName(deleteVariantName);
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            deleteDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetDeleteVariantDialog();
            deleteDialog.ClickDeleteButton();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.VariantName.Should().Be(defaultVariantName);
        }

        [Test]
        public void HideComponentOnTheVariantAndResetVariant()
        {
            var serDada = CreateSerData_Simple("experimentSimple", "DRAFT");
            SetLocalStorage(serDada);

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.SelectVariantByName("Variant B");
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            // hide component
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.HideComponent();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            Context.Pages.Editor.CurrentPage.IsARenderingHiddenInPlaceholder("main").Should().BeTrue();
            Context.Pages.Editor.CurrentPage.HiddenRenderingInPlaceholder("main").Should().Be("Rich Text");

            // reset variant 
            var resetDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.InvokeResetVariantDialog();
            resetDialog.ClickCancelButton();
            Context.Pages.Editor.CurrentPage.IsARenderingHiddenInPlaceholder("main").Should().BeTrue();
            Context.Pages.Editor.CurrentPage.HiddenRenderingInPlaceholder("main").Should().Be("Rich Text");

            resetDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.InvokeResetVariantDialog();
            resetDialog.ClickResetButton();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name.Should().Be("Rich Text");
            Context.Pages.Editor.CurrentPage.IsRenderingPresentInPlaceholder("main", "Rich Text").Should().BeTrue();
        }

        [Test]
        public void SwapWithAnotherComponent()
        {
            var serDada = CreateSerData_Simple("experimentSimple", "DRAFT");
            SetLocalStorage(serDada);

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.SelectVariantByName("Variant B");
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.SwapWithAnotherComponent("Image");
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            Context.Pages.Editor.CurrentPage.IsRenderingPresentInCanvas("Image").Should().BeTrue();
            Context.Pages.Editor.CurrentPage.IsRenderingPresentInCanvas("Rich Text").Should().BeFalse();
        }

        [Test]
        public void CopyOriginalComponent()
        {
            const string dsItemName = "Text 1_var2";
            var serDada = CreateSerData_Simple("experimentSimple", "DRAFT");
            SetLocalStorage(serDada);

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.SelectVariantByName("Variant B");
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.CopyOriginalComponent();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.VariantActionText.Should().Be("Copied original variant");

            Context.Pages.Personalize.RightHandPanel.DesignContentTogle.TogleToContent();
            Context.Pages.Personalize.RightHandPanel.ContentSection.ItemName.Should().Be(dsItemName);


            var dsItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(_testPage.path + "/Data/" + dsItemName);
            dsItem.displayName.Should().Be(dsItemName);
        }


        private string CreateSerData_Simple(string experimentName, string status)
        {
            return MockDataHelper.CreateAndFillSimpleMockFlowDefinitionsJson(
                _friendlyId,
                experimentName,
                Constants.SxaHeadlessSiteSiteGroupingItemId.ToLower(),
                status);
        }

        private string CreateSerData_TwoVariants(string experimentName, string status)
        {
            return MockDataHelper.CreateAndFillMockFlowDefinitionsJson(
                _friendlyId,
                experimentName,
                Constants.SxaHeadlessSiteSiteGroupingItemId.ToLower(),
                status);
        }

        private void SetLocalStorage(string serData)
        {
            Context.Browser.ExecuteJavaScript("localStorage.removeItem('mock-flow-definitions');");
            Context.Browser.Refresh();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

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
