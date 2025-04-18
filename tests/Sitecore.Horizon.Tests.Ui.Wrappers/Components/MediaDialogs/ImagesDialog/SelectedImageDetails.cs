// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.MediaDialogs.ImagesDialog
{
    public class SelectedImageDetails
    {
        private WebElement _detailsElement;

        public SelectedImageDetails(WebElement detailsElement)
        {
            _detailsElement = detailsElement;
        }

        public string ThumbnailSource => imageThumbnail.GetAttribute("src");
        public string ThumbnailAlternativeText => imageThumbnail.GetAttribute("alt");
        public string FileName => _detailsElement.FindElement(".field-value:nth-of-type(2)").Text;
        public string FileType => _detailsElement.FindElement(".field-value:nth-of-type(4)").Text;
        public string FileSize => _detailsElement.FindElement(".field-value:nth-of-type(6)").Text;
        public string Dimensions => _detailsElement.FindElement(".field-value:nth-of-type(8)").Text;
        public string Path => _detailsElement.FindElement(".field-value:nth-of-type(10)").Text;
        public string AlternativeText => _detailsElement.FindElement(".field-value:nth-of-type(12)").Text;

        private WebElement imageThumbnail => _detailsElement.FindElement("img");
    }
}
