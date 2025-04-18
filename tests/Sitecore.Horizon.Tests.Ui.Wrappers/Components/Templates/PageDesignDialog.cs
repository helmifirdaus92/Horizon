// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates;

public class PageDesignDialog
{
    private WebElement _pageDesignDialog;

    public PageDesignDialog(WebElement pageDesignDialog)
    {
        _pageDesignDialog = pageDesignDialog;
        WaitEmptyStateToDisappear();
    }

    public List<PageDesignCard> PageDesignCards => _rightContainer.FindElements(".page-design-list ng-spd-item-card").ToList()
        .ConvertAll(WebElementToPageDesignCard);

    public bool IsSaveEnabled => _save.Enabled;

    private WebElement _actions => _pageDesignDialog.FindElement("ng-spd-dialog-actions");
    private WebElement _cancel => _actions.FindElement("button.basic");
    private WebElement _save => _actions.FindElement("button.primary");
    private WebElement _leftContainer => _pageDesignDialog.FindElement(".left-container");
    private WebElement _rightContainer => _pageDesignDialog.FindElement(".right-container");
    private WebElement _itemDetailAction => _leftContainer.FindElement(".item-detail-actions");
    private WebElement _previewButton => _itemDetailAction.FindElement("button[icon=eye-outline]");
    private WebElement _deselect => _itemDetailAction.FindElement("button:not([icon=eye-outline]");

    public PageDesignCard SelectPageDesignCard(string name)
    {
        return PageDesignCards.Find(c => c.Title.Equals(name)).Select();
    }

    public void Deselect() { _deselect.Click(); }

    public void Cancel() { _cancel.Click(); }

    public void Save() { _save.Click(); }

    public PageDesignCard AssignedPageDesign()
    {
        return PageDesignCards.Find(p => p.IsSelected());
    }

    private static PageDesignCard WebElementToPageDesignCard(WebElement input)
    {
        return new PageDesignCard(input);
    }

    private void WaitEmptyStateToDisappear()
    {
        _pageDesignDialog.Driver.WaitForDocumentLoaded();
        _pageDesignDialog.WaitForCondition(b=> !b.CheckElementExists("app-empty-state"));
    }
}
