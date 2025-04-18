// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.ObjectModel;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageDesigning;

public class CreateContentItemSlidingPanel : BaseControl
{
    public CreateContentItemSlidingPanel(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public ReadOnlyCollection<IWebElement> InsertOptionsElements => Container.FindElement("ng-spd-list").GetChildren(waitForAny: false);

    public List<string> GetInsertOptions()
    {
        return InsertOptionsElements.Select(ie => ie.Text).ToList();
    }

    public void SelectTemplate(string templateName)
    {
        IWebElement? template = null;
        template = InsertOptionsElements.FirstOrDefault(element => element.Text == templateName);
        template!.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }
}
