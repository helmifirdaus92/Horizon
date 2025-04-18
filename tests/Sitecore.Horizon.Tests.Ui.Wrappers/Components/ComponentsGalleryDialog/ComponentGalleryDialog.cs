// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ComponentsGalleryDialog;

public class ComponentGalleryDialog
{
    private WebElement _dialog;

    public ComponentGalleryDialog(WebElement dialog)
    {
        _dialog = dialog;
    }

    public ComponentsGallery ComponentsGallery => new(_dialog.FindElement("app-component-gallery"));
    public string HeaderText => _header.Text;

    private WebElement _header => _dialog.FindElement("ng-spd-dialog-header");
    private WebElement _closeButton => _dialog.FindElement("ng-spd-dialog-close-button");

    public void Close()
    {
        _closeButton.Click();
    }
}
