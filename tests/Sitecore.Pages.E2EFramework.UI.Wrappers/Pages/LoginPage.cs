// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Pages
{
    public class LoginPage : BasePage
    {
        public LoginPage(IWebDriver driver) : base(driver)
        {
        }

        public TextBox UserName => Driver.FindControl<TextBox>("#username,[name=email],[name=username]");
        public TextBox PassWord => Driver.FindControl<TextBox>("#password");
        public NamedCollection<Button> Buttons => Driver.FindNamedControls<Button>("button");
        public NamedCollection<Button> Links => Driver.FindNamedControls<Button>("a");
        public Button SubmitButton => Driver.FindControl<Button>("[type=submit][data-action-button-primary=true]");
        public Button CancelButton => Driver.FindControl<Button>("footer .subtle-button-md");
        public IWebElement SelectOrgForm => Driver.FindElement("form");
        public IWebElement SelectTenantForm => Driver.FindElement("form[action*='Account/SelectTenant']");
        public List<string> Tenants => TenantTiles.Select(t => t.Text).ToList();
        public List<IWebElement> OrgTiles => SelectOrgForm.FindElements(".organization-buttons-wrapper .organization-button").ToList();

        public string NoInstanceErrorMessage => Driver.FindElement("main").Text;
        private IWebElement _cancelButton => Driver.FindElement("footer .subtle-button-md");
        private List<IWebElement> TenantTiles => Driver.FindElements(".button-list label").ToList();
        public void NoOrgCancel() => _cancelButton.Click();

        public void Login(string userName, string password, string pagesUrl)
        {
            WaitForLoading();
            UserName.Text = userName;
            SubmitButton.Click();
            PassWord.Text = password;
            SubmitButton.Click();
            Driver.WaitForCondition(d => Driver.Url.Contains("Account/SelectTenant")
                || Driver.Url.Contains(pagesUrl)
                || Driver.Url.Contains("sitecore/shell"), timeout: TimeSpan.FromSeconds(2000));
        }

        public void SelectTestTenant(string projectName, string environmentName)
        {
            if (Driver != null && Driver.Url.Contains("Account/SelectTenant"))
            {
                TenantTiles.Find(t => t.Text.Contains(projectName) && t.Text.Contains(environmentName))
                    ?.Click();
            }
        }

        public void SelectAnyTenant()
        {
            if (Driver != null && Driver.Url.Contains("Account/SelectTenant"))
            {
                TenantTiles.Find(t => t.Text.Contains(" / "))?.Click();
            }
        }

        public void SelectOrganization(string orgNameContainsString)
        {
            OrgTiles.Find(tile => tile.Text.Contains(orgNameContainsString))?.Click();
        }

        public void WaitForLoading()
        {
            this.WaitForCondition(
                p => (p.Driver.Url.Contains("/u/login/") || p.Driver.Url.Contains("/u/signup/")) &&
                    p.SubmitButton.IsEnabled,
                Settings.ShortWaitTimeout, message: "Login page not found");
        }

        private void ClearCookies()
        {
            Driver?.Manage().Cookies.DeleteAllCookies();
        }
    }
}
