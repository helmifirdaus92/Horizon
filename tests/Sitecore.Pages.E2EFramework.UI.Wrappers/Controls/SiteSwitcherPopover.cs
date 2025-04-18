// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.ObjectModel;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class SiteSwitcherPopover : BaseControl
{
    public SiteSwitcherPopover(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public IWebElement SearchInput => SiteSwitcherList.FindElement("ng-spd-search-input input");

    private IWebElement SiteSwitcherList => Container.FindElement("#site-switcher-list");

    private IReadOnlyCollection<IWebElement> Sites => SiteSwitcherList.FindElements("button").ToList();

    private IWebElement PopoverWrapper => Container.GetDriver().FindElement("ng-spd-popover-wrapper");

    public List<string> GetAllSites()
    {
        // added because when sites dropdown is open -  the site-switcher-list lives in the overlay container 
        string cssSelector = "div.cdk-overlay-container #site-switcher-list button";

        ReadOnlyCollection<IWebElement>? siteElements = Container.GetDriver().FindElements(cssSelector);
        List<string> sites = siteElements.Select(e => e.Text.Trim()).ToList();
        sites.Remove("");

        return sites;
    }

    public void SelectSite(string site)
    {
        IWebElement siteToSelect = Sites.First(s => s.GetInnerHtml().Contains(site));

        if (siteToSelect == null)
        {
            throw new Exception("Site to select does not exist");
        }

        siteToSelect.Hover();
        siteToSelect = Sites.First(s => s.GetInnerHtml().Contains(site));
        siteToSelect.Click();

        Container.GetDriver().WaitForHorizonIsStable();
    }

    public List<string> SearchSite(string query)
    {
        SearchInput.Clear();
        SearchInput.SendKeys(query);
        List<string> sites = GetAllSites();

        return sites;
    }

    public void CloseSitesDropdown()
    {
        if (!IsPopoverComponentOpened())
        {
            return;
        }

        PopoverWrapper.ClickOutside(0, 200);
        Container.WaitForCondition(c => !c.Exists());
    }

    private bool IsPopoverComponentOpened()
    {
        Container.GetDriver().WaitForHorizonIsStable();
        return PopoverWrapper.Exists();
    }
}
