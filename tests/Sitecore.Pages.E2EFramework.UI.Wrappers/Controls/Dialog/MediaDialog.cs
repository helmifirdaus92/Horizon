// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

public class MediaDialog : DialogBase
{
    private string ImageThumbnailSelector = "app-media-card";
    private string RemoveSearchPhraseButtonSelector = "app-media-action-bar div.search button";

    public MediaDialog(IWebElement container) : base(container)
    {
    }

    public bool IsDisplayed => Container.Displayed;

    public ItemsTree ImagesTree => new(Container.FindElement("app-media-tree"), canvasReloadWaitMethod: null);
    public IWebElement ImagesList => Container.FindElement("app-media-content");

    public string GetHighlightedImage => ImagesList.FindElement(".ng-star-inserted.select").Text;

    public TextBox SearchField => new(Container.FindElement("app-media-action-bar input"));
    public string SearchFieldText => SearchField.Text;

    public SelectedImageDetails SelectedImageDetails
    {
        get
        {
            return new SelectedImageDetails(Container.FindElement("app-media-details"));
        }
    }

    private IWebElement RemoveSearchPhraseButton => Container.FindElement(RemoveSearchPhraseButtonSelector);

    private IWebElement RefreshButton => Container.FindElement(".upload-controls button.refresh-btn");

    private IWebElement AddSelectedButton => Container.FindElement("ng-spd-dialog-actions button[ngspdbutton = 'primary']");

    public void SelectImage(string imageName)
    {
        WebDriverWait wait = new WebDriverWait(Container.GetDriver(), TimeSpan.FromSeconds(5));
        wait.Until(driver =>
        {
            try
            {
                var element = ImagesList.FindElements(ImageThumbnailSelector)
                    .FirstOrDefault(image => image.Text == imageName);
                Logger.Write($"Selecting image: {imageName}");
                element?.Click();
                return true;
            }
            catch (StaleElementReferenceException)
            {
                Logger.Write("Stale element exception occurred. Retrying...");
                return false;
            }
        });

        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void AddSelectedImage()
    {
        ClickActionButton("Add selected");
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void Cancel()
    {
        ClickActionButton("Cancel");
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public List<string> GetImages()
    {
        return ImagesList.FindElements(ImageThumbnailSelector).Select(image => image.Text).ToList();
    }

    public void Refresh()
    {
        RefreshButton.Click();
    }

    public bool IsAddSelectedEnabled()
    {
        return AddSelectedButton.Enabled;
    }

    public void WaitForImagePresent(string name)
    {
        Container.GetDriver().WaitForCondition(i =>
            GetImages().Find(im => im == name) != null, TimeSpan.FromSeconds(15), 200);
    }

    public void WaitForImageToBeIndexed(string name)
    {
        Container.GetDriver().WaitForCondition(i =>
        {
            Refresh();
            return GetImages().Find(im => im == name) != null;
        }, TimeSpan.FromSeconds(15), 100);
    }

    public void WaitForImagesToBeIndexed(List<string> names)
    {
        Container.GetDriver().WaitForCondition(i =>
        {
            Refresh();
            return names.All(im => GetImages().Contains(im));
        }, TimeSpan.FromSeconds(15), 100);
    }


    public void SetSearchPhrase(string searchPhrase, bool confirmByPressingEnter = true)
    {
        SearchField.Clear();
        SearchField.Container.SendKeys(searchPhrase);
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void RemoveSearchPhraseByPressingButton()
    {
        RemoveSearchPhraseButton.Click();
        SearchField.Container.GetDriver().WaitForHorizonIsStable();
    }

    public bool RemoveSearchPhraseButtonExists()
    {
        return Container.CheckElementExists(RemoveSearchPhraseButtonSelector);
    }
}
