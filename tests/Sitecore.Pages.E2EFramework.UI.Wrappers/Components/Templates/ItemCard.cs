// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Templates;

public class ItemCard : BaseControl
{
    public ItemCard(IWebElement container) : base(container)
    {
    }

    public string Title => _title.Text;
    public bool ActionsButtonsAvailable => Container.CheckElementExists("[class*=card-actions] button");

    public bool HasSelectedState => Container.GetClass().Contains("selected");

    private IWebElement _title => Container.FindElement(".header-content .title");
    private IWebElement _contentMenuDots => Container.FindElement("button[icon=dots-horizontal]");
    private IWebElement _editPenIcon => Container.FindElement(".vertical-actions button[icon=pencil-outline]");
    public void Edit() => _editPenIcon.Click();

    public ItemCard Select()
    {
        Container.Click();
        return this;
    }

    public ContextMenu InvokeContextMenu()
    {
        _contentMenuDots.Click();
        return Container.GetDriver().GetContextMenuOnButton();
    }

    public DuplicateDialog InvokeDuplicateDialog()
    {
        InvokeContextMenu().InvokeDuplicate();
        return new DuplicateDialog(Container.GetDriver().FindElement(Constants.DuplicateDialogLocator));
    }

    public MoveItemDialog InvokeMoveItemDialog()
    {
        InvokeContextMenu().InvokeMoveTo();
        return new MoveItemDialog(Container.GetDriver().FindElement(Constants.MoveItemDialogLocator));
    }

    public DeleteDialog InvokeDeleteDialog()
    {
        InvokeContextMenu().InvokeDelete();
        return new DeleteDialog(Container.GetDriver().FindElement(Constants.WarningDialogLocator));
    }

    public RenameDialog InvokeRenameDialog()
    {
        InvokeContextMenu().InvokeRename();
        return new RenameDialog(Container.GetDriver().FindElement(Constants.RenameItemDialogLocator));
    }
}
