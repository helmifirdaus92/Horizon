// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.FieldsEditing;

public class MultiLineTextField : BaseFixture
{
    private IItem _testPage;
    private IItem _dsItem;

    private string _multiLineTextFieldName = "MultiLineText";
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

    [TestCase("/*-+!@#$%&*()._£¥€©¼π-It_is_not_ASCII_Long text Long text Long t Long text Long text Long_https://www.google.com.ua", "Loose Focus")]
    [TestCase("<div>Hello</div>", "Auto Save")]
    [TestCase("", "Loose Focus")]
    [TestCase("first line\nsecond line\nthird line", "Loose Focus")]
    public void EditValue_AutoSaved(string value, string saveTrigger)
    {
        string valueToUpdate = value;
        if (value.Contains('\n'))
        {
            valueToUpdate = valueToUpdate.Replace("\n", Environment.NewLine);
        }

        UpdateMultiLineTextFieldValue(valueToUpdate);
        switch (saveTrigger)
        {
            case "Loose Focus":
                MultiLineTextFieldLoosesFocusWithSave();
                break;
            default:
                CustomRendering.MultiLineTextField.AutoSaveWithInactivity();
                break;
        }

        var savedValue = _dsItem.GetFieldValue(_multiLineTextFieldName);
        if (savedValue.Contains('\n'))
        {
            savedValue.Should().Be(value + "\n");
        }
        else
        {
            savedValue.Should().Be(value);
        }

        CustomRendering.MultiLineTextField.Text.Should().Be(valueToUpdate.Equals(string.Empty) ? "[No text in field]" : valueToUpdate);
    }

    [Ignore("This test is failing due to the Bug 567845")]
    [Test]
    public void EditFieldValueWithHTMLScript_AutoSaved()
    {
        string value = "<script>alert('Hello there')</script>";
        UpdateMultiLineTextFieldValue(value);
        MultiLineTextFieldLoosesFocusWithSave();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem.Select();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(_testPage.name).Select();

        _dsItem.GetFieldValue(_multiLineTextFieldName).Should().Be(value);
        CustomRendering.MultiLineTextField.Text.Should().Be(value.Equals(string.Empty) ? "[No text in field]" : value);
    }

    [Test]
    public void UndoRedoActionsOnNumberField_HistoryIsTrackedProperly()
    {
        UpdateMultiLineTextFieldValue("FirstValue");
        MultiLineTextFieldLoosesFocusWithSave();
        UpdateMultiLineTextFieldValue("");
        MultiLineTextFieldLoosesFocusWithSave();
        UpdateMultiLineTextFieldValue("SecondValue");
        MultiLineTextFieldLoosesFocusWithSave();
        Context.Pages.Editor.EditorHeader.Undo(false);
        SingleLineTextFieldValueUpdated("");
        Context.Pages.Editor.EditorHeader.Undo(false);
        SingleLineTextFieldValueUpdated("FirstValue");
        Context.Pages.Editor.EditorHeader.Redo(false);
        SingleLineTextFieldValueUpdated("");
        Context.Pages.Editor.EditorHeader.Redo(false);
        SingleLineTextFieldValueUpdated("SecondValue");
    }

    private static void MultiLineTextFieldLoosesFocusWithSave()
    {
        Context.Pages.Editor.RightHandPanel.LooseFocus();
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
    }

    private static void UpdateMultiLineTextFieldValue(string value)
    {
        if (value.Equals(string.Empty))
        {
            CustomRendering.MultiLineTextField.Clear();
            CustomRendering.MultiLineTextField.Container.ClickOutside();
        }

        CustomRendering.MultiLineTextField.Text = (value);
    }

    private void SingleLineTextFieldValueUpdated(string value)
    {
        CustomRendering.MultiLineTextField.Text.Should().Be(value.Equals(string.Empty) ? "[No text in field]" : value);
        _dsItem.GetFieldValue(_multiLineTextFieldName).Should().Be(value);
    }
}
