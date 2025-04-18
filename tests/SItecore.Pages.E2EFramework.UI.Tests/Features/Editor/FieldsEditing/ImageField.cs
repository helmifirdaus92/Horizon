// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.FieldsEditing;

public class ImageField : BaseFixture
{
    private readonly string _mediaLibraryPath = $"/sitecore/media library/Project/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}";
    private Item _testPage;
    private Item _imageDataItem;

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

        Context.ApiHelper.PlatformGraphQlClient.GetItem(DefaultScData.RenderingDataSourceTemplatePath(DefaultScData.SxaRenderings.Image) + "/Image/Image")
            .SetFieldValue("Source", "query:$siteMedia");

        _testPage = Preconditions.CreatePage();
        Preconditions.AddComponent(_testPage.itemId, _testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Image));

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);

        _imageDataItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{_testPage.path}/Data/Image 1");
    }

    [Test]
    public void FieldsCheck_ImageFieldIsEmpty()
    {
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();

        // Browse media link is visible
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.AddButton.Text.Should().BeEquivalentTo("Browse media library");

        // Thumbnail image absent if image field is empty
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImageAltText.Should().Be("upload image");
    }

    [Test]
    public void FieldsCheck_ImageFieldNotEmpty()
    {
        Item image = CreateImageItem("Image", "png");
        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(image.itemId));

        Context.Pages.Editor.EditorHeader.ReloadCanvas();

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Browser.WaitForHorizonIsStable();

        // Buttons state when Image field has value
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.GetTextOfAddChangeImageButton().Should().BeEquivalentTo("Change Image");
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.IsClearButtonEnabled().Should().BeTrue();

        // Thumbnail image is present if image field has value
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEquivalentTo(_mediaLibraryPath.Replace("/sitecore/media library", "") + "/Image");

        // Check Alt Text
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImageAltText.Should().Be("some alt text");
    }

    [Test]
    public void AltTextIsRetrievedCorrectlyBasedOnTheLanguage()
    {
        Item image = CreateImageItem("Image", "png");
        image.AddVersion("da");
        image.SetFieldValue("Alt", "danish alt", "da");
        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(image.itemId));
        _imageDataItem.AddVersion("da");
        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(image.itemId), "da");
        _testPage.AddVersion("da");
        _testPage.SetFieldValue("__Final Renderings", _testPage.GetFieldValue("__Final Renderings"), "da");

        Context.Pages.Editor.TopBar.SelectLanguage("Danish");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.WaitForCondition(e => e.IsVisible);

        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImageAltText.Should().Be("danish alt");
    }

    [Test]
    public void ImageFieldIsSavedBasedOnLanguageVersion()
    {
        Item image = CreateImageItem("ImageForDanish", "jpg");
        _testPage.AddVersion("da");
        _testPage.SetFieldValue("__Final Renderings", _testPage.GetFieldValue("__Final Renderings"), "da");

        Context.Pages.Editor.TopBar.SelectLanguage("Danish");
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();

        Context.Pages.Editor.RightHandPanel.ImageElementOptions.SetImagePath($"/Project/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}/{image.name}");

        var notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Success);
        notification.Message.Should().BeEquivalentTo("Version 1 for \"Image 1\" was automatically created");

        _imageDataItem.GetFieldValue("Image", "da").Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(image.itemId));
        _imageDataItem.GetFieldValue("Image", "en").Should().BeEmpty();

        Context.Pages.Editor.TopBar.SelectLanguage("English");
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEmpty();
    }

    [Test]
    public void ImageFieldGetsUpdatedBasedOnImagePath()
    {
        Item image = Preconditions.CreateItem("Image", Context.ApiHelper.PlatformGraphQlClient.GetItem(_mediaLibraryPath).itemId, DefaultScData.UnversionedImageTemplateId);

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.SetImagePath(_mediaLibraryPath.Replace("/sitecore/media library", "") + "/Image");
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();

        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImageSource.Should().Contain(image.itemId.ToUpper());
        _imageDataItem.GetFieldValue("Image").Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(image.itemId));
    }

    [Test]
    public void NotBeAbleToSpecifyImageOutsideSource()
    {
        Item image = CreateImageItem("ImageOutOfSource", "jpg");
        string imagePath = image.path.Replace("/sitecore/media library", "");
        Context.ApiHelper.PlatformGraphQlClient.GetItem(DefaultScData.RenderingDataSourceTemplatePath(DefaultScData.SxaRenderings.Image) + "/Image/Image")
            .SetFieldValue("Source", $"{_mediaLibraryPath}/System");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.SetImagePath(imagePath);

        var notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Error);
        notification.Message.Should().BeEquivalentTo(Constants.PreventOperationFromCompletingErrMsg);

        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePathFieldHasRedBorder().Should().BeTrue();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEquivalentTo(imagePath);
        _imageDataItem.GetFieldValue("Image").Should().BeEmpty();
    }

    [Test]
    public void TimedNotificationSsThrownIfImagePathIsInvalid()
    {
        string imagePath = "invalidpath/*-+!@#$%^";

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.SetImagePath(imagePath);

        var notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Error);
        notification.Message.Should().BeEquivalentTo(Constants.ImageDoesNotExistErrMsg);
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePathFieldHasRedBorder().Should().BeTrue();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEquivalentTo(imagePath);
        _imageDataItem.GetFieldValue("Image").Should().BeEmpty();
    }

    [Test]
    public void TimedNotificationIsThrownIfImagePathIsNotAnImage()
    {
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.SetImagePath(_testPage.path);

        var notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Error);
        notification.Message.Should().BeEquivalentTo(Constants.ItemNotAnImageErrMsg);
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePathFieldHasRedBorder().Should().BeTrue();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEquivalentTo(_testPage.path);
        _imageDataItem.GetFieldValue("Image").Should().BeEmpty();
    }

    [Test]
    public void ImageFieldSizeUpdatesWhenImagePathIsUpdated()
    {
        Item smallImage = CreateImageItem("ImageSmall", "jpg", "200", "200");
        Item bigImage = CreateImageItem("ImageBig", "jpg", "300", "300");

        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(smallImage.itemId));
        Context.Pages.Editor.EditorHeader.ReloadCanvas();

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Browser.WaitForHorizonIsStable();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEquivalentTo(smallImage.path.Replace("/sitecore/media library", ""));
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.SetImagePath(bigImage.path.Replace("/sitecore/media library", ""));
        Context.Browser.WaitForHorizonIsStable();

        _imageDataItem.GetFieldValue("Image").Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(bigImage.itemId));

        var imageRendering = Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container;
        imageRendering.GetDomAttribute("width").Should().BeEquivalentTo("300");
        imageRendering.GetDomAttribute("height").Should().BeEquivalentTo("300");
    }

    [Test]
    public void RedoChangesInImageField()
    {
        Item image1 = CreateImageItem("Image1", "jpg");
        Item image2 = CreateImageItem("Image2", "jpg");
        Item image3 = CreateImageItem("Image3", "jpg");

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.SetImagePath(image1.path.Replace("/sitecore/media library", ""));
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.SetImagePath(image2.path.Replace("/sitecore/media library", ""));
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.SetImagePath(image3.path.Replace("/sitecore/media library", ""));

        Context.Pages.Editor.EditorHeader.Undo(false);
        _imageDataItem.GetFieldValue("Image").Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(image2.itemId));

        Context.Pages.Editor.EditorHeader.Undo(false);
        _imageDataItem.GetFieldValue("Image").Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(image1.itemId));

        Context.Pages.Editor.EditorHeader.Redo(false);
        _imageDataItem.GetFieldValue("Image").Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(image2.itemId));

        Context.Pages.Editor.EditorHeader.Redo(false);
        _imageDataItem.GetFieldValue("Image").Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(image3.itemId));
    }

    [Test]
    public void UndoRedoAfterClearingImage()
    {
        Item image = CreateImageItem("UndoRedo", "jpg");
        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(image.itemId));
        Context.Pages.Editor.EditorHeader.ReloadCanvas();

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.WaitForCondition(e => e.IsVisible);
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ClearImage();
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();

        _imageDataItem.GetFieldValue("Image").Should().BeEmpty();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEmpty();

        Context.Pages.Editor.EditorHeader.Undo(false);
        _imageDataItem.GetFieldValue("Image").Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(image.itemId));
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEquivalentTo(image.path.Replace("/sitecore/media library", ""));
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImageSource.Should().Contain(image.itemId.ToUpper());

        Context.Pages.Editor.EditorHeader.Redo(false);
        _imageDataItem.GetFieldValue("Image").Should().BeEmpty();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEmpty();
    }

    [Test]
    public void ClearImageViaRemovingImagePath()
    {
        Item image = CreateImageItem("ClearImageViaPathField", "jpg");
        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(image.itemId));
        Context.Pages.Editor.EditorHeader.ReloadCanvas();

        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePathInput.SendKeys(Keys.Control + "a");
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePathInput.SendKeys(Keys.Delete);
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePathInput.SendKeys(Keys.Enter);
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();

        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEmpty();
        _imageDataItem.GetFieldValue("Image").Should().BeEmpty();
    }

    [Test]
    public void ClearImageForSpecificLanguage()
    {
        Item image = Preconditions.UploadImage(
            "ClearImageViaPathField",
            "jpg",
            Context.ApiHelper.PlatformGraphQlClient.GetItem($"/sitecore/media library/Project/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}"));

        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(image.itemId));
        _imageDataItem.AddVersion("da");
        _imageDataItem.SetFieldValue("Image", Wrappers.Helpers.FormImageSourceString(image.itemId), "da");
        _testPage.AddVersion("da");
        _testPage.SetFieldValue("__Final Renderings", _testPage.GetFieldValue("__Final Renderings"), "da");

        Context.Pages.Editor.TopBar.SelectLanguage("Danish");
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.WaitForCondition(e => e.IsVisible);
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ClearImage();
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity(120);// First save on the language takes longer to save.
        Context.Browser.WaitForHorizonIsStable();

        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEmpty();
        _imageDataItem.GetFieldValue("Image", "da").Should().BeEmpty();

        Context.Pages.Editor.TopBar.SelectLanguage("English");
        Context.Pages.Editor.CurrentPage.Renderings.FirstOrDefault().ImageField.Container.Click();
        Context.Browser.WaitForHorizonIsStable();
        _imageDataItem.GetFieldValue("Image").Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(image.itemId));
        Context.Pages.Editor.RightHandPanel.ImageElementOptions.ImagePath.Should().BeEquivalentTo(image.path.Replace("/sitecore/media library", ""));
    }

    private Item CreateImageItem(string name, string extension, string width = "150", string height = "150", string alt = "some alt text")
    {
        Item image = Preconditions.CreateItem(name, Context.ApiHelper.PlatformGraphQlClient.GetItem(_mediaLibraryPath).itemId, DefaultScData.UnversionedImageTemplateId);
        image.SetFieldValue("Width", width);
        image.SetFieldValue("Height", height);
        image.SetFieldValue("Alt", alt);
        image.SetFieldValue("Extension", extension);
        image.SetFieldValue("Mime Type", $"image/{extension}");
        return image;
    }
}
