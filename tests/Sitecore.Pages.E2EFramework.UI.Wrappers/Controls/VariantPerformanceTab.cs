// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class VariantPerformanceTab : BaseControl
{
    public VariantPerformanceTab(IWebElement container) : base(container)
    {
    }

    public string Header => Container.FindElement(".ng-spd-empty-state-wrapper h4").Text;
    public string Content => Container.FindElement(".ng-spd-empty-state-content p").Text;
}
