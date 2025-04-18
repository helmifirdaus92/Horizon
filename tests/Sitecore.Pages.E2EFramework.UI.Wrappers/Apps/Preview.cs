// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps;

public class Preview : App
{
    public Preview(BrowserWrapper browser, string clientUrl) : base("preview", browser, clientUrl)
    {
    }

    public string H1Text => H1Element.Text;
    private IWebElement H1Element => Browser.FindElement("h1");

    public string HeaderText => Browser.FindElement("#header").Text;

    private IWebElement Title => Browser.FindElement("head > title");
    public string TitleText => Title.Text;

    public bool IsOpened()
    {
        return Browser.PageUrl.Contains("sc_horizon=preview");
    }
}
