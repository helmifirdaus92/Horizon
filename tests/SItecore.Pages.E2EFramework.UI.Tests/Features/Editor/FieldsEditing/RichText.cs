// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.FieldsEditing;

public class RichText : BaseFixture
{
    private Item _testPage;

    [OneTimeSetUp]
    public void startTestsInEditorTestSite()
    {
        Preconditions.OpenSXAHeadlessSite();
        Preconditions.OpenEnglishLanguage();
    }

    [SetUp]
    public void CreateTestPageAndOpenInEditor()
    {
        //Create page
        _testPage = Preconditions.CreatePage();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();

        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText));

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(_testPage.name).Select();
    }

    [Test]
    public void FormatTextInRichTextField_FormattingIsSavedToItem()
    {
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "Start editing RTE";
        Context.Pages.Editor.CurrentPage.TextInputs[0].SetSelection("Start editing RTE");
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.Bold);
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain("<strong>Start editing RTE</strong>");
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();

        Context.Pages.Editor.CurrentPage.TextInputs[0].AppendText("Underlined Text");
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.CurrentPage.TextInputs[0].SetSelection("Underlined Text");
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.Underline);
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain("<u>Underlined Text</u>");
        Context.Pages.Editor.EditorHeader.Undo(false);
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().NotContain("<u>Underlined Text</u>").And.Contain("Underlined Text");
        Context.Pages.Editor.EditorHeader.Undo(false);
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().NotContain("Underlined Text").And.Contain("<strong>Start editing RTE</strong>");
        Context.Pages.Editor.EditorHeader.Redo(false);
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain("Underlined Text").And.NotContain("<u>Underlined Text</u>");
        Context.Pages.Editor.EditorHeader.Redo(false);
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain("<u>Underlined Text</u>");
    }

    [Test]
    public void ParentNavigationFromRTEController_ChipTileDisplayed()
    {
        //Validate parent navigation from RTE toolbar
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeFalse();
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "Start editing RTE";
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.GoToParent);
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name.Should().Be("Rich Text");
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.NavigateUp();
        Context.Pages.Editor.CurrentPage.SelectionFrame.ChipElement.Name.Should().Be("Main");
    }

    [Test]
    public void AddMediaToRTE_MediaDialogIsOpened()
    {
        //Validate Media dialog invoke from RTE controls
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeFalse();
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "Start editing RTE";
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.Insert);
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.SelectMedia);
        Context.Pages.Editor.MediaDialog.IsDisplayed.Should().BeTrue();
        Context.Pages.Editor.MediaDialog.Close();
    }

    [Test]
    public void LinkTargetOptions_EnterProneNumber()
    {
        string phoneNumber = "+12014306937";
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").Click();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.PhoneNumber);
        Context.Pages.Editor.AddPhoneNumberDialog.EnterPhoneNumber(phoneNumber).ClickSaveButton();
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain($"<a class=\"ck-link_selected\" href=\"#\">{phoneNumber}</a>");
    }

    [Test]
    public void LinkTargetOptions_SelectInternalLink()
    {
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").Click();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.InternalLink);

        var dialog = Context.Pages.Editor.InternalLinkDialog;
        dialog.ItemTree.GetAllVisibleItems().Find(i => i.Name == _testPage.name).Select();
        dialog.ClickAddLinkButton();

        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain(_testPage.name);
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain(_testPage.itemId.ToUpper());
    }

    [TestCase("add")]
    [TestCase("toggle")]
    [TestCase("cancel")]
    public void LinkTargetOptions_AddLink(string action)
    {
        string link = "https://www.google.com/";
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").Click();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.Link);

        var dialog = Context.Pages.Editor.AddLinkBalloon;
        dialog.LinkInput.Text = link;
        switch (action)
        {
            case "add":
                dialog.SaveButton.Click();
                break;
            case "toggle":
                dialog.OpenInNewTabButton.Click();
                dialog.SaveButton.Click();
                break;
            case "cancel":
                dialog.CancelButton.Click();
                break;
        }

        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();

        switch (action)
        {
            case "add":
                Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain($"<a href=\"{link}\">{link}</a>");
                break;
            case "toggle":
                Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain($"<a href=\"{link}\" target=\"_blank\">{link}</a>");
                break;
            case "cancel":
                Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().NotContain(link);
                break;
        }
    }

    [Test]
    public void LinkTargetOptions_AddEmailAsLink()
    {
        string email = "email@pages.com";
        Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").Click();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.Link);

        var dialog = Context.Pages.Editor.AddLinkBalloon;
        dialog.LinkInput.Text = email;
        dialog.SaveButton.Click();

        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain($"<a href=\"mailto:{email}\">mailto:{email}</a>");
    }
}
