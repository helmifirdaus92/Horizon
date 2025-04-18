// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;

public class DesignContentTogle : BaseControl
{
    public DesignContentTogle(IWebElement container) : base(container)
    {
    }

    private IWebElement DesignButton => Container.FindElement("app-toggle-buttons [Title='Design']");
    private IWebElement ContentButton => Container.FindElement("app-toggle-buttons [Title='Content']");
   

    public void TogleToDesign()
    {
        DesignButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void TogleToContent()
    {
        ContentButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }
}
