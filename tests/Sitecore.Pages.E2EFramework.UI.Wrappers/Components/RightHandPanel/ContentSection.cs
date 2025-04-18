// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;

public class ContentSection : BaseControl
{
    public ContentSection(IWebElement container) : base(container)
    {
    }

    private IWebElement SelectItemButton => Container.FindElement(".select-datasource-item");

    public string ItemName => Container.FindElement(".item-name-content .text").Text;

    public DatasourceDialog InvokeDatasourceDialog()
    {
        SelectItemButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        return new DatasourceDialog(Container.GetDriver().FindElement("app-datasource-dialog"));
    }
}
