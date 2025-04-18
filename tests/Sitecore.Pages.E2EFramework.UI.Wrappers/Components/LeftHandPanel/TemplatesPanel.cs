// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;

public class TemplatesPanel: BaseControl
{
    public TemplatesPanel(IWebElement container) : base(container)
    {
    }

    private IWebElement _pageDesigns => Container.FindElement("[data-testid='nav-page-designs']");
    private IWebElement _partialDesigns => Container.FindElement("[data-testid='nav-partial-designs']");
    private IWebElement _pageBranches => Container.FindElement("[data-testid='nav-page-branches']");
    private IWebElement _pageTemplates => Container.FindElement("[data-testid='nav-page-templates']");

    public void OpenPageDesigns()
    {
        _pageDesigns.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        Container.WaitForCondition(b => b.CheckElementExists(Constants.AppPageDesignsLocator));
        Container.GetDriver().WaitForNetworkCalls();
        Container.GetDriver().WaitForDotsLoader();
    }
    public void OpenPartialDesigns()
    {
        _partialDesigns.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        Container.WaitForCondition(b => b.CheckElementExists(Constants.AppPartialDesignsLocator));
        Container.GetDriver().WaitForNetworkCalls();
        Container.GetDriver().WaitForDotsLoader();
    }
    public void OpenPageTemplates()
    {
        _pageTemplates.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        Container.WaitForCondition(b => b.CheckElementExists(Constants.AppPageTemplatesLocator));
        Container.GetDriver().WaitForNetworkCalls();
        Container.GetDriver().WaitForDotsLoader();
    }

}
