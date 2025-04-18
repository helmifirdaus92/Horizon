// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;
using static Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data.DataHelper;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Publishing
{
    public class PublishingFromPages : BaseFixture
    {
        private Item _testPage;
        private Item _richText2;
        private Item _richText3;
        private Item _childPage;

        [OneTimeSetUp]
        public void TestSetupAndPreconditions()
        {
            InitializeEdgeClient();

            _testPage = Preconditions.CreatePage();

            CreateRichTextItems();

            PersonalizePageVariant("Visitor from Copenhagen", "Rich Text");

            AssignRichText2Datasource();

            CreateSubPage();

            // refresh site tree
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath("Home").Select();
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(_testPage.name).Select();

            // publish page with sub items
            Context.Pages.TopBar.WorkflowBar.PublishButton.PublishPageWithSubPages();

            TimedNotification notification = Context.Pages.Editor.PublishingTimedNotification;
            notification.Type.Should().BeEquivalentTo(NotificationType.Success);
            notification.Message.Should().Contain($"The \"{_testPage.name}\" page was published with subpages. Pages processed:");
        }

        [OneTimeTearDown]
        public void WaitForNotificationToDisappear()
        {
            Context.Pages.Editor.WaitForNotificationToDisappear();
        }

        [Test]
        public void PublishPage()
        {
            // page is published
            Context.ApiHelper.EdgeGraphQLClient.Should().NotBeNull("Edge client is not initialized");
            var item = Context.ApiHelper.EdgeGraphQLClient.GetItemByPathAsync(_testPage.path);
            item.displayName.Should().Be(_testPage.name);
            item.id.ToUpper().Should().BeEquivalentTo(FormatItemId(_testPage.itemId));
        }

        [Test]
        public void PublishPageWithRelatedItems()
        {
            // check page with datasource is published, not assigned datasource not published
            Context.ApiHelper.EdgeGraphQLClient.Should().NotBeNull("Edge client is not initialized");
            var testPageItem = Context.ApiHelper.EdgeGraphQLClient.GetItemByPathAsync(_testPage.path);
            var assignedDatasource = Context.ApiHelper.EdgeGraphQLClient.GetItemByPathAsync(_richText2.path);
            var unassignedDatasource = Context.ApiHelper.EdgeGraphQLClient.GetItemByPathAsync(_richText3.path);

            testPageItem.Should().NotBeNull();
            testPageItem.id.Should().BeEquivalentTo(FormatItemId(_testPage.itemId));
            assignedDatasource.Should().NotBeNull();
            unassignedDatasource.Should().BeNull();
        }

        [Test]
        public void PublishPageAndSubPages()
        {
            Context.ApiHelper.EdgeGraphQLClient.Should().NotBeNull("Edge client is not initialized");
            var testPageItem = Context.ApiHelper.EdgeGraphQLClient.GetItemByPathAsync(_testPage.path);
            testPageItem.Should().NotBeNull();
            testPageItem.name.Should().BeEquivalentTo(_testPage.name);
            testPageItem.id.Should().BeEquivalentTo(FormatItemId(_testPage.itemId));

            var childPageItem = Context.ApiHelper.EdgeGraphQLClient.GetItemByPathAsync(_childPage.path);
            childPageItem.Should().NotBeNull();
            childPageItem.name.Should().BeEquivalentTo(_childPage.name);
            childPageItem.id.Should().BeEquivalentTo(FormatItemId(_childPage.itemId));
        }

        [Test]
        public void PublishAPersonalizedPage_VariantIdIsAvailableInEdge()
        {
            // page is published
            var item = Context.ApiHelper.EdgeGraphQLClient.GetItemByPathAsync(_testPage.path);
            item.displayName.Should().Be(_testPage.name);
            item.id.ToUpper().Should().BeEquivalentTo(FormatItemId(_testPage.itemId));
            item.personalization.variantIds.First().ToLower().Should().BeEquivalentTo(FormatItemId(Constants.VisitorFromCphFlowDefinitionId));
        }

        private void CreateRichTextItems()
        {;
            _richText2 = Preconditions.CreateItem("Rich Text 2", Constants.SxaHeadlessSiteDataTextsFolderId, RenderingDataSourceTemplate(SxaRenderings.RichText));
            _richText3 = Preconditions.CreateItem("Rich Text 3", Constants.SxaHeadlessSiteDataTextsFolderId, RenderingDataSourceTemplate(SxaRenderings.RichText));
        }

        private void InitializeEdgeClient()
        {
            Context.ApiHelper.InitializeEdgeClient(TestRunSettings.EdgeDeliveryApi,
                TestRunSettings.EdgeApi,
                Context.EdgeClientId,
                Context.EdgeClientSecret);
        }

        private void PersonalizePageVariant(string variant, string rteComponent)
        {
            Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));
            Preconditions.OpenSXAHeadlessSite();

            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(_testPage.name).Select();
            Context.Pages.TopBar.AppNavigation.OpenPersonalizationPanel();
            Context.Pages.TopBar.AppNavigation.PersonalizationTabIsSelected.Should().BeTrue();
            Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.SelectVariantByName(variant);
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            Context.Pages.Personalize.CurrentPage.GetRenderingByName(rteComponent).Select();
            if (Context.Pages.Personalize.TimedNotification.Button.IsVisible)
            {
                Context.Pages.Personalize.TimedNotification.Button.Click();
            }

            Context.Browser.WaitForHorizonIsStable();
            Context.Pages.Personalize.RightHandPanel.Personalization.HideRendering();
            Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();
            Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path).Descendants("rls").Should().NotBeNullOrEmpty();
            Context.Pages.TopBar.AppNavigation.OpenEditor();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Context.Pages.Editor.CurrentPage.GetRenderingByName(rteComponent).Select();
        }

        private void AssignRichText2Datasource()
        {
            Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.GoToParent);
            Context.Browser.WaitForHorizonIsStable();
            Context.Pages.Editor.RightHandPanel.DesignContentTogle.TogleToContent();
            DatasourceDialog dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
            var item = dialog.DatasourceItemTree.GetItemByPath("Texts/Rich Text 2");
            item.Select();
            dialog.Assign();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        }

        private void CreateSubPage()
        {
            _childPage = Preconditions.CreatePage(parentId: _testPage.itemId);
            Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(_childPage.itemId, "__Workflow State", WorkflowInfo.SampleWorkflow.WorkflowStateApproved);
            _testPage.SetWorkflowState(WorkflowInfo.SampleWorkflow.WorkflowStateApproved);
        }
    }
}
