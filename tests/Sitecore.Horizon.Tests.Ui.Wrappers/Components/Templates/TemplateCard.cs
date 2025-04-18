// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

public class TemplateCard
{
    private readonly WebElement _card;

    public TemplateCard(WebElement card)
    {
        _card = card;
    }

    public string Name => _card.FindElement(".header .title").Text;

    public WebElement Thumbnail => _card.FindElement(".thumbnail-container");
    public string AssociatedPageDesign => _associatedPageDesign.Text;
    public string ActionButtonText => _actionButton.Text;
    private WebElement _associatedPageDesign => _card.FindElement(".page-design-left>span:not(.details-heading)");
    private WebElement _actionButton => _card.FindElement(".page-design-right>button");

    public void InvokePageDesignsDialog()
    {
        _actionButton.Click();
    }

    public TemplateCard Select()
    {
        _card.Click();
        return this;
    }

    public bool IsSelected()
    {
        return _card.GetClassList().Contains("selected");
    }

    public ContextMenu OpenContextMenu()
    {
        _card.Driver.WaitForHorizonIsStable();
        _card.Hover();
        _card.FindElement("button[icon='dots-horizontal']").Click();
        _card.Driver.WaitForHorizonIsStable();
        return new ContextMenu(_card.Driver.FindElement("ng-spd-popover"));
    }

    public RenameDialog InvokeRenameDialog()
    {
        OpenContextMenu().InvokeRename();
        return new RenameDialog(_card.Driver.FindElement(Constants.dialogLocator));
    }
    public DeleteDialog InvokeDeleteDialog()
    {
        OpenContextMenu().InvokeDelete();
        return new DeleteDialog(_card.Driver.FindElement(Constants.dialogLocator));
    }
}
