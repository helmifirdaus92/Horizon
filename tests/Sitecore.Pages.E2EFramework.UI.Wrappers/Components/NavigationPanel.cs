// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components;

public class NavigationPanel : BaseControl
{
    private readonly IWebElement _navigationPanelElement;

    public NavigationPanel(IWebElement container) : base(container)
    {
        _navigationPanelElement = container;
        container.GetDriver().SwitchTo().DefaultContent();
    }

    public bool PersonalizationTabIsSelected => PersonalizationButton.IsSelected();
    public bool AnalyzeTabIsSelected => AnalyzeButton.IsSelected();
    public bool TemplatesTabIsSelected => TemplatesButton.IsSelected();
    public bool EditorTabIsActive => EditorButton.IsSelected();
    private IWebElement EditorButton => _navigationPanelElement.FindElement("a[data-testid='nav-editor']");

    private IWebElement PersonalizationButton => _navigationPanelElement.FindElement("a[data-testid='nav-personalization']");
    private IWebElement TemplatesButton => _navigationPanelElement.FindElement("a[data-testid='nav-templates']");

    private IWebElement AnalyzeButton => _navigationPanelElement.FindElement("a[data-testid='nav-analytics']");

    public void OpenEditor()
    {
        EditorButton.Click();
        _navigationPanelElement.GetDriver().WaitForHorizonIsStable();
    }

    public void OpenTemplates()
    {
        TemplatesButton.Click();
        _navigationPanelElement.GetDriver().WaitForHorizonIsStable();
    }

    public void OpenPersonalizationPanel()
    {
        PersonalizationButton.Click();
        _navigationPanelElement.GetDriver().WaitForHorizonIsStable();
    }

    public void OpenAnalyzePanel()
    {
        AnalyzeButton.Click();
        _navigationPanelElement.GetDriver().WaitForHorizonIsStable();
    }
}
