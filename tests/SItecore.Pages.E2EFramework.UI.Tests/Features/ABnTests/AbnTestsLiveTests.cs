// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Boxever;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Boxever.Models;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests
{
    [Category("ConnectedModeTests")]
    public class AbnTestsLive : BaseFixture
    {
        private Item _testPage;
        private FlowDefinition _flowDefinition;
        private BoxeverApi _boxever;

        [OneTimeSetUp]
        public void DisableDisconnectedMode()
        {
            Context.Browser.ExecuteJavaScript("localStorage.removeItem('Sitecore.Horizon.DisconnectedMode');");
            Context.Browser.Refresh();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Preconditions.OpenSXAHeadlessSite();
        }

        [SetUp]
        public void CreatePage()
        {
            // Create test page
            _testPage = Preconditions.CreatePage();

            // Add component to the page
            Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));
            Context.Pages.TopBar.AppNavigation.OpenEditor();
        }

        [Test]
        public void NewDraftAbnTestThroughLive_TestShouldBeLive()
        {
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
            Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);
            var testName = $"AbnTestFromPagesAutoTests_{Guid.NewGuid().ToString()[..5]}";
            Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").Select();
            Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.GoToParent);

            CreateExperimentDialog dialog = Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.OpenCreateExperimentDialog();
            dialog.EnterExperimentName(testName);
            dialog.ClickSaveButton();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetExperimentStatus()
                .Should().Be("DRAFT", "An ABnTest should start with a DRAFT state");
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetExperimentName().Should().Be(testName);

            Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name.Should().Be("Rich Text");
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.HideComponent();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            var configureDialog = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.OpenConfigureExperimentDialog();
            configureDialog
                .SelectPageForPageViewGoal(_testPage.name)
                .ClickSaveButton();
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.StartExperiment();
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetStartTestCheckList().ClickContinueButton();
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent
                .WaitForCondition(ab => ab.GetExperimentStatus() != "DRAFT", TimeSpan.FromSeconds(3), 500, message: "Status did not change in 3 seconds");
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetExperimentStatus()
                .Should().Be("PENDING", "An ABnTest should have PENDING state when the page is not published");

            /*
             * These steps before can be replaced by a POST call to CDP.
             * If this tests becomes flaky, that can be an approach to stabilize it.
             * Also, can be considered to move to publishing feature to reduce total execution time.
             */

            Context.Pages.Editor.TopBar.WorkflowBar.OpenWorkflowActions().PerformWorkflowActions("Submit").Submit();
            Context.Pages.Editor.TopBar.WorkflowBar.OpenWorkflowActions().PerformWorkflowActions("Approve").Submit();
            Context.Pages.TopBar.WorkflowBar.PublishButton.PublishPage();
            TimedNotification notification = Context.Pages.Editor.PublishingTimedNotification;
            notification.Type.Should().BeEquivalentTo(NotificationType.Success);

            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent
                .WaitForCondition(_ =>
                {
                    Context.Pages.Editor.LeftHandPanel.SelectPage("Home");
                    Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);
                    Context.Pages.Editor.CurrentPage.SelectComponentWithActiveAbTest();

                    return Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetExperimentStatus() != "PENDING";
                }, TimeSpan.FromSeconds(60), 5000, message: "Status did not change in 60 seconds");
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetExperimentStatus()
                .Should().Be("LIVE", "An ABnTest should have LIVE state when the page is published");

            //Ending a live test
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.EndExperiment("Variant B");
            Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            TimedNotification testEndedTimedNotification = Context.Pages.Editor.TestEndedTimedNotification;
            testEndedTimedNotification.Type.Should().BeEquivalentTo(NotificationType.Success);
            testEndedTimedNotification.Button.Text.Should().Be("View Analytics");
            testEndedTimedNotification.Close();

            Context.Pages.Editor.CurrentPage.EmptyPlaceholders.Count.Should().Be(1);
        }

        [Test]
        public void AbnTestForPersonalizedPage_AbnTestChipIsDisabled()
        {
            _boxever = new(TestRunSettings.CdpTenantUrl);
            _flowDefinition = _boxever.CreateAFlowDefinitionForPage(pageId: _testPage.itemId, pageName: _testPage.name, siteId: new Guid(Constants.SxaHeadlessSiteSiteGroupingItemId).ToString());

            _flowDefinition = _boxever.AddAVariantToFlowDefinition(_flowDefinition);
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
            Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);
            Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").Select();
            Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.GoToParent);

            Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.IsABnTestComponentDisabled().Should().Be(true, "ABnTest and Personalization are mutually exclusive features");
        }

        [Test]
        public void PersonalizationForPageWithAbnTest_PersonalizationIsDisabled()
        {
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
            Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);
            var testName = $"AbnTestFromPagesAutoTests_{Guid.NewGuid().ToString()[..5]}";
            Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").Select();
            Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.GoToParent);

            CreateExperimentDialog dialog = Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.OpenCreateExperimentDialog();
            dialog.EnterExperimentName(testName);
            dialog.ClickSaveButton();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetExperimentStatus()
                .Should().Be("DRAFT", "An ABnTest should start with a DRAFT state");

            Context.Pages.TopBar.AppNavigation.OpenPersonalizationPanel();
            Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.DescriptionText
                .Should().Be("This page has A/B/n tests running on it and therefore cannot be personalized");
            Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel
                .PersonalizationDisabledDueToComponentTest().Should().Be(true, "ABnTest and Personalization are mutually exclusive features");
        }

        [OneTimeTearDown]
        public void EnableDisconnectedMode()
        {
            if (_boxever != null && _flowDefinition != null)
            {
                _flowDefinition.archived = true;
                _boxever.UpdateFlowDefinition(_flowDefinition);
            }

            Context.Browser.ExecuteJavaScript("localStorage.setItem('Sitecore.Horizon.DisconnectedMode', true);");
            Context.Browser.Refresh();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Context.Pages.TopBar.AppNavigation.OpenEditor();
        }
    }
}
