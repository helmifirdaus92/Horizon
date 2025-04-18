// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;

namespace Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.Helpers
{
    public class ContentHub
    {
        public ContentHub(BrowserWrapper browser, string contentHubUrl)
        {
            Browser = browser;
            ContentHubUrl = contentHubUrl;
        }

        public BrowserWrapper Browser { get; }
        public string ContentHubUrl { get; }

        public void Login(string username, string password)
        {
            Browser.Navigate(ContentHubUrl);
            try
            {
                LoginToContentHub(username, password);
            }
            catch
            {
                Browser.Navigate(ContentHubUrl);
                LoginToContentHub(username, password);
            }
        }

        private void LoginToContentHub(string username, string password)
        {
            Browser.WaitForDocumentLoaded();

            var usernameTextWebElement = Browser.FindElement("input[placeholder=Username]");
            var passwordTextWebElement = Browser.FindElement("input[placeholder=Password]");
            var signInButtonWebElement = Browser.FindElement("input[id=SignInDetails_SubmitButton]");

            usernameTextWebElement.SendKeys(username);
            passwordTextWebElement.SendKeys(password);
            signInButtonWebElement.Click();
        }
    }
}
