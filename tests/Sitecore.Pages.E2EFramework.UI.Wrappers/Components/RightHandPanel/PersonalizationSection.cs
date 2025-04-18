// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;

public class PersonalizationSection : BaseControl
{
    public PersonalizationSection(IWebElement personalization) : base(personalization)
    {
    }

    private IWebElement DataSourceInput => Container.FindElement("div input");

    private IWebElement HideRenderingButton => Container.FindElement("ng-spd-switch");

    private IWebElement ResetPersonalizationButton => Container.FindElement(".reset button");

    private IWebElement ComponentButton => Container.FindElement(".rendering button");

    public ComponentsPanel ComponentsPanel => new(Container.FindElement("ng-spd-slide-in-panel"));

    public string ComponentNameInButton => ComponentButton.FindElement(".content .row-two").Text;


    public void HideRendering()
    {
        HideRenderingButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void ResetPersonalization()
    {
        ResetPersonalizationButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void OpenComponentsPanel()
    {
        ComponentButton.Click();
        Container.FindElement("ng-spd-slide-in-panel").WaitForCondition(x => x.GetClassList().All(c => !c.Contains("ng-animating")));
    }
}
