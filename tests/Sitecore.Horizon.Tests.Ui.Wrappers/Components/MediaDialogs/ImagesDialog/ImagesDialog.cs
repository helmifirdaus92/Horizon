// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ContentHub;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.MediaDialogs.ImagesDialog
{
    public class ImagesDialog
    {
        private WebElement _dialogControl;
        private string imageThumbnailSelector = "app-media-card";
        private string removeSerchPhraseButtonSelector = "app-media-action-bar button";
        private string emptyContentElementSelector = "app-media-content div.empty";
        private UtfWebDriver _driver;

        public ImagesDialog(WebElement dialogControl)
        {
            _dialogControl = dialogControl;
            _driver = _dialogControl.Driver;
        }

        public SelectedImageDetails SelectedImageDetails
        {
            get
            {
                _driver.SwitchToRootDocument();
                return new SelectedImageDetails(_dialogControl.FindElement("app-media-details"));
            }
        }

        public ItemsTree ImagesTree => new ItemsTree(_dialogControl.FindElement("app-media-tree"), canvasReloadWaitMethod: null);
        public string GetHighlightedImage => _imagesList.FindElement(".ng-star-inserted.select").Text;
        public string NoMediaFilesInFolderIconText => _imagesList.FindElement(emptyContentElementSelector).Text;
        public bool UploadMedia => _uploadMediaButton.Displayed;
        private WebElement _uploadMediaButton => _dialogControl.FindElement(".upload-controls button:has(.spd-upload)");
        private WebElement _refreshButton => _dialogControl.FindElement(".upload-controls button.refresh-btn");

        private WebElement _cancelButton
        {
            get
            {
                _driver.SwitchToRootDocument();
                return _dialogControl.FindElement("ng-spd-dialog-actions>button");
            }
        }

        private WebElement _addSelectedButton
        {
            get
            {
                _driver.SwitchToRootDocument();
                return _dialogControl.FindElement("ng-spd-dialog-actions button[ngspdbutton = 'primary']");
            }
        }

        private WebElement _closeButton
        {
            get
            {
                _driver.SwitchToRootDocument();
                return _dialogControl.FindElement("ng-spd-dialog-close-button");
            }
        }

        private WebElement _imagesList => _dialogControl.FindElement("app-media-content");
        private TextBox _searchField => new TextBox(_dialogControl.FindElement("app-media-action-bar input"));
        private WebElement _removeSearchPhraseButton => _dialogControl.FindElement(removeSerchPhraseButtonSelector);
        public void Refresh() => _refreshButton.Click();

        public void UploadFile(string path)
        {
            _dialogControl.Driver.ExecuteJavaScript("document.getElementsByClassName('file-input')[0].style.display = 'block'");
            _dialogControl.FindElement(".upload-controls input.file-input").Click();
            _dialogControl.FindElement(".upload-controls input.file-input").WaitForCondition(e => e.Enabled);
            _dialogControl.FindElement(".upload-controls input.file-input").JsClick();
        }

        public WebElement FindWebElement(string cssSelector)
        {
            return _dialogControl.FindElement(cssSelector);
        }

        public void SetSearchPhrase(string searchPhrase, bool confirmByPressingEnter = true)
        {
            _searchField.Text = searchPhrase;
            if (confirmByPressingEnter)
            {
                _searchField.Container.PressKeyJS("keydown", "Enter");
            }

            _searchField.Driver.WaitForHorizonIsStable();
        }

        public void AppendTextToSearchPhrase(string text, bool confirmByPressingEnter = true)
        {
            _searchField.AppendText(text);
            if (confirmByPressingEnter)
            {
                _searchField.Container.PressKeyJS("keydown", "Enter");
            }

            _searchField.Driver.WaitForHorizonIsStable();
        }

        public void EraseSearchPhrase(bool confirmByPressingEnter = true)
        {
            _searchField.Text = "";
            if (confirmByPressingEnter)
            {
                _searchField.Container.PressKeyJS("keydown", "Enter");
            }

            _searchField.Driver.WaitForHorizonIsStable();
        }

        public bool IsNoSearchResultsIconShown()
        {
            var element = _dialogControl.CheckElement(emptyContentElementSelector);
            if (element != null)
            {
                return element.FindElement("img").GetAttribute("src").Contains("search-no-matches.svg") &&
                    element.Text.Contains("No results match your search phrase.");
            }

            return false;
        }

        public bool IsNoMediaFilesInThisFolderIconShown()
        {
            var element = _dialogControl.CheckElement(emptyContentElementSelector);
            if (element != null)
            {
                return element.FindElement("img").GetAttribute("src").Contains("empty-folder-icon.svg") &&
                    element.Text.Equals("No media files in this folder.");
            }

            return false;
        }

        public void RemoveSearchPhraseByPressingButton()
        {
            _removeSearchPhraseButton.Click();
            _searchField.Driver.WaitForHorizonIsStable();
        }

        public bool IsRemoveSearchPhraseButtonPresent()
        {
            return _dialogControl.CheckElementExists(removeSerchPhraseButtonSelector);
        }

        public string GetSearchPhrase()
        {
            return _searchField.Text;
        }

        public void Cancel()
        {
            _cancelButton.Click();
            _driver.WaitForHorizonIsStable();
        }

        public void AddSelected()
        {
            _addSelectedButton.Click();
            _driver.WaitForHorizonIsStable();
        }

        public bool IsAddSelectedEnabled()
        {
            return _addSelectedButton.Enabled;
        }

        public void Close()
        {
            _closeButton.Click();
            _driver.WaitForHorizonIsStable();
        }

        public void SelectImage(string imageName)
        {
            WebElement requiredImage = null;
            string fileName = "";
            this.WaitForCondition(c =>
            {
                requiredImage = _imagesList.FindElements(imageThumbnailSelector).FirstOrDefault(image => image.Text == imageName);
                return requiredImage != null;
            }, 2000);

            requiredImage.Click();

            this.WaitForCondition(f =>
            {
                fileName = SelectedImageDetails.FileName;
                return fileName == imageName;
            }, 2000);
        }

        public List<string> GetImages()
        {
            List<string> images = new List<string>();
            images = _imagesList.FindElements(imageThumbnailSelector).Select(image => image.Text).ToList();
            return images;
        }

        public void WaitForAnyImages()
        {
            this.WaitForCondition(c => { return _imagesList.FindElements(imageThumbnailSelector).Count > 0; });
        }

        public void ScrollBy(int xPixels, int yPixels)
        {
            var script = $"var virtualScrollViewport = document.querySelector('cdk-virtual-scroll-viewport'); virtualScrollViewport.scrollBy({xPixels}, {yPixels});";
            _dialogControl.Driver.ExecuteJavaScript(script);
        }

        public ContentHubMediaProvider SwitchToContentHubProvider()
        {
            var contentHubTab = _dialogControl.FindElement($"button[title='Content Hub']");
            contentHubTab.Click();
            contentHubTab.Driver.SwitchToFrame(_driver.SwitchToRootDocument().FindElement("iframe.content-hub-dam-iframe"));
            _driver.WaitForDocumentLoaded();
            return new ContentHubMediaProvider(contentHubTab.Driver.FindElement("div.main-content-wrapper"));
        }

        public void SwitchToMediaLibraryProvider()
        {
            var mediaLibraryTab = _dialogControl.FindElement($"button[title='Media Library']");
            mediaLibraryTab.Click();
            _driver.WaitForHorizonIsStable();
        }
    }
}
