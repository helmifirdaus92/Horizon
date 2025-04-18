// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class PageDesignInfo : Accordion
{
    public PageDesignInfo(IWebElement container) : base(container)
    {
    }

    public IWebElement CloseButton => Container.FindElement(".close-button > button");

    public IWebElement CloseDialogButton => Container.GetDriver().FindElement("button[class^='close-button']");

    public IWebElement CancelButton => Container.FindElement("div.actions.pt-md > button");

    public IWebElement SaveButton => Container.FindElement("div.actions.pt-md > div > button");

    public IWebElement ConfirmChangesButton => Container.GetDriver().FindElement(By.XPath("//ng-spd-popover//button[text()='Continue with save']"));

    public string AssignedPageTemplate => PageTemplateValue.Text;

    public IWebElement ChangePageDesign => Container.GetDriver().FindElement("#pageDesignDroplist");

    public List<IWebElement> PageDesignVariants => Container.GetDriver().FindElements("ng-spd-droplist-item").ToList();

    public IWebElement SelectedVariant => Container.GetDriver().FindElement("ng-spd-droplist-item[class^='selected']");

    public IWebElement RestoreToDefault => Container.GetDriver().FindElement(".use-design-checkbox ng-spd-checkbox");

    private IWebElement PageDesignValue => Container.FindElement(".page-design-name");

    private IWebElement PageTemplateValue => Container.FindElement(".template > span");
}
