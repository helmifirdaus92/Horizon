// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel.ElementOptions;

public class Image : BaseControl
{
    public Image(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public IWebElement AddButton => Container.FindElement("span.upload-text");
    public IWebElement ClearButton => Container.FindElement("button[aria-label='Remove Image']");

    public IWebElement ImagePathInput => Container.FindElement("input");

    public string ImagePath => new TextBox(ImagePathInput).Text;

    public string ImageAltText => ImageElement.GetAttribute("alt");
    public string ImageSource => ImageElement.GetAttribute("src");

    public IWebElement ChangeImageButton => Container.FindElement("button[aria-label='Change Image']");

    public bool ThumbnailHasImage => Container.FindElements("ng-spd-thumbnail img").Count > 0;

    private IWebElement ImageElement => Container.FindElement("ng-spd-thumbnail img");

    public bool IsClearButtonEnabled()
    {
        return ClearButton.Enabled;
    }

    public void ClearImage()
    {
        ImageElement.Hover();
        Container.WaitForCondition(i => IsClearButtonEnabled(), timeout: TimeSpan.FromMilliseconds(100));
        ClearButton.Click();
    }

    public MediaDialog InvokeChangeImageDialog()
    {
        ImageElement.Hover();
        Container.WaitForCondition(i => IsChangeButtonDisplayed(), timeout: TimeSpan.FromMilliseconds(100));
        ChangeImageButton.Click();

        MediaDialog imageDialog = new(Container.GetDriver().FindElement("app-media-dialog"));
        ChangeImageButton.GetDriver().WaitForCondition(i =>
                imageDialog.Container.FindElements("app-media-card").Count > 0 || imageDialog.ImagesList.Text == "No media files in this folder.",
            TimeSpan.FromSeconds(5), 200);
        return imageDialog;
    }

    public IWebElement DisplayChangeImageButton()
    {
        ImageElement.Hover();
        Container.WaitForCondition(i => IsChangeButtonDisplayed(), timeout: TimeSpan.FromMilliseconds(100));
        return ChangeImageButton;
    }

    public bool IsChangeButtonDisplayed()
    {
        return ChangeImageButton.Displayed;
    }

    public bool IsAddButtonEnabled()
    {
        return AddButton.Enabled;
    }

    public string GetTextOfAddChangeImageButton()
    {
        DisplayChangeImageButton();
        return ChangeImageButton.GetAttribute("aria-label");
    }

    public void SetImagePath(string imagePath)
    {
        ImagePathInput.Clear();
        ImagePathInput.Click();
        ImagePathInput.SendKeys(imagePath);
        ImagePathInput.SendKeys(Keys.Enter);
        ImagePathInput.GetDriver().WaitForHorizonIsStable();
    }

    public bool ImagePathFieldHasRedBorder()
    {
        string borderColor = ImagePathInput.GetCssValue("borderColor");
        return borderColor == "rgb(217, 39, 57)"; //red color
    }

    public MediaDialog InvokeImageDialog()
    {
        AddButton.Click();
        MediaDialog imageDialog = new(Container.GetDriver().FindElement("app-media-dialog"));

        AddButton.GetDriver().WaitForCondition(i =>
                imageDialog.Container.FindElements("app-media-card").Count > 0 || imageDialog.ImagesList.Text == "No media files in this folder.",
            TimeSpan.FromSeconds(5), 200);

        return imageDialog;
    }
}
