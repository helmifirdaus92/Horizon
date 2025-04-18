// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.FieldsEditing;

public class SingleLineTextField : BaseFixture
{
    private IItem _testPage;
    private IItem _dsItem;

    private readonly string _singleLineTextFieldName = "SingleLineText";
    private static Rendering CustomRendering => Context.Pages.Editor.CurrentPage.GetRenderingByName("Custom Component");

    [OneTimeSetUp]
    public void StartTestsInEditorTestSite()
    {
        Preconditions.OpenSXAHeadlessSite();
        Preconditions.OpenEnglishLanguage();
    }

    [SetUp]
    public void AddTestComponent()
    {
        //Create page
        _testPage = Preconditions.CreatePage();
        Preconditions.OpenEnglishLanguage();

        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.CustomComponent));

        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(_testPage.name).Select();

        _dsItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(_testPage.path + "/Data/CustomDataSource 1");
    }

    [TestCase("U_/*-+!@#$%.&*()_ø_<script>alert(‘xss’);</script>_1234567890_https://www.google.com.ua ?", "Loose Focus")]
    [TestCase("日本語テキスト/*-+!@#$%&*()Текст українською", "Auto Save")]
    [TestCase("", "Loose Focus")]
    public void EditValue_AutoSaved(string value, string saveTrigger)
    {
        UpdateSingleLineTextFieldValue(value);
        switch (saveTrigger)
        {
            case "Loose Focus":
                SingleLineTextFieldLoosesFocusWithSave();
                break;
            default:
                CustomRendering.SingleLineTextField.AutoSaveWithInactivity();
                break;
        }

        _dsItem.GetFieldValue(_singleLineTextFieldName).Should().Be(value);
        CustomRendering.SingleLineTextField.Text.Should().Be(value.Equals(string.Empty) ? "[No text in field]" : value);
    }

    [Test]
    public void EditTextFieldInPageContext_ValueSavedInPageField()
    {
        Context.Pages.Editor.LeftHandPanel.OpenComponentsTab();
        Preconditions.DragAndDropToTheOutlineToolbar("Title", "top", "Custom Component");
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        var title = Context.Pages.Editor.CurrentPage.GetRenderingByName("Title");
        title.SingleLineTextField.Clear();
        title.SingleLineTextField.Container.ClickOutside();
        title.SingleLineTextField.Text = "Title";
        SingleLineTextFieldLoosesFocusWithSave();
        _testPage.GetFieldValue("Title").Should().Be("Title");
    }

    [Test]
    public void EditTextFieldInMultipleVersions_ValueInPageContextRetained()
    {
        Context.Pages.Editor.LeftHandPanel.OpenComponentsTab();
        Preconditions.DragAndDropToTheOutlineToolbar("Title", "top", "Custom Component");
        Context.Pages.Editor.EditorHeader.OpenVersions().OpenCreateVersionDialog().ClickCreateButton();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.EditorHeader.CloseVersionsList();
        var title = Context.Pages.Editor.CurrentPage.GetRenderingByName("Title");
        title.SingleLineTextField.Clear();
        title.SingleLineTextField.Container.ClickOutside();
        title.SingleLineTextField.Text = "Version2";
        SingleLineTextFieldLoosesFocusWithSave();
        Context.Pages.Editor.EditorHeader.OpenVersions().SelectVersion(1);
        title = Context.Pages.Editor.CurrentPage.GetRenderingByName("Title");
        title.SingleLineTextField.Click();
        title.SingleLineTextField.Text.Should().Be("Version2");
        _testPage.GetFieldValue("Title").Should().Be("Version2");
    }

    [Test]
    public void UndoRedoActionsOnSingleLineTextField_HistoryIsTrackedProperly()
    {
        UpdateSingleLineTextFieldValue("FirstText");
        SingleLineTextFieldLoosesFocusWithSave();
        CustomRendering.SingleLineTextField.Click();
        CustomRendering.SingleLineTextField.AppendText("SecondText");
        SingleLineTextFieldLoosesFocusWithSave();
        UpdateSingleLineTextFieldValue("");
        SingleLineTextFieldLoosesFocusWithSave();
        Context.Pages.Editor.EditorHeader.Undo(false);
        CustomRendering.SingleLineTextField.Click();
        Context.Pages.Editor.EditorHeader.Undo(false);
        SingleLineTextFieldValueUpdated("FirstText");
        Context.Pages.Editor.EditorHeader.Redo(false);
        CustomRendering.SingleLineTextField.Text.Should().Contain("FirstTextSecondText");
        Context.Pages.Editor.EditorHeader.Redo(false);
        SingleLineTextFieldValueUpdated("");
    }

    private static void SingleLineTextFieldLoosesFocusWithSave()
    {
        Context.Pages.Editor.RightHandPanel.LooseFocus();
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
    }

    private static void UpdateSingleLineTextFieldValue(string value)
    {
        if (value.Equals(string.Empty))
        {
            CustomRendering.SingleLineTextField.Clear();
            CustomRendering.SingleLineTextField.Container.ClickOutside();
        }
        CustomRendering.SingleLineTextField.Text = (value);
    }

    private void SingleLineTextFieldValueUpdated(string value)
    {
        CustomRendering.SingleLineTextField.Text.Should().Be(value.Equals(string.Empty) ? "[No text in field]" : value);
        _dsItem.GetFieldValue(_singleLineTextFieldName).Should().Be(value);
    }
}
