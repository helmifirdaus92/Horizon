// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

public class ChartToolTip : BaseControl
{
    public ChartToolTip(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public List<string> Text => ToolTipContent.Text.Split(new string[]
    {
        Environment.NewLine
    }, StringSplitOptions.None).Select(s => s.Trim()).ToList();

    public IWebElement ToolTipContent => Container.FindElement(".tooltip-content");
}
