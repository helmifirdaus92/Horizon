// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Xml.Linq;
using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor;

public class ChangeDatasource : BaseFixture
{
    private Item _testPage;

    [OneTimeSetUp]
    public void OpenSxaSite()
    {
        Preconditions.OpenSXAHeadlessSite();
    }

    [SetUp]
    public void CreatePage()
    {
        // create page
        _testPage = Preconditions.CreatePage();

        // add rich text to empty placeholder
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().Select();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.GoToParent);
        Context.Pages.Editor.RightHandPanel.DesignContentTogle.TogleToContent();
    }

    [Test]
    public void ChangeDatasource_ToExistingItem()
    {
        // create rich text item
        string localDataSourceId = Context.ApiHelper.PlatformGraphQlClient.GetChildIdByTemplateId(_testPage.itemId, SxaDataSourceTemplateId);
        Item richText2 = Preconditions.CreateItem("Rich Text 2", localDataSourceId, RenderingDataSourceTemplate(SxaRenderings.RichText));

        // assign rich text 2 datasource
        DatasourceDialog dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        dialog.DatasourceItemTree.GetAllVisibleItems().Find(i => i.Name == richText2.name).Select();
        dialog.Assign();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        // check undo/redo
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Undo();
        dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        dialog.DatasourceItemTree.SelectedItem.Name.Should().BeEquivalentTo("Text 1");
        dialog.Close();

        Context.Pages.Editor.EditorHeader.IsRedoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Redo();

        // check datasource assigned
        dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        dialog.DatasourceItemTree.SelectedItem.Name.Should().BeEquivalentTo(richText2.name);
        dialog.Close();

        var rendering = Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path);
        string componentId = rendering.Descendants("d").FirstOrDefault().Descendants("r").FirstOrDefault().Attribute("{s}ds").Value;
        componentId.Should().BeEquivalentTo($"local:/Data/{richText2.name}");
    }

    [Test]
    public void ChangeDatasource_CreateNewItem()
    {
        DatasourceDialog dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        TreeItem parentItem = dialog.DatasourceItemTree.SelectedItem.Parent.Select();
        parentItem.InvokeSlidingPanel();
        dialog.ContentItemSlidingPanel.SelectTemplate("Text");

        TreeItem newItem = dialog.DatasourceItemTree.SelectedItem.Parent.GetChildren().First();
        newItem.SetDisplayName("Text 2");
        newItem.Container.ClickOutside();
        dialog.Assign();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        // check datasource assigned
        dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        dialog.DatasourceItemTree.SelectedItem.Name.Should().BeEquivalentTo("Text 2");
        dialog.Close();
    }

    [Test]
    public void ChangeDatasource_CreateNewItem_SameNameNotAllowed()
    {
        string textComponentName = "Text 1";

        DatasourceDialog dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        dialog.DatasourceItemTree.SelectedItem.Parent.Select().InvokeSlidingPanel();
        dialog.ContentItemSlidingPanel.SelectTemplate("Text");

        TreeItem newItem = dialog.DatasourceItemTree.SelectedItem.Parent.GetChildren().First();
        newItem.SetDisplayName(textComponentName);
        newItem.Container.ClickOutside();
        dialog.GetAllTimedNotifications().Message.Should().BeEquivalentTo($"A '{textComponentName}' item already exists at this level. There cannot be two items with the same name at the same level.");

        dialog.IsAssignButtonEnabled().Should().BeFalse();
        dialog.Close();
    }

    [Test]
    public void ChangeDatasource_NotAllowedDatasourceCannotBeAssigned()
    {
        // create image item
        string localDataSourceId = Context.ApiHelper.PlatformGraphQlClient.GetChildIdByTemplateId(_testPage.itemId, SxaDataSourceTemplateId);
        Item image = Preconditions.CreateItem("Image", localDataSourceId, RenderingDataSourceTemplate(SxaRenderings.Image));

        // assign image datasource
        DatasourceDialog dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        dialog.DatasourceItemTree.GetAllVisibleItems().Find(i => i.Name == image.name).Container.FindElements(".node-content.node-incompatible").Should().NotBeNullOrEmpty();
        dialog.Close();

        var rendering = Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path);
        rendering.ToString().Replace("-", "").Should().NotContain(image.itemId);
    }

    [Test]
    public void ChangeDatasource_CancelingDoNotSaveChanges()
    {
        // create rich text item
        string localDataSourceId = Context.ApiHelper.PlatformGraphQlClient.GetChildIdByTemplateId(_testPage.itemId, SxaDataSourceTemplateId);
        Item richText2 = Preconditions.CreateItem("Rich Text 2", localDataSourceId, RenderingDataSourceTemplate(SxaRenderings.RichText));

        // assign rich text 2 datasource
        DatasourceDialog dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        dialog.DatasourceItemTree.GetAllVisibleItems().Find(i => i.Name == richText2.name).Select();
        dialog.Close();
        Context.Browser.WaitForHorizonIsStable();

        // check datasource not assigned
        dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        dialog.DatasourceItemTree.SelectedItem.Name.Should().BeEquivalentTo("Text 1");
        dialog.Close();

        var rendering = Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path);
        rendering.ToString().Replace("-", "").Should().NotContain(richText2.itemId);
    }

    [Test]
    public void ChangeDatasource_CannotCreateNewItemWithoutInsertOptions()
    {
        // open assign content dialog
        DatasourceDialog dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        dialog.DatasourceItemTree.SelectedItem.InvokeSlidingPanel();
        dialog.ContentItemSlidingPanel.GetInsertOptions().Count.Should().Be(0);

        dialog.Close();
        Context.Browser.GetDriver().WaitForDotsLoader();

        // check datasource not changed
        dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        dialog.DatasourceItemTree.SelectedItem.Name.Should().BeEquivalentTo("Text 1");
        dialog.Close();
    }

    [Test]
    public void ChangeDatasource_DuplicateDatasource()
    {
        XDocument layout = Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path);
        string datasourcePath = layout.Descendants("d").FirstOrDefault().Descendants("r").FirstOrDefault().Attribute("{s}ds").Value;

        datasourcePath.Should().BeEquivalentTo("local:/Data/Text 1");

        DatasourceDialog dialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();
        dialog.DatasourceItemTree.SelectedItem.DuplicateItem();
        dialog.Assign();

        layout = Context.ApiHelper.PlatformGraphQlClient.GetItemLayoutFinalRendering(_testPage.path);
        datasourcePath = layout.Descendants("d").FirstOrDefault().Descendants("r").FirstOrDefault().Attribute("{s}ds").Value;

        datasourcePath.Should().BeEquivalentTo("local:/Data/Copy of Text 1");
    }
}
