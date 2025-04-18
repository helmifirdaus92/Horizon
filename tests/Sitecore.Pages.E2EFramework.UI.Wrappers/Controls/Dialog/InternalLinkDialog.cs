// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

public class InternalLinkDialog : DialogBase
{
    public InternalLinkDialog(IWebElement container) : base(container)
    {
    }

    public ItemsTree ItemTree => new(Container.FindElement("app-item-tree"), canvasReloadWaitMethod: null);

    public void ClickCancelButton() { ClickActionButton("Cancel"); }
    public void ClickAddLinkButton() { ClickActionButton("Add link"); }
}
