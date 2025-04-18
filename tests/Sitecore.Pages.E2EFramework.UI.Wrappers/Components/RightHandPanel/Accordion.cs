// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.ObjectModel;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;

public class Accordion : BaseControl
{
    public Accordion(IWebElement section) : base(section)
    {
    }

    public string Text => Container.Text;

    public IWebElement Contents => Container.FindElement("ng-spd-accordion-content");
    public string HeaderText => SectionHeader.Text;
    private IWebElement SectionHeader => Container.FindElement("ng-spd-accordion-header");

    public ReadOnlyCollection<IWebElement> GetExtensions()
    {
        return Container.FindElements("app-sitecore-extension");
    }

    public bool IsExpanded()
    {
        return Contents.GetClass().Contains("open") && Contents.Displayed;
    }

    public void Expand()
    {
        if (IsExpanded())
        {
            return;
        }

        SectionHeader.Click();
        Container.WaitForCondition(s => IsExpanded());
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void Collapse()
    {
        if (!IsExpanded())
        {
            return;
        }

        SectionHeader.Click();
    }
}
