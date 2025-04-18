// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Templates;

public class TemplateInfo : BaseControl
{
    public TemplateInfo(IWebElement container) : base(container)
    {
        Container.GetDriver().WaitForDotsLoader();
    }

    public string Name => Container.FindElement("#templateName>.row-text").Text;
    public int UsageCount => int.Parse(Container.FindElement("#usageCount").Text);
    public string AssociatedPageDesign => _associatedPageDesign.Text;
    public string LastModifiedDate => _lastModifiedDate.Text;
    private IWebElement _associatedPageDesign => Container.FindElement("td>[class*=page-design]");
    private IWebElement _configurePageDesignButton => Container.FindElement(".assign-page-design>button");
    private IWebElement _configureInsertOptionsButton => Container.FindElement(".insert-options>button");
    private IWebElement _moreOptionsButton => Container.FindElement(".modified-date>button");
    private IWebElement _lastModifiedDate => Container.FindElement(".modified-date");

    public void InvokePageDesignDialog()
    {
        _configurePageDesignButton.Click();
    }

    public void InvokeInsertOptionsDialog()
    {
        _configureInsertOptionsButton.Click();
    }

    public ContextMenu InvokeContextMenu()
    {
        _moreOptionsButton.Click();
        return Container.GetDriver().GetContextMenuOnButton();
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

    public DuplicateDialog InvokeDuplicateDialog()
    {
        InvokeContextMenu().InvokeDuplicate();
        return new DuplicateDialog(Container.GetDriver().FindElement(Constants.DuplicateDialogLocator));
    }
}
