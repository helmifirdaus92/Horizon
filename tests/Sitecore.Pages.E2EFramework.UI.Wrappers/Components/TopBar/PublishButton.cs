// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopBar;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopPanel;

public class PublishButton : BaseControl
{
    public PublishButton(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public bool IsDisabled => PublishingButton.HasAttribute("disabled");

    public IWebElement OverlayInfo => Container.GetDriver().FindElement(".cdk-overlay-container span");

    public string OverlayInfoText
    {
        get
        {
            if (OverlayInfo.Text.Length > 0)
            {
                return OverlayInfo.Text;
            }

            Container.GetDriver().WaitForCondition(d => OverlayInfo.Text.Length > 0);
            return OverlayInfo.Text;
        }
    }

    private IWebElement PublishingButton => Container.FindElement(".publish-button .btn-main");
    private PublishButtonList PublishButtonList => new(Container.GetDriver().FindElement("ng-spd-popover ng-spd-list.publish-button-list"));


    public void PublishPage()
    {
        PublishingButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        PublishButtonList.ClickStartPublishButton();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void PublishPageWithSubPages()
    {
        PublishingButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        PublishButtonList.SetSubPagesCheckBox();
        PublishButtonList.ClickStartPublishButton();
    }

    public void PublishPageWithAllLanguages()
    {
        PublishingButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        PublishButtonList.SetAllLanguagesCheckBox();
        PublishButtonList.ClickStartPublishButton();
    }

    public void PublishPageWithSubPagesAndAllLanguages()
    {
        PublishingButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        PublishButtonList.SetSubPagesCheckBox();
        PublishButtonList.SetAllLanguagesCheckBox();
        PublishButtonList.ClickStartPublishButton();
    }
}
