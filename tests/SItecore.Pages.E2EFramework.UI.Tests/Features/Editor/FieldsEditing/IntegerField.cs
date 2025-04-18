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

public class IntegerField : BaseFixture
{
    private readonly string _integerFieldName = "Integer";
    private readonly string _defautlValue = "123";
    private readonly string _invalidValue = "abc123456789";

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

        //Set a default value in integer field
        _dsItem.SetFieldValue(_integerFieldName, _defautlValue, language: "en");
        Context.Pages.Editor.ReloadCanvas();
    }

    [TestCase("2147483647")]
    [TestCase("")]
    public void EditValue_AutoSavedUponLooseFocus(string value)
    {
        UpdateIntegerFieldValue(value);
        IntegerFieldLoosesFocusWithSave();
        _dsItem.GetFieldValue(_integerFieldName).Should().Be(value);
        CustomRendering.IntegerField.Text.Should().Be(value.Equals(string.Empty) ? "[No text in field]" : value);
    }

    [Test]
    public void EnterInvalidValue_ErrorMessageDisplayedOnSaveAttempt()
    {
        UpdateIntegerFieldValue(_invalidValue);
        Context.Pages.Editor.RightHandPanel.NumberInputValidationErrorMessage.Should().Be($"\"{_invalidValue}\" is not a valid integer");
        Context.Pages.Editor.RightHandPanel.LooseFocus();
        CustomRendering.MultiLineTextField.Click();
        var notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().Be(NotificationType.Error);
        notification.Message.Should().Be("The value entered is not a valid integer and was not saved");
        Context.Pages.Editor.WaitForNotificationToDisappear();
        _dsItem.GetFieldValue(_integerFieldName).Should().Be(_defautlValue);
        CustomRendering.IntegerField.Text.Should().Be(_defautlValue);
    }

    [Test]
    public void EditFieldInDifferentLanguage_ValuesFollowsIndividually()
    {
        var value = "762383";
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.CustomComponent), language: "da");
        Context.Pages.Editor.TopBar.SelectLanguage("Danish");
        IItem dsItemInDa = Context.ApiHelper.PlatformGraphQlClient.GetItem(_testPage.path + "/Data/CustomDataSource 2");

        CustomRendering.IntegerField.Click();
        Context.Pages.Editor.RightHandPanel.NumericalInput.SendKeys(value);
        IntegerFieldLoosesFocusWithSave();
        dsItemInDa.GetFieldValue(_integerFieldName, language: "da").Should().Be(value);
        CustomRendering.IntegerField.Text.Should().Be(value);

        Context.Pages.Editor.TopBar.SelectLanguage("English");
        IntegerValueUpdatedInCanvasAndRhs(_defautlValue);
    }

    [Test]
    public void EditIntegerAndNumberFieldSuccessively_ValueSavedAccordingly()
    {
        UpdateIntegerFieldValue("111");
        CustomRendering.NumberField.Click();
        Context.Pages.Editor.RightHandPanel.NumericalInput.SendKeys("19.23");
        IntegerValueUpdatedInCanvasAndRhs("111");
        CustomRendering.NumberField.Click();
        Context.Pages.Editor.RightHandPanel.NumericalInput.Value().Should().Be("19.23");
        _dsItem.GetFieldValue("Number").Should().Be("19.23");
    }

    [Test]
    public void UndoRedoActionsOnIntegerField_HistoryIsTrackedProperly()
    {
        UpdateIntegerFieldValue("11111");
        IntegerFieldLoosesFocusWithSave();
        UpdateIntegerFieldValue("22222");
        IntegerFieldLoosesFocusWithSave();
        UpdateIntegerFieldValue("33333");
        IntegerFieldLoosesFocusWithSave();
        Context.Pages.Editor.EditorHeader.Undo(false);
        IntegerValueUpdatedInCanvasAndRhs("22222");
        Context.Pages.Editor.EditorHeader.Undo(false);
        IntegerValueUpdatedInCanvasAndRhs("11111");
        Context.Pages.Editor.EditorHeader.Redo(false);
        IntegerValueUpdatedInCanvasAndRhs("22222");
        Context.Pages.Editor.EditorHeader.Redo(false);
        IntegerValueUpdatedInCanvasAndRhs("33333");
    }

    private static void IntegerFieldLoosesFocusWithSave()
    {
        Context.Pages.Editor.RightHandPanel.LooseFocus();
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
    }

    private static void UpdateIntegerFieldValue(string value)
    {
        CustomRendering.IntegerField.Click();
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

    private void IntegerValueUpdatedInCanvasAndRhs(string value)
    {
        CustomRendering.IntegerField.Click();
        CustomRendering.IntegerField.Text.Should().Be(value);
        Context.Pages.Editor.RightHandPanel.NumericalInput.Value().Should().Be(value);
        _dsItem.GetFieldValue(_integerFieldName).Should().Be(value);
    }
}
