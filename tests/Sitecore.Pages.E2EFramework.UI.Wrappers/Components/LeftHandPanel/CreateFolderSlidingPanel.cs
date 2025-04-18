// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;

public class CreateFolderSlidingPanel : BaseControl
{
    private string inlineNotificationSelector = "ng-spd-inline-notification";

    public CreateFolderSlidingPanel(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public List<IWebElement> InsertOptionsElements => Container.FindElement("ng-spd-list").GetChildren(waitForAny: false).ToList();
    public string InlineNotification => Container.FindElement(inlineNotificationSelector).Text;

    public void SelectTemplate(string templateName)
    {
        Container.WaitForCssAnimation();

        InsertOptionsElements.FirstOrDefault(element => element.Text == templateName)!.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void CloseSlidingPanel()
    {
        Container.FindElement("button").Click();
        Container.WaitForCssAnimation();
    }
}
