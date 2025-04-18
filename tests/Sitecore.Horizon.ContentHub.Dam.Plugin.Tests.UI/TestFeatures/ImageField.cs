// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.Helpers;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ContentHub;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.MediaDialogs.ImagesDialog;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls;

namespace Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.TestFeatures
{
    public class ImageField : TestsBase
    {
        private ImagesDialog _dialog = null;
        private ContentHubMediaProvider _contentHubMediaProvider = null;
        private string _imageFieldName = "ImageField";

        [Test]
        public void AddImageFromDam()
        {
            //Arrange
            var page = SharedSteps.CreatePageWithAllFieldsTypes();
            Context.Editor.Open(page, site: "website");
            var fieldTemplate = page.Template.GetTemplateField(_imageFieldName);
            var field = Context.Editor.CurrentPage.GetFieldControl(fieldTemplate.Id, fieldTemplate.FieldType);
            field.Select();
            _dialog = Context.Editor.RightPanel.ImageFieldSection.InvokeImageDialog();

            //Act
            _contentHubMediaProvider = _dialog.SwitchToContentHubProvider();
            _contentHubMediaProvider.SelectImage("image1.jpg");
            _contentHubMediaProvider.ChooseFileToInsert(_dialog);
            _dialog.AddSelected();

            //Assert
            CheckImageIsUpdatedInCanvas(page, _imageFieldName, _contentHubMediaProvider.SelectedMediaUrl);
            CheckImageIsUpdatedInRHS(_contentHubMediaProvider.SelectedMediaUrl);
            page.GetFieldValue(_imageFieldName).Should().Contain(_contentHubMediaProvider.SelectedMediaUrl);
        }

        [Test]
        public void ImageIsPresentAfterReload()
        {
            //Arrange
            var page = SharedSteps.CreatePageWithAllFieldsTypes();
            Context.Editor.Open(page,site:"website");
            var fieldTemplate = page.Template.GetTemplateField(_imageFieldName);
            var field = Context.Editor.CurrentPage.GetFieldControl(fieldTemplate.Id, fieldTemplate.FieldType);
            field.Select();
            _dialog = Context.Editor.RightPanel.ImageFieldSection.InvokeImageDialog();

            //Act
            _contentHubMediaProvider = _dialog.SwitchToContentHubProvider();
            _contentHubMediaProvider.SelectImage("image1.jpg");
            _contentHubMediaProvider.ChooseFileToInsert(_dialog);
            _dialog.AddSelected();

            //Assert
            Context.Horizon.Browser.Refresh();
            field = Context.Editor.CurrentPage.GetFieldControl(fieldTemplate.Id, fieldTemplate.FieldType);
            field.Select();
            CheckImageIsUpdatedInCanvas(page, _imageFieldName, _contentHubMediaProvider.SelectedMediaUrl);
            CheckImageIsUpdatedInRHS(_contentHubMediaProvider.SelectedMediaUrl);
            page.GetFieldValue(_imageFieldName).Should().Contain(_contentHubMediaProvider.SelectedMediaUrl);
        }

        [Test]
        public void ImageDetailsAreShownInMediaDialogRhs()
        {
            //Arrange
            var page = SharedSteps.CreatePageWithAllFieldsTypes();
            Context.Editor.Open(page,site:"website");
            var fieldTemplate = page.Template.GetTemplateField(_imageFieldName);
            var field = Context.Editor.CurrentPage.GetFieldControl(fieldTemplate.Id, fieldTemplate.FieldType);
            field.Select();
            _dialog = Context.Editor.RightPanel.ImageFieldSection.InvokeImageDialog();
            _contentHubMediaProvider = _dialog.SwitchToContentHubProvider();
            _contentHubMediaProvider.SelectImage("image1.jpg");

            //Act & Assert
            _contentHubMediaProvider.ChooseFileToInsert(_dialog, "Original");
            CheckImageDetailsUpdatedInMediaDialogRHS(_contentHubMediaProvider.SelectedMediaUrl, "image1.jpg", "150 x 150 px");
        }

