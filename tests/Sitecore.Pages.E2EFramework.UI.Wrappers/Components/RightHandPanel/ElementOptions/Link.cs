// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel.ElementOptions;

public class Link : BaseControl
{
    public Link(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public IWebElement LinkType => Container.FindElement("button.general-link-type-button");
    public IWebElement LinkTextInput => Container.FindElement("input[name='linkText']");
    public string LinkText => new TextBox(LinkTextInput).Text;
    public IWebElement UrlInput => Container.FindElement("input[name='linkUrl']");
    public string LinkUrl => new TextBox(UrlInput).Text;
    public IWebElement LinkTitleInput => Container.FindElement("input[name='linkTitle']");
    public string LinkTitle => new TextBox(LinkTitleInput).Text;
    public IWebElement ClearLinkValueButton => Container.FindElement(By.CssSelector("button.clear-btn"));
    private IWebElement OpenInNewWindowCheckbox => Container.FindElement("ng-spd-checkbox");
    private IWebElement _browseContentItemButton => Container.FindElement(".path-options>button");
    private IWebElement LinkAnchorElement => Container.FindElement("input[name='linkAnchor']");
    private IWebElement LinkQuerystringElement => Container.FindElement("input[name='linkQuerystring']");
    public string LinkPath => Container.FindElement("input[name='path']").GetAttribute("title");

    public string? SelectedLinkType =>
    Container.FindElements(By.CssSelector("button.general-link-type-button"))
        .FirstOrDefault(btn => btn.GetAttribute("class")?.Contains("active") == true)
        ?.GetAttribute("title");

    public void SelectLinkType(string linkType)
    {
        linkType = linkType.ToLowerInvariant();

        var tabButton = linkType switch
        {
            "internal" => Container.FindElement(By.CssSelector("button.general-link-type-button[title*='Internal']")),
            "external" => Container.FindElement(By.CssSelector("button.general-link-type-button[title*='External']")),
            "media" => Container.FindElement(By.CssSelector("button.general-link-type-button[title*='Media']")),
            "mailto" or "email" => Container.FindElement(By.CssSelector("button.general-link-type-button[title*='Email']")),
            _ => throw new ArgumentException($"Unsupported link type: {linkType}")
        };

        tabButton.Click();
    }


    public bool IsOpenInNewWindowChecked()
    {
        return OpenInNewWindowCheckbox.GetAttribute("aria-checked") == "true";
    }

    public void CheckOpenInNewWindow(bool enable)
    {
        bool isChecked = IsOpenInNewWindowChecked();
        if (enable && !isChecked || !enable && isChecked)
        {
            OpenInNewWindowCheckbox.Click();
            isChecked = IsOpenInNewWindowChecked();
            if (enable && !isChecked || !enable && isChecked)
            {
                OpenInNewWindowCheckbox.Click();
            }
        }
    }

    public void EnterLinkText(string text)
    {
        SetTextField(LinkTextInput, text);
    }

    public ContentItemDialog InvokeInternalLinkDialog()
    {
        _browseContentItemButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        return new ContentItemDialog(Container.GetDriver().FindElement(Constants.ContentItemDialogLocator));
    }

    public void EnterLinkUrl(string linkPath)
    {
        SetTextField(UrlInput, linkPath);
    }

    public void EnterLinkTitle(string text)
    {
        SetTextField(LinkTitleInput, text);
    }

    public void EnterLinkAnchor(string anchor)
    {
        SetTextField(LinkAnchorElement, anchor);
    }

    public void EnterQueryString(string querystring)
    {
        SetTextField(LinkQuerystringElement, querystring);
    }

    private void SetTextField(IWebElement textFieldElement, string textValue)
    {
        textFieldElement.Clear();
        textFieldElement.Click();
        textFieldElement.SendKeys(textValue);
        textFieldElement.GetDriver().WaitForHorizonIsStable();
    }
}
