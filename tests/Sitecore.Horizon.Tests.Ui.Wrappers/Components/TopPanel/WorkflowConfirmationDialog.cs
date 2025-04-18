// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopPanel;

public class WorkflowConfirmationDialog
{
    private readonly WebElement _element;

    private WebElement _cancelButton => _element.FindElement("ng-spd-dialog-actions>button");

    private WebElement _submitButton => _element.FindElement("ng-spd-dialog-actions button[ngspdbutton = 'primary']");


    public WorkflowConfirmationDialog(WebElement element)
    {
        _element = element;
    }

    public void PressCancel()
    {
        _cancelButton.Click();
        _element.Driver.WaitForHorizonIsStable();
    }

    public void PressSubmit()
    {
        _submitButton.Click();
        _element.Driver.WaitForHorizonIsStable();
    }

    public void EnterComment(string comment)
    {
        var commentElement = _element.Driver.FindElement("textarea");
        commentElement.SendKeys(comment);
    }
}
