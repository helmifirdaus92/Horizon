// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.MediaDialogs.ImagesDialog;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class ImageFieldSection
    {
        private readonly string mediaDialogSelector = "app-media-dialog";
        private WebElement _imageFieldSectionControl;
        private JsHelper jsHelper;

        public ImageFieldSection(WebElement imageFieldSectionControl)
        {
            _imageFieldSectionControl = imageFieldSectionControl;
            jsHelper = new JsHelper(_imageFieldSectionControl.Driver);
        }

        public string ImageSource => ImageElement.GetAttribute("src");
        public string ImageAltText => ImageElement.GetAttribute("alt");
        public bool IsClearImageButtonEndabled => ClearImageButton.Enabled;
        public bool ThumbnailHasImage => _imageFieldSectionControl.FindElements("img").Count > 0;
        public string ImagePath => new TextBox(ImagePathElement).Text;

        private WebElement AddChangeImageButton => _imageFieldSectionControl.FindElement("button.primary");
        private WebElement ClearImageButton => _imageFieldSectionControl.FindElement(".buttons :nth-child(2)");
        private WebElement ImageElement => _imageFieldSectionControl.FindElement("img");
        private WebElement ImagePathElement => _imageFieldSectionControl.FindElement("input");

        public void PressClearImageButton()
        {
            ClearImageButton.Click();
            ClearImageButton.Driver.WaitForHorizonIsStable();
        }

        public string GetTextOfAddChangeImageButton()
        {
            return AddChangeImageButton.Text;
        }

        public void SetImagePath(string imagePath)
        {
            ImagePathElement.Clear();
            ImagePathElement.Click();
            ImagePathElement.SendKeys(imagePath);
            ImagePathElement.Driver.WaitForHorizonIsStable();
        }

        public void ImagePathPressEnter()
        {
            ImagePathElement.PressKeyJS("keyup", "Enter");
            ImagePathElement.Driver.WaitForHorizonIsStable();
        }

        public ImagesDialog InvokeImageDialog(bool waitForDialogAppears = true)
        {
            AddChangeImageButton.Click();
            AddChangeImageButton.Driver.WaitForHorizonIsStable();
            return waitForDialogAppears ? new ImagesDialog(_imageFieldSectionControl.Driver.FindElement(mediaDialogSelector)) : null;
        }

        public bool IsImagesDialogPresent()
        {
            return AddChangeImageButton.Driver.CheckElementExists(mediaDialogSelector);
        }

        public bool ImagePathFieldHasRedBorder()
        {
            string borderColor = (string)ImagePathElement.Driver.ExecuteJavaScript($"return getComputedStyle(window['{ImagePathElement.Id}']).borderColor");
            return borderColor == "rgb(217, 39, 57)"; //red color
        }
    }
}