        [Test]
        public void ReplaceMediaLibraryImageWithContentHubImage()
        {
            //Arrange
            var page = SharedSteps.CreatePageWithAllFieldsTypes();
            var image = Context.ApiHelper.Items.MediaLibraryHelper.CreateUnversionedImage("platformImage.jpg", "/sitecore/media library", "some alt text :)");
            var imageItem = Context.ApiHelper.Items.GetItem(image.Path);
            page.Edit(_imageFieldName, FormImageSourceString(imageItem.ShortId));
            Context.Editor.Open(page,site:"website");
            var fieldTemplate = page.Template.GetTemplateField(_imageFieldName);
            var field = Context.Editor.CurrentPage.GetFieldControl(fieldTemplate.Id, fieldTemplate.FieldType);
            field.Select();
            _dialog = Context.Editor.RightPanel.ImageFieldSection.InvokeImageDialog();

            //Act
            _contentHubMediaProvider = _dialog.SwitchToContentHubProvider();
            _contentHubMediaProvider.SelectImage("image1.jpg");
            _contentHubMediaProvider.ChooseFileToInsert(_dialog);
            _dialog.AddSelected();

            //Assert
            CheckImageIsUpdatedInCanvas(page, _imageFieldName, _contentHubMediaProvider.SelectedMediaUrl);
            CheckImageIsUpdatedInRHS(_contentHubMediaProvider.SelectedMediaUrl);
            page.GetFieldValue(_imageFieldName).Should().Contain(_contentHubMediaProvider.SelectedMediaUrl);
        }

        [Test]
        public void ReplaceContentHubImageWithMediaLibraryImage()
        {
            //Arrange
            var image = Context.ApiHelper.Items.MediaLibraryHelper.CreateUnversionedImage("platformImage2.jpg", "/sitecore/media library", "some alt text :)");
            var page = SharedSteps.CreatePageWithAllFieldsTypes();
            Context.Editor.Open(page,site:"website");
            var fieldTemplate = page.Template.GetTemplateField(_imageFieldName);
            var field = Context.Editor.CurrentPage.GetFieldControl(fieldTemplate.Id, fieldTemplate.FieldType);
            field.Select();
            _dialog = Context.Editor.RightPanel.ImageFieldSection.InvokeImageDialog();
            _contentHubMediaProvider = _dialog.SwitchToContentHubProvider();
            _contentHubMediaProvider.SelectImage("image1.jpg");
            _contentHubMediaProvider.ChooseFileToInsert(_dialog);
            _dialog.AddSelected();

            //Act
            _dialog = Context.Editor.RightPanel.ImageFieldSection.InvokeImageDialog();
            _dialog.SwitchToMediaLibraryProvider();
            string mediaLibraryImage = "platformImage2";
            _dialog = WaitForSearchToIndexImagesInMediaFolder(_dialog, mediaLibraryImage);
            _dialog.SelectImage(mediaLibraryImage);
            _contentHubMediaProvider = _dialog.SwitchToContentHubProvider();
            _dialog.AddSelected();

            //Assert
            var imageIdTrimmed = image.ShortId.Replace("-", "");
            CheckImageIsUpdatedInCanvas(page, _imageFieldName, imageIdTrimmed);
            Context.Editor.RightPanel.ImageFieldSection.ImageSource.Should().Contain(imageIdTrimmed);
            Context.Editor.RightPanel.ImageFieldSection.ImagePath.Should().Contain(image.Name);
            page.GetFieldValue(_imageFieldName).ToLower().Should().Contain(image.ShortId.ToLower());
        }

        private void CheckImageIsUpdatedInCanvas(IPageItem page, string fieldName, string src)
        {
            var fieldTemplate = page.Template.GetTemplateField(_imageFieldName);
            var field = (CanvasImageField)Context.Editor.CurrentPage.GetFieldControl(fieldTemplate.Id, fieldTemplate.FieldType);
            if (field != null)
            {
                field.Source.Should().Contain(src, "Canvas image field source not updated");
            }
            else
            {
                Assert.Fail("Unable to get canvas image field source.");
            }
        }

        private void CheckImageIsUpdatedInRHS(string src)
        {
            Context.Editor.RightPanel.ImageFieldSection.ImageSource.Should().Contain(src);
            Context.Editor.RightPanel.ImageFieldSection.ImagePath.Should().Contain(src);
        }

        private void CheckImageDetailsUpdatedInMediaDialogRHS(string src, string alt, string dimentions)
        {
            _dialog.SelectedImageDetails.ThumbnailSource.Should().Contain(src);
            _dialog.SelectedImageDetails.ThumbnailAlternativeText.Should().Be(alt);
            _dialog.SelectedImageDetails.AlternativeText.Should().Be(alt);
            _dialog.SelectedImageDetails.Dimensions.Should().Be(dimentions);
        }

        private string FormImageSourceString(string imageItemShortId) => "<image mediaid=\"{" + imageItemShortId + "}\"/>";
    }
}
