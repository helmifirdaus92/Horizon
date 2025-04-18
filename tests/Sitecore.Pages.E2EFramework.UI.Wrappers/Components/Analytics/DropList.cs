// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

public class DropList : BaseControl
{
    public DropList(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public string SelectedValue => Container.FindElement(By.CssSelector("div[class*=ng-spd-droplist-toggle-content]")).Text;

    public bool IsOpen
    {
        get
        {
            IWebElement popover = Container.CheckElement(".ng-spd-droplist-overlay-content-wrapper");
            return popover is { Displayed: true };
        }
    }

    public void SelectDropListItem(string dropListItem)
    {
        Open();

        IWebElement? option = Container.GetDriver()
            .FindElements(".sc-dropdown-item-wrapper, .sc-editable-dropdown-item-wrapper, ng-spd-droplist-item, button[role='listitem']")
            .FirstOrDefault((el) => el.Text.Trim() == dropListItem);

        option!.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void Open()
    {
        if (IsOpen)
        {
            return;
        }

        Container.Hover();
        Container.Click();
        Thread.Sleep(200); //animation timeout
    }

    public bool CheckIfDropListItemExists(string dropListItem)
    {
        Open();

        IWebElement? option = Container.GetDriver()
            .FindElements(".sc-dropdown-item-wrapper, .sc-editable-dropdown-item-wrapper, ng-spd-droplist-item, button[role='listitem']")
            .FirstOrDefault((el) => el.Text.Trim() == dropListItem);

        return option != null;
    }
}
