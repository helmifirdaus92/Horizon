// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Text.RegularExpressions;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Versions;

public class Version : BaseControl
{
    private readonly Action _canvasReloadWaitMethod;

    public Version(IWebElement container, Action canvasReloadWaitMethod) : base(container)
    {
        _canvasReloadWaitMethod = canvasReloadWaitMethod;
    }

    public string Name => Container.FindElement(".version-name").Text;
    public int Number => int.Parse(Regex.Match(_numberString, @"\d+").Value);
    public string _numberString => Container.FindElement(".version-number").Text;
    public bool IsHighlighted => Container.GetClassList().Contains("highlight");
    private IWebElement _contentMenuDots => Container.FindElement("button[icon=dots-horizontal]");

    public ContextMenu InvokeContextMenu()
    {
        _contentMenuDots.Hover();
        _contentMenuDots.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        return Container.GetDriver().GetContextMenuOnButton(".version-actions-popover");
    }

    public void Select(bool isVersionExpectedInContext = false)
    {
        Container.Click();
        if (!isVersionExpectedInContext)
        {
            _canvasReloadWaitMethod.Invoke();
        }
    }
}
