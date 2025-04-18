// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.FieldsEditing;

public class EditDisplayName : BaseFixture
{
    private readonly string _displayNameFieldName = "__Display name";
    private readonly string _englishDisplayName = "Page EN version";
    private readonly string _danishDisplayName = "Page DA version";
    private readonly string _updatedDisplayName = "Sample Page Renamed";
    private Item _testPage;


    [SetUp]
    public void CreatePage()
    {
        _testPage = Preconditions.CreateAndOpenPage(_englishDisplayName);
    }

    [Test]
    public void EditDisplayNameOfItem()
    {
        PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
            .InvokeContextMenu().InvokePageDetailsDialog();

        pageDetails.EnterDisplayName(_updatedDisplayName);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(_updatedDisplayName);
        Context.ApiHelper.PlatformGraphQlClient.GetItemFieldValue(_testPage.path, _displayNameFieldName).Should().BeEquivalentTo(_updatedDisplayName);

        Context.Pages.Editor.RightHandPanel.HeaderText.Should().Be(_updatedDisplayName);
    }

    [Test]
    public void ChangeDisplayNameForDifferentLanguage()
    {
        // Add page version for da language
        Context.ApiHelper.PlatformGraphQlClient.AddItemVersion(_testPage.path, "da");
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(_testPage.itemId, _displayNameFieldName, _danishDisplayName, "da");

        // Change language
        Context.Pages.Editor.TopBar.SelectLanguage("Danish");

        PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
            .InvokeContextMenu().InvokePageDetailsDialog();

        pageDetails.EnterDisplayName(_updatedDisplayName);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(_updatedDisplayName);
        Context.ApiHelper.PlatformGraphQlClient.GetItemFieldValue(_testPage.path, _displayNameFieldName, "da").Should().BeEquivalentTo(_updatedDisplayName);

        Context.Pages.Editor.RightHandPanel.HeaderText.Should().Be(_updatedDisplayName);

        // Change language
        Context.Pages.Editor.TopBar.SelectLanguage("English");

        
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(_englishDisplayName);
        Context.ApiHelper.PlatformGraphQlClient.GetItemFieldValue(_testPage.path, _displayNameFieldName, "en").Should().BeEquivalentTo(_englishDisplayName);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().Be(_englishDisplayName);
    }

    [Test]
    public void EnterEmptyStringAsDisplayName_DisplayNameRemoved()
    {
        // Change display name
        PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
            .InvokeContextMenu().InvokePageDetailsDialog();
        pageDetails.EnterDisplayName("");


        Context.ApiHelper.PlatformGraphQlClient.GetItemFieldValue(_testPage.path, _displayNameFieldName).Should().BeOneOf("", _testPage.name);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(_testPage.name);

        Context.Pages.Editor.RightHandPanel.HeaderText.Should().Be(_testPage.name);
    }

    [Test]
    public void EnterItemNameAsDisplayName_DisplayNameUpdated()
    {
        // Change display name
        PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
            .InvokeContextMenu().InvokePageDetailsDialog();

        pageDetails.EnterDisplayName(_testPage.name);

        Context.ApiHelper.PlatformGraphQlClient.GetItemFieldValue(_testPage.path, _displayNameFieldName).Should().BeEquivalentTo(_testPage.name);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(_testPage.name);

        Context.Pages.Editor.RightHandPanel.HeaderText.Should().Be(_testPage.name);
    }

    [Test]
    public void UserCannotEditDisplayNameOfDeletedItem()
    {
        // Invoke display name
        PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
            .InvokeContextMenu().InvokePageDetailsDialog();


        // Delete item
        Context.ApiHelper.PlatformGraphQlClient.DeleteItem(_testPage.itemId);

        pageDetails.EnterDisplayName(_updatedDisplayName);


        // Check error appears
        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().Be(NotificationType.Error);
        notification.Message.Should().Be("Renaming failed. Try again. If the error reoccurs, contact your system administrator.");
        Context.Pages.Editor.WaitForNotificationToDisappear();
        Context.TestItems.Remove(_testPage.name);
    }

    [Test]
    [Category("Bug2569")]
    public void RenameShouldNotBeAvailableWhenUserHasNoRights()
    {
        // Restrict write access for _testPage
        Context.ApiHelper.PlatformGraphQlClient.DenyRenameAccess(_testPage.itemId, TestRunSettings.UserEmail);

        // reselect page to apply api changes
        Context.Pages.Editor.LeftHandPanel.SelectPage("Home");
        Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.displayName);

        // check that Display name is disabled
        PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
            .InvokeContextMenu().InvokePageDetailsDialog();

        pageDetails.IsDisplayNameEnabled.Should().BeFalse();
    }

    [Test]
    public void RenameShouldNotBeAvailableWhenItemIsLocked()
    {
        //Lock item
        string value = $"<r owner=\"sitecore\\randomUser\" date=\"{DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ")}\" />";
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(_testPage.itemId, "__Lock", value);

        // reselect page to apply api changes
        Context.Pages.Editor.LeftHandPanel.SelectPage("Home");
        Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.displayName);

        // check that Display name is disabled
        PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
            .InvokeContextMenu().InvokePageDetailsDialog();

        pageDetails.IsDisplayNameEnabled.Should().BeFalse();
    }

    [TearDown]
    public void CloseDialog()
    {
        Context.Pages.Editor.PageDetails.Close();
    }
}
