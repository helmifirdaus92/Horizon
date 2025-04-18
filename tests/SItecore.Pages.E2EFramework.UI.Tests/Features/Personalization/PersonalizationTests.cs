// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Xml.Linq;
using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Personalization;

public class PersonalizationTests : BaseFixture
{
    private Item _testPage;

    [OneTimeSetUp]
    public void OpenSite()
    {
        Preconditions.OpenSXAHeadlessSite();
    }

    [SetUp]
    public void CreatePage()
    {
        // Create test page
        _testPage = Preconditions.CreatePage();

        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.TopBar.AppNavigation.EditorTabIsActive.Should().BeTrue();
    }

    [Test]
    [Ignore("In disconnected mode, we can't check RHS personalization due to the reliance on a dynamic item ID in the flow definition.")]
    public void PersonalizeComponentsAndSXAParameters()
    {
        // Add component to the page
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));
        /*we should refresh browser before each test because the variants remain and we must clean them up*/
        Context.Pages.Editor.Open(_testPage.itemId, site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

        OpenPersonalizationTab();

        CreatePageVariant("variant_1_sxa");

        // Open personalization for component
        Context.Browser.GetDriver().WaitForDotsLoader();
        OpenPersonalizationForComponent("Rich Text");

        // Change SXA parameters to personalize
        // click on styling "Align content center"
        Context.Pages.Personalize.RightHandPanel.OrchestratorSections[1].Expand();
        Context.Pages.Personalize.RightHandPanel.OrchestratorSections[1].ClickAlignContentCenter();

        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        // check that RTE field have aligning element
        var rteField = Context.Pages.Personalize.CurrentPage.GetRenderingByName("Rich Text");
        rteField.Container.GetAttribute("class").Should().Contain("position-center");

        // check api response
        XDocument finalRendering = Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path);
        XElement rule = finalRendering.Descendants("rls").Descendants("rule").FirstOrDefault();

        rule.Descendants("action")
            .Attributes()
            .Select(at => at.Value)
            .Should()
            .Contain(value => value.Contains(Constants.AlignContentCenterStyleId));

        // uncomment after https://sitecore.atlassian.net/browse/PGS-2032 to be fixed
        //Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.NavigateUp();
        //Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name.Should().Be("Main");
        //Context.Pages.Editor.CurrentPage.PersonalizationLabel.GetAttribute("class").Should().NotContain("not-personalized");
    }

    [Test]
    public void CreateNewPersonalizationForPage()
    {
        // Add component to the page
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));
        /*we should refresh browser before each test because the variants remain and we must clean them up*/
        Context.Pages.Editor.Open(_testPage.itemId, site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

        // Create another item
        string localDataSourceId = Context.ApiHelper.PlatformGraphQlClient.GetChildIdByTemplateId(_testPage.path, SxaDataSourceTemplateId);
        Item richText2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Rich Text 2", localDataSourceId, RenderingDataSourceTemplate(SxaRenderings.RichText));

        OpenPersonalizationTab();

        CreatePageVariant("variant_1_create_new");

        // Open personalization for component
        Context.Browser.GetDriver().WaitForDotsLoader();
        OpenPersonalizationForComponent("Rich Text");

        // Assign personalization
        Context.Pages.Personalize.RightHandPanel.DesignContentTogle.TogleToContent();
        DatasourceDialog datasourceDialog = Context.Pages.Personalize.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals("Data")).Expand();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals(richText2.name)).Select();
        datasourceDialog.Assign();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        // Check personalization
        Context.Pages.Personalize.RightHandPanel.ContentSection.ItemName.Should().Be(richText2.name);
        Context.Pages.Personalize.CurrentPage.SelectionFrame.IsPersonalized.Should().BeTrue();
        XDocument finalRendering = Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path);
        XElement rule = finalRendering.Descendants("rls").Descendants("rule").FirstOrDefault();
        rule.Descendants("action").Attributes().Last().Value.Should().BeEquivalentTo($"local:/Data/{richText2.name}");
        string variantId = rule.Attributes().Last().Value;

        // Open page preview
        Context.Pages.Personalize.TopBar.OpenPreview();
        Context.Browser.SwitchToTab("sc_horizon=preview");
        Context.Pages.Preview.IsOpened().Should().BeTrue();
        Context.Browser.TabsCount.Should().BeGreaterThan(1);
        Context.Browser.PageUrl.Should().Contain($"sc_variant={variantId}");
    }

    [Test]
    public void DeleteVariant_FromPersonalizationTab()
    {
        string variantToDelete = "Visitor from Copenhagen";

        // Add component to the page
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));
        /*we should refresh browser before each test because the variants remain and we must clean them up*/
        Context.Pages.Editor.Open(_testPage.itemId, site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

        OpenPersonalizationTab();

        ChoosePageVariant(variantToDelete);

        OpenPersonalizationForComponent("Rich Text");

        // Hide component
        Context.Pages.Personalize.RightHandPanel.Personalization.HideRendering();
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        Context.Pages.Personalize.CurrentPage.IsARenderingHiddenInPlaceholder("main").Should().BeTrue();
        Context.Pages.Personalize.CurrentPage.HiddenRenderingInPlaceholder("main").Should().Be("Rich Text");

        Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path).Descendants("rls").Should().NotBeNullOrEmpty();

        // Delete page variant
        Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.InvokeContextMenu().InvokeDelete();

        Context.Pages.Personalize.ConfirmationDialog.Title.Should().Be("Delete page variant");
        Context.Pages.Personalize.ConfirmationDialog.Message.Should().Be($"Are you sure you want to delete \"{variantToDelete}\"?");
        Context.Pages.Personalize.ConfirmationDialog.ClickDeleteButton();
        Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.GetListOfVariants().Should().NotContain(variantToDelete);
        Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path).Descendants("rls").Should().BeNullOrEmpty();
    }

    [Test]
    public void ResetPersonalizationOnPageVariant()
    {
        // Add component to the page
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.PageContent));
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));
        /*we should refresh browser before each test because the variants remain and we must clean them up*/
        Context.Pages.Editor.Open(_testPage.itemId, site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

        // Create another item
        string localDataSourceId = Context.ApiHelper.PlatformGraphQlClient.GetChildIdByTemplateId(_testPage.path, SxaDataSourceTemplateId);
        Item richText2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Rich Text 2", localDataSourceId, RenderingDataSourceTemplate(SxaRenderings.RichText));

        OpenPersonalizationTab();
        ChoosePageVariant("Visitor from Copenhagen");
        OpenPersonalizationForComponent("Rich Text");

        // Assign personalization
        Context.Pages.Personalize.RightHandPanel.DesignContentTogle.TogleToContent();
        DatasourceDialog datasourceDialog = Context.Pages.Personalize.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals("Data")).Expand();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals(richText2.name)).Select();
        datasourceDialog.Assign();
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        // Check personalization
        Context.Pages.Personalize.RightHandPanel.ContentSection.ItemName.Should().Be(richText2.name);
        Context.Pages.Personalize.CurrentPage.SelectionFrame.IsPersonalized.Should().BeTrue();
        XDocument finalRendering = Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path);
        XElement rule = finalRendering.Descendants("rls").Descendants("rule").FirstOrDefault();
        rule.Descendants("action").Attributes().Last().Value.Should().BeEquivalentTo($"local:/Data/{richText2.name}");

        ChoosePageVariant("Visitor from Oslo");
        OpenPersonalizationForComponent("Page Content");

        // Hide component
        Context.Pages.Personalize.RightHandPanel.Personalization.HideRendering();
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        // Check personalization
        Context.Pages.Personalize.CurrentPage.IsARenderingHiddenInPlaceholder("main").Should().BeTrue();
        Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path).Descendants("rls").Count().Should().Be(2);

        ChoosePageVariant("Visitor from Copenhagen");

        //OpenPersonalizationForComponent("Rich Text");
        Context.Pages.Personalize.CurrentPage.PersonalizationLabel.Click();

        // Reset personalization
        Context.Pages.Personalize.RightHandPanel.Personalization.ResetPersonalization();
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        // Check personalization
        Context.Pages.Personalize.RightHandPanel.DesignContentTogle.TogleToContent();
        Context.Pages.Personalize.RightHandPanel.ContentSection.ItemName.Should().Be("Text 1");
        Context.Pages.Personalize.CurrentPage.SelectionFrame.IsPersonalized.Should().BeFalse();
        Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path).Descendants("rls").Count().Should().Be(1);
    }

    [Test]
    public void TrackHistorySeparateForPersonalizationVariants()
    {
        // Add component to the page
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.Title));
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));
        /*we should refresh browser before each test because the variants remain and we must clean them up*/
        Context.Pages.Editor.Open(_testPage.itemId, site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

        // Create another rich text component
        string localDataSourceId = Context.ApiHelper.PlatformGraphQlClient.GetChildIdByTemplateId(_testPage.path, SxaDataSourceTemplateId);
        Item richText2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Rich Text 2", localDataSourceId, RenderingDataSourceTemplate(SxaRenderings.RichText));

        ContentEditable titleInput = Context.Pages.Editor.CurrentPage.TextInputs[0];
        titleInput.Clear().LooseFocus();
        titleInput.Text = "Text-1";
        titleInput.LooseFocus();

        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeTrue();

        OpenPersonalizationTab();
        ChoosePageVariant("Visitor from Copenhagen");

        Context.Pages.Personalize.EditorHeader.IsUndoActive().Should().BeFalse();

        OpenPersonalizationForComponent("Rich Text");

        // Assign personalization

        Context.Pages.Personalize.RightHandPanel.DesignContentTogle.TogleToContent();
        DatasourceDialog datasourceDialog = Context.Pages.Personalize.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals("Data")).Expand();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals(richText2.name)).Select();
        datasourceDialog.Assign();
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        Context.Pages.Personalize.EditorHeader.IsUndoActive().Should().BeTrue();

        ChoosePageVariant("Visitor from Oslo");

        Context.Pages.Personalize.EditorHeader.IsUndoActive().Should().BeFalse();

        // Assign personalization
        OpenPersonalizationForComponent("Rich Text");
        Context.Pages.Personalize.RightHandPanel.DesignContentTogle.TogleToContent();
        datasourceDialog = Context.Pages.Personalize.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals("Data")).Expand();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals(richText2.name)).Select();
        datasourceDialog.Assign();
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        // Delete page variant
        Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.InvokeContextMenu().InvokeDelete();
        Context.Pages.Personalize.ConfirmationDialog.ClickDeleteButton();
        Context.Pages.Personalize.EditorHeader.WaitUntilAutoSaveAtInactivity();

        Context.Pages.Personalize.EditorHeader.IsUndoActive().Should().BeFalse();
    }

    [Test]
    public void ComponentGalleryShowsOnlyCompatibleRenderingsForSelectedRendering()
    {
        // Update compatible renderings for Rich Text
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(
            RenderingId(SxaRenderings.RichText),
            "Compatible Renderings",
            RenderingId(SxaRenderings.PageContent) + "|" + RenderingId(SxaRenderings.Title));

        // Add component to the page
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.Title));
        /*we should refresh browser before each test because the variants remain and we must clean them up*/
        Context.Pages.Editor.Open(_testPage.itemId, site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

        OpenPersonalizationTab();
        ChoosePageVariant("Visitor from Copenhagen");
        OpenPersonalizationForComponent("Rich Text");

        // Check available renderings in the components panel
        Context.Pages.Personalize.RightHandPanel.Personalization.OpenComponentsPanel();

        Context.Pages.Personalize.RightHandPanel.Personalization.ComponentsPanel.CompatibleRenderingsList
            .Should()
            .NotBeEmpty()
            .And.HaveCount(2)
            .And.BeEquivalentTo(new List<string>()
            {
                "Page Content",
                "Title"
            });

        // Update compatible renderings for Rich Text
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(
            RenderingId(SxaRenderings.RichText),
            "Compatible Renderings",
            RenderingId(SxaRenderings.Title));

        ChoosePageVariant("Visitor from Oslo");
        OpenPersonalizationForComponent("Rich Text");

        // Check available renderings in the components panel
        Context.Pages.Personalize.RightHandPanel.Personalization.OpenComponentsPanel();
        Context.Pages.Personalize.RightHandPanel.Personalization.ComponentsPanel.CompatibleRenderingsList
            .Should()
            .NotBeEmpty()
            .And.HaveCount(1)
            .And.BeEquivalentTo("Title");

        Context.Pages.Personalize.CurrentPage.GetRenderingByName("Title").Select();

        // Check available renderings in the components panel
        Context.Pages.Personalize.RightHandPanel.Personalization.OpenComponentsPanel();

        Context.Pages.Personalize.RightHandPanel.Personalization.ComponentsPanel.NoAllowedComponentsMessage
            .Should().Be("No compatible components" + "There are no compatible components available for the selected component");
    }

    [Test]
    public void ReplaceComponentForPageVariants()
    {
        string selectedRendering = "Page Content";

        // Update compatible renderings for Rich Text
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(
            RenderingId(SxaRenderings.RichText),
            "Compatible Renderings",
            RenderingId(SxaRenderings.PageContent) + "|" + RenderingId(SxaRenderings.Title));

        // Add component to the page
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));
        /*we should refresh browser before each test because the variants remain and we must clean them up*/
        Context.Pages.Editor.Open(_testPage.itemId, site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

        OpenPersonalizationTab();
        ChoosePageVariant("Visitor from Copenhagen");
        OpenPersonalizationForComponent("Rich Text");

        Context.Pages.Personalize.RightHandPanel.Personalization.OpenComponentsPanel();
        Context.Pages.Personalize.RightHandPanel.Personalization.ComponentsPanel.SelectRenderingComponentByName(selectedRendering);
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        Context.Pages.Personalize.CurrentPage.GetRenderingByName(selectedRendering).IsEnabled.Should().BeTrue();
        Context.Pages.Personalize.CurrentPage.SelectionFrame.IsPersonalized.Should().BeTrue();
        Context.Pages.Personalize.CurrentPage.SelectionFrame.ChipElement.Name.Should().Be(selectedRendering);
        Context.Pages.Personalize.RightHandPanel.Personalization.ComponentNameInButton.Should().Be(selectedRendering);
        Context.Pages.Personalize.RightHandPanel.HeaderText.Should().Be(selectedRendering);
    }

    [Test]
    public void ContentMenuActionsOnVariant()
    {
        /*we should refresh browser before each test because the variants remain and we must clean them up*/
        Context.Pages.Editor.Open(_testPage.itemId, site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

        OpenPersonalizationTab();
        ChoosePageVariant("Visitor from Oslo");

        // Rename audience name and variant
        Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.InvokeContextMenu().InvokeEditAudience();
        Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.EditAudience("Renamed audience");
        Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.InvokeContextMenu().InvokeRenamePageVariant();
        Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.RenameVariant("Renamed variant");

        // Check audience and variant renamed
        Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.AudienceNameInSelectedVariant.Should().Contain("Renamed audience");
        Context.Pages.Personalize.LeftHandPanel.PersonalizationPanel.GetListOfVariants().Should().Contain("Renamed variant");
    }

    [Test]
    public void RemoveRenderingFromDefaultVariant_WithPersonalizationAssigned()
    {
        // Add component to the page
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.Title));
        /*we should refresh browser before each test because the variants remain and we must clean them up*/
        Context.Pages.Editor.Open(_testPage.itemId, site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

        // Create data sources
        string localDataSourceId = Context.ApiHelper.PlatformGraphQlClient.GetChildIdByTemplateId(_testPage.path, SxaDataSourceTemplateId);
        Item richText2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Rich Text 2", localDataSourceId, RenderingDataSourceTemplate(SxaRenderings.RichText));
        Item richText3 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Rich Text 3", localDataSourceId, RenderingDataSourceTemplate(SxaRenderings.RichText));

        OpenPersonalizationTab();
        ChoosePageVariant("Visitor from Copenhagen");
        OpenPersonalizationForComponent("Rich Text");

        // Assign personalization


        Context.Pages.Personalize.RightHandPanel.DesignContentTogle.TogleToContent();
        DatasourceDialog datasourceDialog = Context.Pages.Personalize.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals("Data")).Expand();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals(richText2.name)).Select();
        datasourceDialog.Assign();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        ChoosePageVariant("Visitor from Oslo");
        OpenPersonalizationForComponent("Rich Text");

        // Assign personalization
        Context.Pages.Personalize.RightHandPanel.DesignContentTogle.TogleToContent();
        datasourceDialog = Context.Pages.Personalize.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals("Data")).Expand();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals(richText3.name)).Select();
        datasourceDialog.Assign();
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        CreatePageVariant("variant_1_remove_rend");
        Context.Pages.Personalize.CurrentPage.GetRenderingByName("Title").Select();

        // Assign personalization
        Context.Pages.Personalize.RightHandPanel.DesignContentTogle.TogleToContent();
        datasourceDialog = Context.Pages.Personalize.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        datasourceDialog.DatasourceItemTree.GetAllVisibleItems().Find(item => item.Name.Equals("Home")).Select();
        datasourceDialog.Assign();
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();

        // Open pages tab
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.TopBar.AppNavigation.EditorTabIsActive.Should().BeTrue();

        // Delete rich text rendering
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Rendering rendering = Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text");
        rendering.Select();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.GoToParent);
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.DeleteElement();
        Context.Browser.SwitchToDefaultContent();
        Context.Pages.Editor.ConfirmationDialog.ClickDeleteButton();
        Context.Browser.WaitForHorizonIsStable();

        // Check rendering deleted
        Context.Pages.Editor.CurrentPage.Renderings.Count.Should().Be(1);
        Context.Pages.Editor.CurrentPage.IsRenderingPresentInPlaceholder("main", "Rich Text").Should().BeFalse();
        OpenPersonalizationTab();
        ChoosePageVariant("Visitor from Copenhagen");
        Context.Pages.Personalize.CurrentPage.Renderings.Count.Should().Be(1);
        Context.Pages.Personalize.CurrentPage.IsRenderingPresentInPlaceholder("main", "Rich Text").Should().BeFalse();
        ChoosePageVariant("Visitor from Oslo");
        Context.Pages.Personalize.CurrentPage.Renderings.Count.Should().Be(1);
        Context.Pages.Personalize.CurrentPage.IsRenderingPresentInPlaceholder("main", "Rich Text").Should().BeFalse();
        ChoosePageVariant("variant_1_remove_rend");
        Context.Pages.Personalize.CurrentPage.Renderings.Count.Should().Be(1);
        Context.Pages.Personalize.CurrentPage.IsRenderingPresentInPlaceholder("main", "Rich Text").Should().BeFalse();
        Context.Pages.Personalize.CurrentPage.IsRenderingPresentInPlaceholder("main", "Title").Should().BeTrue();
    }

    private static void OpenPersonalizationForComponent(string componentName)
    {
        Context.Pages.Personalize.CurrentPage.GetRenderingByName(componentName).Select();
        if (componentName.Equals("Rich Text") || componentName.Equals("Page Content"))
        {
            if (Context.Pages.Personalize.TimedNotification.Button.IsVisible)
            {
                Context.Pages.Personalize.TimedNotification.Button.Click();
            }
            else
            {
                Context.Pages.Personalize.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls
                    .GoToParent);
            }
        }

        Context.Browser.WaitForHorizonIsStable();
    }

    private static void OpenPersonalizationTab()
    {
        Context.Pages.TopBar.AppNavigation.OpenPersonalizationPanel();
        Context.Pages.TopBar.AppNavigation.PersonalizationTabIsSelected.Should().BeTrue();
    }

    private static void CreatePageVariant(string variantName)
    {
        Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.CreateNewVariant(variantName);
        Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.GetListOfVariants().Should().Contain(variantName);
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();
    }

    private static void ChoosePageVariant(string variantName)
    {
        Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.SelectVariantByName(variantName);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
    }
}
