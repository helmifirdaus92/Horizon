// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.FieldsEditing;

public class ImagesDialog : BaseFixture
{
    private string _mediaLibraryPath = $"/sitecore/media library/Project/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}";
    private Item _testPage;
    private Item _imageDataItem;
    private Item _mediaFolder;
    private Item _image;

    [OneTimeSetUp]
    public void OpenSXASite()
    {
        Preconditions.OpenSXAHeadlessSite();
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    [SetUp]
    public void CreatePageAndAddComponent()
    {
        Preconditions.SelectPageByNameFromSiteTree("Home");
        if (Context.Pages.Editor.TopBar.GetSelectedLanguage() != "English")
        {
            Context.Pages.Editor.TopBar.SelectLanguage("English");
            if (Context.Pages.Editor.TimedNotificationExists())
            {
                Context.Pages.Editor.TimedNotification.Close();
            }
        }

        _testPage = Preconditions.CreatePage();
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Image));

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);

        _imageDataItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{_testPage.path}/Data/Image 1");
        _mediaFolder = Preconditions.CreateFolder("ImagesFolder"+DataHelper.RandomString(), parentId: Context.ApiHelper.PlatformGraphQlClient.GetItem(_mediaLibraryPath).itemId);
        _image = Preconditions.UploadImage("TestImageDialog", "jpg", _mediaFolder, "image alt");
        Preconditions.WaitForImageToBeIndexed(_mediaFolder.path, _image.name);
    }

    [TearDown]
    public void ResetImageSource()
    {
        Context.ApiHelper.PlatformGraphQlClient.GetItem(DefaultScData.RenderingDataSourceTemplatePath(DefaultScData.SxaRenderings.Image) + "/Image/Image")
            .SetFieldValue("Source", "query:$siteMedia");
    }

    [Test]
    public void SetImageViaDialog()
    {
        string path = _image.path.Replace("/sitecore/media library", "");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        var imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeImageDialog();
        imageDialog.ImagesTree.GetAllVisibleItems().First(i => i.Name == _mediaFolder.name).Container.Click();
        imageDialog.Container.GetDriver().WaitForHorizonIsStable();

        imageDialog.SelectImage(_image.name);

        SelectedImageDetails selectedDetails = imageDialog.SelectedImageDetails;
        selectedDetails.FileName.Should().Be(_image.name);
        selectedDetails.FileType.Should().Be("jpg");
        selectedDetails.FileSize.Should().Be("2 KB");
        selectedDetails.Dimensions.Should().Be("150 x 150 px");
        selectedDetails.Path.Should().Be(path);
        selectedDetails.AlternativeText.Should().Be("image alt");

        imageDialog.AddSelectedImage();

        _imageDataItem.GetFieldValue("Image").Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(_image.itemId));
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEquivalentTo(path);
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImageAltText.Should().Be("image alt");

        imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeChangeImageDialog();
        imageDialog.ImagesTree.SelectedItem.Name.Should().Be(_mediaFolder.name, "Expect parent of selected image to be selected");
        imageDialog.SelectedImageDetails.FileName.Should().Be(_image.name, "expect default image to be selected");
        imageDialog.GetHighlightedImage.Should().Contain(_image.name);

        imageDialog.Close();
    }

    [Test]
    public void DeletedImageCannotBeAddedToThePage()
    {
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();

        var imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeImageDialog();
        imageDialog.ImagesTree.GetAllVisibleItems().First(i => i.Name == _mediaFolder.name).Container.Click();

        Context.ApiHelper.PlatformGraphQlClient.DeleteItem(_image.itemId);

        imageDialog.SelectImage(_image.name);
        imageDialog.IsAddSelectedEnabled().Should().BeFalse();

        Context.Browser.GetDriver().WaitForCondition(i =>
        {
            imageDialog.Refresh();
            return imageDialog.GetImages().Find(im => im == _image.name) == null;
        }, TimeSpan.FromSeconds(2), 200);

        imageDialog.ImagesList.Text.Should().BeEquivalentTo("No media files in this folder.");

        imageDialog.Cancel();
    }

    [Test]
    public void SourceIsSetToSomePath()
    {
        Context.ApiHelper.PlatformGraphQlClient.GetItem(DefaultScData.RenderingDataSourceTemplatePath(DefaultScData.SxaRenderings.Image) + "/Image/Image")
            .SetFieldValue("Source", $"{_mediaLibraryPath}/{_mediaFolder.name}");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        var imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeImageDialog();

        imageDialog.ImagesTree.SelectedItem.Name.Should().BeEquivalentTo(_mediaFolder.name);

        imageDialog.GetImages().Count.Should().Be(1);
        imageDialog.GetImages().Should().Contain(_image.name);

        imageDialog.Cancel();
    }

    [Test]
    public void SelectedImageInFieldIsNotUnderSource()
    {
        var anotherFolder = Preconditions.CreateFolder("ImagesFolder2", parentId: Context.ApiHelper.PlatformGraphQlClient.GetItem(_mediaLibraryPath).itemId);
        Item image1 = Preconditions.UploadImage("image1", "jpg", _mediaFolder);
        Item image2 = Preconditions.UploadImage("image2", "jpg", _mediaFolder);
        Item image3 = Preconditions.UploadImage("image3", "jpg", anotherFolder);
        Preconditions.WaitForImageToBeIndexed(_mediaLibraryPath, image3.name);

        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(image1.itemId));
        Context.Pages.Editor.EditorHeader.ReloadCanvas();

        Context.ApiHelper.PlatformGraphQlClient.GetItem(DefaultScData.RenderingDataSourceTemplatePath(DefaultScData.SxaRenderings.Image) + "/Image/Image")
            .SetFieldValue("Source", $"{_mediaLibraryPath}/{anotherFolder.name}");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.WaitForCondition(e => e.IsVisible);
        var imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeChangeImageDialog();
        imageDialog.ImagesTree.SelectedItem.Name.Should().BeEquivalentTo(anotherFolder.name);

        List<string> images = imageDialog.GetImages();
        images.Count.Should().Be(2);
        images.Should().Contain(image1.name);
        images.Should().Contain(image3.name);
        images.Should().NotContain(image2.name);
        imageDialog.GetHighlightedImage.Should().BeEquivalentTo(image1.name);

        imageDialog.SelectImage(image3.name);
        SelectedImageDetails selectedDetails = imageDialog.SelectedImageDetails;
        selectedDetails.FileName.Should().Be(image3.name);
        selectedDetails.FileType.Should().Be("jpg");
        selectedDetails.FileSize.Should().Be("2 KB");
        selectedDetails.Dimensions.Should().Be("150 x 150 px");
        selectedDetails.Path.Should().Be(image3.path.Replace("/sitecore/media library", ""));
        selectedDetails.AlternativeText.Should().Be($"{image3.name}.jpg");

        imageDialog.AddSelectedImage();

        _imageDataItem.GetFieldValue("Image").Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(image3.itemId));
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEquivalentTo(image3.path.Replace("/sitecore/media library", ""));
    }

    [Test]
    public void SourceHasInaccessiblePath_ErrorAppears()
    {
        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(_image.itemId));
        Context.Pages.Editor.EditorHeader.ReloadCanvas();

        Context.ApiHelper.PlatformGraphQlClient.GetItem(DefaultScData.RenderingDataSourceTemplatePath(DefaultScData.SxaRenderings.Image) + "/Image/Image")
            .SetFieldValue("Source", $"{_mediaLibraryPath}/nonexistent");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.WaitForCondition(e => e.IsVisible);
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.DisplayChangeImageButton().Click();

        var notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Error);
        notification.Message.Should().BeEquivalentTo(Constants.SourceFieldIsInvalidErrMsg);
        Context.Pages.Editor.WaitForNotificationToDisappear();
    }

    [Test]
    public void DetailsInMediaLibraryShownAccordingToLanguage()
    {
        const string ImageDanishDisplayName = "ImageDanishDisplayName";
        _mediaFolder.AddVersion("da");
        _mediaFolder.SetFieldValue("__Display name", "folderDanishDisplayName", "da");
        _image.AddVersion("da");
        _image.SetFieldValue("Alt", "danish alt", "da");
        _image.SetFieldValue("__Display name", ImageDanishDisplayName, "da");
        _testPage.AddVersion("da");
        _testPage.SetFieldValue("__Final Renderings", _testPage.GetFieldValue("__Final Renderings"), "da");


        Preconditions.WaitForImageToBeIndexed(_mediaFolder.itemId, ImageDanishDisplayName, language:"da");

        Context.Pages.Editor.TopBar.SelectLanguage("Danish");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        var imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeImageDialog();
        imageDialog.ImagesTree.GetAllVisibleItems().First(i => i.Name == "folderDanishDisplayName").Container.Click();

        //re-fetch the image dialog to get the updated image list
        imageDialog = Context.Pages.Editor.MediaDialog;
        imageDialog.SelectImage(ImageDanishDisplayName);

        SelectedImageDetails selectedDetails = imageDialog.SelectedImageDetails;
        selectedDetails.FileName.Should().Be(ImageDanishDisplayName);
        selectedDetails.AlternativeText.Should().Be("danish alt");

        imageDialog.AddSelectedImage();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImageAltText.Should().Be("danish alt");
        Context.Pages.Editor.WaitForNotificationToDisappear();
    }

    [Test]
    public void ExpandMediaLibraryTreeItemOnSelect()
    {
        Item childFolder = Preconditions.CreateFolder("childFolder", parentId: _mediaFolder.itemId);
        Item newImage = Preconditions.UploadImage("NewImage", "jpg", childFolder);
        Preconditions.WaitForImageToBeIndexed(_mediaFolder.path, newImage.name);

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        var imageDialog = Context.Pages.Editor.RightHandPanel.ImageElementOptions.InvokeImageDialog();

        imageDialog.ImagesTree.GetAllVisibleItems().Find(i => i.Name == _mediaFolder.name).Container.Click();
        List<TreeItem> children = imageDialog.ImagesTree.SelectedItem.GetVisibleChildren().ToList();
        children.Count().Should().Be(1);
        children.FirstOrDefault().Container.Click();

        imageDialog.Container.GetDriver().WaitForHorizonIsStable();
        imageDialog.WaitForImagePresent(newImage.name);
        imageDialog.SelectImage(newImage.name);
        imageDialog.SelectedImageDetails.Path.Should().Be(newImage.path.Replace("/sitecore/media library", ""));

        imageDialog.Close();
    }
}
