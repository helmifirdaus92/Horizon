// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;

public class ComponentsPanel : BaseControl
{
    public ComponentsPanel(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public List<string> CompatibleRenderingsList => CompatibleRenderings.Select(rendering => rendering.Text.Trim()).ToList();
    public string NoAllowedComponentsMessage => EmptyState.FindElement("div h4").Text + EmptyState.FindElement(".ng-spd-empty-state-content div").Text;

    private IWebElement CloseButton => Container.FindElement("button i.filled.mdi.mdi-close");
    private IEnumerable<IWebElement> CompatibleRenderings => Container.FindElements("app-gallery-item").ToList();
    private IWebElement EmptyState => Container.FindElement("ng-spd-empty-state");

    public void SelectRenderingComponentByName(string name)
    {
        CompatibleRenderings.FirstOrDefault(rendering => rendering.Text.Equals(name))!.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public ComponentGallery Gallery => new (Container.FindElement(Constants.ComponentsGallerySelector));
}
