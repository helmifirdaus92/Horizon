// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageDesigning;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

public class DatasourceDialog : DialogBase
{
    public DatasourceDialog(IWebElement container) : base(container)
    {
    }

    public ItemsTree DatasourceItemTree => new(Container.FindElement("app-datasource-picker"), canvasReloadWaitMethod: null);
    public CreateContentItemSlidingPanel ContentItemSlidingPanel => new(Container);

    private IWebElement _cancelButton => Container.FindElement("ng-spd-dialog-actions>button");
    private IWebElement _assignButton => Container.FindElement("ng-spd-dialog-actions button[ngspdbutton = 'primary']");
    private IWebElement _createContentItemButton => Container.FindElement("app-datasource-picker button[title='Create new']");

    public bool IsCancelButtonEnabled()
    {
        return _cancelButton.Enabled;
    }

    public bool IsAssignButtonEnabled()
    {
        return _assignButton.Enabled;
    }

    public void Cancel()
    {
        _cancelButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void Assign()
    {
        _assignButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public TimedNotification GetAllTimedNotifications()
    {
        IWebElement element = Container.FindElements("ng-spd-timed-notification").Last();
        return new TimedNotification(element);
    }

    public void CreateNewDsItem(string dsTemplate, string? dsParent = null, string? dsItemName = null)
    {
        var parent = "Data";
        dsItemName ??= "";
        if (dsParent != null)
        {
            parent = dsParent;
        }

        DatasourceItemTree.GetItemByPath(parent)?.Hover();
        DatasourceItemTree.GetItemByPath(parent)?.InvokeSlidingPanel();
        ContentItemSlidingPanel.SelectTemplate(dsTemplate);

        TreeItem? newItem = DatasourceItemTree.SelectedItem;
        if (dsItemName == "")
        {
            newItem?.Container.ClickOutside();
        }
        else
        {
            newItem?.SetDisplayName(dsItemName);
            newItem?.Container.ClickOutside();
        }
        Assign();
    }
}
