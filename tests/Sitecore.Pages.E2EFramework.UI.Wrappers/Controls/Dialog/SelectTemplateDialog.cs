// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

public class SelectTemplateDialog : DialogBase
{
    public SelectTemplateDialog(IWebElement container) : base(container)
    {
    }

    public List<IWebElement> TemplatesCards => Container.FindElements(By.CssSelector(".template-design-list ng-spd-item-card")).ToList();
    private string _cardTitle => ".header-content .title";

    private IWebElement _actions => Container.FindElement(By.CssSelector("ng-spd-dialog-actions"));
    private IWebElement _closeButton => _actions.FindElement(By.CssSelector("button.basic"));
    private IWebElement _selectButton => _actions.FindElement(By.CssSelector("button.primary"));

    private IWebElement _emptyState => Container.FindElement(By.CssSelector("app-empty-state"));

    public void Select()
    {
        _selectButton.Click();
    }

    public void SelectTemplate(string name)
    {
        var cardElement = TemplatesCards.Find(e => e.Text == name);
        switch (cardElement)
        {
            case null:
                throw new Exception($"Template with name {name} not found");
            default:
                cardElement.Click();
                Container.GetDriver().WaitForHorizonIsStable();
                break;
        }
    }

    public IWebElement GetEmptyState()
    {
        return _emptyState;
    }

    public void AssignTemplate(string templateName)
    {
        SelectTemplate(templateName);
        Select();
        Container.GetDriver().WaitForHorizonIsStable();
    }
}
