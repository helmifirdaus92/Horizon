// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Templates;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

public class PageDesignDialog : DialogBase
{
    public PageDesignDialog(IWebElement container) : base(container)
    {
    }

    private IWebElement RightContainer => Container.FindElement(".right-container");

    public List<ItemCardDesigns> PageDesignCards => RightContainer.FindElements(".page-design-list ng-spd-item-card").ToList()
        .ConvertAll(WebElementToPageDesignCard);

    private IWebElement _actions => Container.FindElement("ng-spd-dialog-actions");
    private IWebElement _save => _actions.FindElement("button.primary");

    private IWebElement _leftContainer => Container.FindElement(".left-container");
    private IWebElement _itemDetailAction => _leftContainer.FindElement(".item-detail-actions");
    private IWebElement _deselect => _itemDetailAction.FindElement("#deselect");
    private IWebElement _preview => _itemDetailAction.FindElement("button[icon='eye-outline']");

    public void Deselect() { _deselect.Click(); }

    public bool IsSaveEnabled => _save.Enabled;

    public void ClickCancelButton() { ClickActionButton("Cancel"); }
    public void ClickSaveButton() { ClickActionButton("Save"); }

    private static ItemCardDesigns WebElementToPageDesignCard(IWebElement input)
    {
        return new ItemCardDesigns(input);
    }

    public ItemCardDesigns? GetPageDesignCardByName(string name)
    {
        return PageDesignCards.Find(c => c.Title.Equals(name));
    }

    public void SelectPageDesignCard(string name)
    {
        GetPageDesignCardByName(name)!.Select();
    }

    public ItemCardDesigns? AssignedPageDesign()
    {
        return PageDesignCards.Find(p => p.IsSelected());
    }

    public void OpenPreviewForSelectedDesign()
    {
        _preview.Click();
    }
}
