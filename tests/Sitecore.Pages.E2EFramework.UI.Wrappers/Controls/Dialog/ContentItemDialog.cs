// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

public class ContentItemDialog : DialogBase
{
    public ContentItemDialog(IWebElement container) : base(container)
    {
    }

    public ItemsTree ItemsTree => new ItemsTree(Container.FindElement(".picker-dialog-body"));
    private Button SiteSwitcher => Container.FindControl<Button>("app-site-language-dropdowns #site-switcher-btn");
    private Button LanguageSwitcher => Container.FindControl<Button>("app-site-language-dropdowns #language-switcher-btn");
    private IReadOnlyCollection<IWebElement> ListElements => Container.GetDriver().FindElements("ng-spd-popover ng-spd-list button").ToList();
    public string GetSelectedLanguage() => LanguageSwitcher.Container.FindElement(".ng-spd-droplist-toggle-content").Text;

    public void Cancel()
    {
        ClickActionButton("Cancel");
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void AddLink()
    {
        ClickActionButton("Add link");
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void SelectLanguage(string language)
    {
        OpenLanguagesDropdown();
        IWebElement languageToSelect = ListElements.First(s => s.GetInnerHtml().Contains(language));
        if (languageToSelect == null)
        {
            throw new Exception("language to select does not exist");
        }

        languageToSelect.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void SelectSite(string site)
    {
        OpenSitesDropdown();

        Container.GetDriver().WaitForDotsLoader();
        IWebElement siteToSelect = ListElements.First(s => s.GetInnerHtml().Contains(site));
        if (siteToSelect == null)
        {
            throw new Exception("Site to select does not exist");
        }

        siteToSelect.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    private void OpenLanguagesDropdown()
    {
        if (IsPopoverComponentOpened())
        {
            LanguageSwitcher.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            return;
        }

        LanguageSwitcher.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public SiteSwitcherPopover OpenSitesDropdown()
    {
        if (IsPopoverComponentOpened())
        {
            SiteSwitcher.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            return new(Container.GetDriver().FindElement("ng-spd-popover-wrapper"));
        }

        SiteSwitcher.Click();
        Container.GetDriver().WaitForHorizonIsStable();

        return new(Container.GetDriver().FindElement("ng-spd-popover-wrapper"));
    }

    private bool IsPopoverComponentOpened()
    {
        Container.GetDriver().WaitForHorizonIsStable();
        return Container.GetDriver().CheckElementExists("ng-spd-popover-wrapper");
    }
}
