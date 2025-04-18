// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class ToggleButton : BaseControl
{
    private const string ExpandedCss = "rotate";
    private readonly IWebElement _button;
    private readonly bool _reverse;

    public ToggleButton(IWebElement container, bool reverse = false) : base(container)
    {
        _button = container;
        _reverse = reverse;
    }

    public bool IsExpanded => _reverse ? !_button.GetClass().Contains(ExpandedCss) : _button.GetClass().Contains(ExpandedCss);
    public bool Displayed => _button.Displayed;

    public void Expand()
    {
        if (!IsExpanded)
        {
            _button.HoverAndClick();
            _button.WaitForCondition(b => IsExpanded,message:"Toggle button did not turn");
            _button.GetDriver().WaitForHorizonIsStable();
            _button.GetDriver().WaitForCondition(d => d.CheckElementExists("ng-spd-split-pane.show"),message:"Angular split pane was not hidden");
        }
    }

    public void Collapse()
    {
        if (IsExpanded)
        {
            _button.HoverAndClick();
            _button.WaitForCondition(b => !IsExpanded,message:"Toggle button did not turn");
            _button.GetDriver().WaitForHorizonIsStable();
            _button.GetDriver().WaitForCondition(d => d.CheckElementExists("ng-spd-split-pane.hide"),message:"Angular split pane was not shown");
        }
    }
}
