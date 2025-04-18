// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.FieldsEditing;

public class NumberField : BaseFixture
{
    private readonly string _numberFieldName = "Number";
    private readonly string _defautlValue = "523";
    private readonly string _invalidValue = "999aaaaabbbbb";

    private IItem _testPage;
    private IItem _dsItem;
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
        _testPage.AddVersion(language: "da");

        //Set a default value in number field
        _dsItem.SetFieldValue(_numberFieldName, _defautlValue, language: "en");
        Context.Pages.Editor.ReloadCanvas();
    }

    [TestCase("0.2")]
    [TestCase("1.2E+10")]
    [TestCase("")]
    public void EditValue_AutoSavedUponLooseFocus(string value)
    {
        UpdateNumberFieldValue(value);
        NumberFieldLoosesFocusWithSave();
        _dsItem.GetFieldValue(_numberFieldName).Should().Be(value);
        CustomRendering.NumberField.Text.Should().Be(value.Equals(string.Empty) ? "[No text in field]" : value);
    }

    [Test]
    public void EnterInvalidValue_ErrorMessageDisplayedOnSaveAttempt()
    {
        UpdateNumberFieldValue(_invalidValue);
        Context.Pages.Editor.RightHandPanel.NumberInputValidationErrorMessage.Should().Be($"\"{_invalidValue}\" is not a valid number");
        Context.Pages.Editor.RightHandPanel.LooseFocus();
        CustomRendering.MultiLineTextField.Click();
        var notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().Be(NotificationType.Error);
        notification.Message.Should().Be("The value entered is not a valid number and was not saved");
        Context.Pages.Editor.WaitForNotificationToDisappear();
        _dsItem.GetFieldValue(_numberFieldName).Should().Be(_defautlValue);
        CustomRendering.NumberField.Text.Should().Be(_defautlValue);
    }

    [Test]
    public void EditFieldInDifferentLanguage_ValuesFollowsIndividually()
    {
        var value = "223";
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.CustomComponent), language: "da");
        Context.Pages.Editor.TopBar.SelectLanguage("Danish");
        IItem dsItemInDa = Context.ApiHelper.PlatformGraphQlClient.GetItem(_testPage.path + "/Data/CustomDataSource 2");

        CustomRendering.NumberField.Click();
        Context.Pages.Editor.RightHandPanel.NumericalInput.SendKeys(value);
        NumberFieldLoosesFocusWithSave();
        dsItemInDa.GetFieldValue(_numberFieldName, language: "da").Should().Be(value);
        CustomRendering.NumberField.Text.Should().Be(value);

        Context.Pages.Editor.TopBar.SelectLanguage("English");
        NumberFieldValueUpdatedInCanvasAndRhs(_defautlValue);
    }

    [Test]
    public void UndoRedoActionsOnNumberField_HistoryIsTrackedProperly()
    {
        UpdateNumberFieldValue("1.23");
        NumberFieldLoosesFocusWithSave();
        UpdateNumberFieldValue("1.24");
        NumberFieldLoosesFocusWithSave();
        UpdateNumberFieldValue("1.25");
        NumberFieldLoosesFocusWithSave();
        Context.Pages.Editor.EditorHeader.Undo(false);
        NumberFieldValueUpdatedInCanvasAndRhs("1.24");
        Context.Pages.Editor.EditorHeader.Undo(false);
        NumberFieldValueUpdatedInCanvasAndRhs("1.23");
        Context.Pages.Editor.EditorHeader.Redo(false);
        NumberFieldValueUpdatedInCanvasAndRhs("1.24");
        Context.Pages.Editor.EditorHeader.Redo(false);
        NumberFieldValueUpdatedInCanvasAndRhs("1.25");
    }

    private static void NumberFieldLoosesFocusWithSave()
    {
        Context.Pages.Editor.RightHandPanel.LooseFocus();
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
    }

    private static void UpdateNumberFieldValue(string value)
    {
        CustomRendering.NumberField.Click();
        Context.Pages.Editor.RightHandPanel.NumericalInput.Click();
        Context.Pages.Editor.RightHandPanel.NumericalInput.Clear();
        if (value.Equals(string.Empty))
        {
            //Only Selenium send keys is not triggering a save action, hence the workaround.
            Context.Pages.Editor.RightHandPanel.NumericalInput.SendKeys(" ");
            Context.Pages.Editor.RightHandPanel.NumericalInput.Clear();
        }

        Context.Pages.Editor.RightHandPanel.NumericalInput.SendKeys(value);
        Context.Browser.WaitForHorizonIsStable();
    }

    private void NumberFieldValueUpdatedInCanvasAndRhs(string value)
    {
        CustomRendering.NumberField.Click();
        CustomRendering.NumberField.Text.Should().Be(value);
        Context.Pages.Editor.RightHandPanel.NumericalInput.Value().Should().Be(value);
        _dsItem.GetFieldValue(_numberFieldName).Should().Be(value);
    }
}
