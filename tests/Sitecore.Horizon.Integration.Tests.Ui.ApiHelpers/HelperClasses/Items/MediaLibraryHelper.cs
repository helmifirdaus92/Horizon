// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using UTF;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items
{
    public class MediaLibraryHelper
    {
        private ItemOperations _itemOperations;
        private HelperService _helperService;

        public MediaLibraryHelper(ItemOperations itemOperations, HelperService helperService)
        {
            _itemOperations = itemOperations;
            _helperService = helperService;
        }

        public void RemoveMediaBlobFromItem(IGenericItem mediaItem, int version = 1, string language = "en")
        {
            mediaItem.EditVersion(language, version, "Blob", "");
        }

        public IGenericItem CreateUnversionedImage(string imageNameWithExtension, string parentPath, string altText = null, int width = 150, int height = 150, bool doNotDelete = false)
        {
            return CreateImage(imageNameWithExtension, false, null, parentPath, altText, width, height, doNotDelete);
        }

        public IGenericItem CreateVersionedImage(string imageNameWithExtension, string parentPath, string language, string altText = null, int width = 150, int height = 150, bool doNotDelete = false)
        {
            return CreateImage(imageNameWithExtension, true, language, parentPath, altText, width, height, doNotDelete);
        }

        public IGenericItem CreateMediaFolder(string folderName, string parentIdOrPath = null)
        {
            parentIdOrPath = parentIdOrPath ?? DefaultScData.GenericItems.MediaLibraryId;
            var item = _helperService.CreateItem(folderName, parentIdOrPath, DefaultScData.Template.MediaFolderTemplateId);
            var mediaFolderItem = _itemOperations.GetItem(item);
            TestData.ItemsToDelete.Add(mediaFolderItem);
            return mediaFolderItem;
        }

        private IGenericItem CreateImage(string imageNameWithExtension, bool versioned, string language, string parentPath, string altText, int width, int height, bool doNotDelete = false)
        {
            var font = new Font("Arial", 20);
            altText = altText ?? imageNameWithExtension;
            var backColor = language == null ? Color.AntiqueWhite : Color.Coral;
            var image = DrawTextImage(imageNameWithExtension, font, Color.Green, backColor, new Size(width, height));
            var data = ConvertToByteArray(image);
            var imagePath = _helperService.CreateMediaItem(imageNameWithExtension, parentPath, data, false, altText, Context.Settings.AdminUser, Context.Settings.AdminPassword,
                Database.Master, versioned, language);
            _helperService.EditItem(imagePath, "Alt", altText);
            _helperService.EditItem(imagePath, "Width", width.ToString());
            _helperService.EditItem(imagePath, "Height", height.ToString());

            var imageItem = _itemOperations.GetItem(imagePath);
            imageItem.DoNotDelete = doNotDelete;
            TestData.ItemsToDelete.Add(imageItem);
            return imageItem;
        }

        private Image DrawTextImage(String textOnImage, Font font, Color textColor, Color backColor, Size minSize)
        {
            SizeF textSize;
            using (Image img = new Bitmap(1, 1))
            {
                using (Graphics drawing = Graphics.FromImage(img))
                {
                    textSize = drawing.MeasureString(textOnImage, font);
                    if (!minSize.IsEmpty)
                    {
                        textSize.Width = textSize.Width > minSize.Width ? textSize.Width : minSize.Width;
                        textSize.Height = textSize.Height > minSize.Height ? textSize.Height : minSize.Height;
                    }
                }
            }

            Image retImg = new Bitmap((int)textSize.Width, (int)textSize.Height);
            using (var drawing = Graphics.FromImage(retImg))
            {
                drawing.Clear(backColor);

                using (Brush textBrush = new SolidBrush(textColor))
                {
                    drawing.DrawString(textOnImage, font, textBrush, 0, 0);
                    drawing.Save();
                }
            }

            return retImg;
        }


        private byte[] ConvertToByteArray(Image image)
        {
            using (var ms = new MemoryStream())
            {
                image.Save(ms, ImageFormat.Jpeg);
                return ms.ToArray();
            }
        }
    }
}
