// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.MediaDialogs.ImagesDialog;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ContentHub
{
    public class ContentHubMediaProvider
    {
        private WebElement _contentHubDialog;
        private UtfWebDriver _driver;
        private string _imageThumbnailSelector = "div.thumbnail-bottom-wrapper";
        private string _selectedImage = "";

        public ContentHubMediaProvider(WebElement contentHubDialog)
        {
            _contentHubDialog = contentHubDialog;
            _driver = _contentHubDialog.Driver;
        }

        public string SelectedMediaUrl => _selectedImage.Split('?')[0];

        public void ChooseFileToInsert(ImagesDialog dialog, string linkName = "Original")
        {
            var scriptToMeasureNumberOfREquests = "return window.performance.getEntries().filter(r=>r.entryType == 'resource').length;";
            var numberOfReauestsBeforeSelectAction = Context.Browser.ExecuteJavaScript<Int64>(scriptToMeasureNumberOfREquests);
            SwitchToContentHubIframe();
            var insertFileDialog = _driver.FindElement("div.modal-content");
            WebElement requiredLink = null;
            this.WaitForCondition(c =>
            {
                requiredLink = insertFileDialog.FindElements("div.panel--bordered-top-bottom-padding").FirstOrDefault(l => l.Text.Contains(linkName));
                return requiredLink != null;
            }, 5000);
            _selectedImage = requiredLink.FindElement("a.public-links__url").Text;
            var selectButton = requiredLink.FindElement("button[class='btn btn-secondary public-links__clipboard-btn']");
            selectButton.Click();
            Extensions.WaitForCondition(this,c => Context.Browser.ExecuteJavaScript<Int64>(scriptToMeasureNumberOfREquests) >= numberOfReauestsBeforeSelectAction + 2, 5000);
            Uri uri = new Uri(_selectedImage);
            this.WaitForCondition(c => dialog.SelectedImageDetails.ThumbnailSource.Contains(uri.AbsolutePath));
        }

        public void SelectImage(string imageName)
        {
            SwitchToContentHubIframe();
            WebElement requiredImage = null;
            requiredImage = _driver.FindElements(_imageThumbnailSelector).FirstOrDefault(t => t.InnerHtml.Contains(imageName));
            this.WaitForCondition(c =>
            {
                requiredImage = _driver.FindElements(_imageThumbnailSelector).FirstOrDefault(t => t.InnerHtml.Contains(imageName));
                return requiredImage != null;
            }, 5000);
            requiredImage.Click();
        }

        private void SwitchToContentHubIframe()
        {
            _driver.SwitchToFrame(_driver.SwitchToRootDocument().FindElement("iframe.content-hub-dam-iframe"));
        }
    }
}
