// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Templates;

public class ItemCardDesigns : ItemCard
{
    public ItemCardDesigns(IWebElement container) : base(container)
    {
    }

    public bool IsSelected() { return Container.GetClassList().Contains("selected"); }
    /*
     * TODO Rethink this implementation
     */
    //private IWebElement _editPenIcon => Container.FindElement(".vertical-actions button[icon=pencil-outline]");
    //private IWebElement _contentMenuDots => Container.FindElement("button[icon=dots-horizontal]");
    //public void Edit() => _editPenIcon.Click();
}
