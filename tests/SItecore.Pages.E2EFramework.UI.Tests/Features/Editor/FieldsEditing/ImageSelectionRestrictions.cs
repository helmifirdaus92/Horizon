// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.FieldsEditing;

public class ImageSelectionRestrictions : BaseFixture
{
    private Item _testPage;
    private Item _mediaFolder;
    private Item _imageDataItem;
    private Item _image;

    [OneTimeSetUp]
    public void UploadImage()
    {
        _testPage = Preconditions.CreatePage(doNotDelete: true);
        _mediaFolder = Preconditions.CreateFolder("ImagesFolder" +DataHelper.RandomString(), parentId: Context.ApiHelper.PlatformGraphQlClient.GetItem($"/sitecore/media library/Project/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}").itemId, doNotDelete: true);
        _image = Preconditions.UploadImage("Test image", "jpg", _mediaFolder, "image alt", doNotDelete: true);

        Preconditions.OpenSXAHeadlessSite();
        Preconditions.SelectPageByNameFromSiteTree("Home");
        Preconditions.OpenEnglishLanguage();
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();

        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Image));

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);

        _imageDataItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{_testPage.path}/Data/Image 1");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
    }

    [TearDown]
    public void AllowAccess()
    {
        Context.ApiHelper.PlatformGraphQlClient.GetItem(DefaultScData.RenderingDataSourceTemplatePath(DefaultScData.SxaRenderings.Image) + "/Image/Image")
            .SetFieldValue("Source", "query:$siteMedia");

        _imageDataItem.SetFieldValue("Image", "");

        Context.ApiHelper.PlatformGraphQlClient.AllowReadAccess(_mediaFolder.itemId, TestRunSettings.UserEmail);
        Context.ApiHelper.PlatformGraphQlClient.AllowReadAccess(_image.itemId, TestRunSettings.UserEmail);
    }

    [Test]
    public void UserUnableToSelectImageWithoutReadAccess()
    {
        Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(_image.itemId, TestRunSettings.UserEmail);

        Context.Pages.Editor.RightHandPanel.ImageElementOptions.SetImagePath(_image.path.Replace("/sitecore/media library", ""));

        var notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Error);
        notification.Message.Should().BeEquivalentTo(Constants.ImageDoesNotExistErrMsg);
        Context.Pages.Editor.WaitForNotificationToDisappear();

        _imageDataItem.GetFieldValue("Image").Should().BeEmpty();
    }

    [Test]
    public void FolderWithoutAccessIsNotShownInTheMediaLibraryTree()
    {
        Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(_mediaFolder.itemId, TestRunSettings.UserEmail);

        MediaDialog imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeImageDialog();
        imageDialog.ImagesTree.GetAllVisibleItems().Find(i => i.Name == _mediaFolder.name).Should().BeNull();

        imageDialog.Close();
    }

    [Test]
    public void ErrorNotificationAppearsIfUserDoesNotHaveAccessToSourceFolder()
    {
        Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(_mediaFolder.itemId, TestRunSettings.UserEmail);
        Context.ApiHelper.PlatformGraphQlClient.GetItem(DefaultScData.RenderingDataSourceTemplatePath(DefaultScData.SxaRenderings.Image) + "/Image/Image")
            .SetFieldValue("Source", _mediaFolder.path);

        Context.Pages.Editor.RightHandPanel.ImageElementOptions.AddButton.Click();

        var notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Error);
        notification.Message.Should().BeEquivalentTo(Constants.SourceFieldIsInvalidErrMsg);
        Context.Pages.Editor.WaitForNotificationToDisappear();
    }

    [Test]
    public void ErrorNotificationAppearsIfUserDoesNotHaveAccessToSourceItem()
    {
        Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(_image.itemId, TestRunSettings.UserEmail);
        Context.ApiHelper.PlatformGraphQlClient.GetItem(DefaultScData.RenderingDataSourceTemplatePath(DefaultScData.SxaRenderings.Image) + "/Image/Image")
            .SetFieldValue("Source", _image.path);

        Context.Pages.Editor.RightHandPanel.ImageElementOptions.AddButton.Click();

        var notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Error);
        notification.Message.Should().BeEquivalentTo(Constants.SourceFieldIsInvalidErrMsg);
        Context.Pages.Editor.WaitForNotificationToDisappear();
    }

    [Test]
    public void DefaultImageAncestorsFallsBackToSourceIfNoAccessToSelectedImage()
    {
        Item childFolder = Preconditions.CreateFolder("ChildFolder", parentId: _mediaFolder.itemId);
        Item secondImage = Preconditions.UploadImage("Second image", "jpg", childFolder, "second image alt");

        Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(childFolder.itemId, TestRunSettings.UserEmail);
        Context.ApiHelper.PlatformGraphQlClient.GetItem(DefaultScData.RenderingDataSourceTemplatePath(DefaultScData.SxaRenderings.Image) + "/Image/Image")
            .SetFieldValue("Source", _mediaFolder.path);

        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(secondImage.itemId));

        MediaDialog imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeImageDialog();
        imageDialog.ImagesTree.GetAllVisibleItems().Count.Should().Be(1);
        imageDialog.ImagesTree.SelectedItem.Name.Should().BeEquivalentTo(_mediaFolder.name);
        imageDialog.GetImages().Count.Should().Be(1);
        imageDialog.GetImages().FirstOrDefault().Should().Be(_image.name);
        imageDialog.SelectedImageDetails.ThumbnailSource.Should().Contain("image-icon.svg");
        imageDialog.Close();
    }

    [Test]
    public void MediaDialogFallsBackToSourceFolderIfUserDoesNotHaveAccessToSomeOfSelectedImageAncestors()
    {
        Item childFolder = Preconditions.CreateFolder("ChildFolder", parentId: _mediaFolder.itemId);
        Item grandChildFolder = Preconditions.CreateFolder("GrandChildFolder", parentId: childFolder.itemId);
        Item secondImage = Preconditions.UploadImage("Second image", "jpg", grandChildFolder, "second image alt");

        Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(childFolder.itemId, TestRunSettings.UserEmail);
        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(secondImage.itemId));

        MediaDialog imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeImageDialog();
        var folders = imageDialog.ImagesTree.GetAllVisibleItems();
        folders.Exists(i => i.Name == _mediaFolder.name).Should().BeTrue();
        folders.Exists(i => i.Name == childFolder.name).Should().BeFalse();
        folders.Exists(i => i.Name == grandChildFolder.name).Should().BeFalse();
        imageDialog.ImagesTree.SelectedItem.Name.Should().BeEquivalentTo(Constants.SXAHeadlessSite);
        imageDialog.GetImages().Find(i => i == _image.name).Should().NotBeNull();
        imageDialog.GetImages().Find(i => i == secondImage.name).Should().BeNull();
        imageDialog.SelectedImageDetails.ThumbnailSource.Should().Contain("image-icon.svg");
        imageDialog.Close();
    }
}
