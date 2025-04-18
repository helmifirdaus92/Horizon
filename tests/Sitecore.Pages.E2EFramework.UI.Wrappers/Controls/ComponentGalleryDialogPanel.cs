// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class ComponentGalleryDialogPanel : BaseControl
{
    public ComponentGalleryDialogPanel(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public ComponentGallery ComponentsGallery => new(Container.FindElement(Constants.ComponentsGallerySelector));
    public string HeaderText => _header.Text;

    private IWebElement _header => Container.FindElement("ng-spd-dialog-header");
    private IWebElement _closeButton => Container.FindElement("ng-spd-dialog-close-button");

    public void Close()
    {
        _closeButton.Click();
    }
}
