// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

public class EditAudienceDialog : DialogBase
{
    public EditAudienceDialog(IWebElement container) : base(container)
    {
    }

    private IWebElement AudienceInput => Container.FindElement("label[for=audience-name] + input");

    private IWebElement SaveAudienceButton => Container.FindElement(".disconnected + button");

    public void SetAudienceName(string audienceName)
    {
        AudienceInput.SendKeys(audienceName);
        SaveAudienceButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }
}
