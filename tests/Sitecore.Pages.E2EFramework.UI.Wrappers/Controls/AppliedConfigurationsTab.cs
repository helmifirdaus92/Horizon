// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class AppliedConfigurationsTab : BaseControl
{
    public AppliedConfigurationsTab(IWebElement container) : base(container)
    {
    }

    private IWebElement GoalElement => Container.FindElement(By.CssSelector(".goal-section h3.ng-star-inserted"));
    private IEnumerable<IWebElement> TrafficAllocationElements => Container.FindElements(By.CssSelector(".traffic-allocation-section .variant-item"));
    private IEnumerable<IWebElement> AdvancedOptionsElements => Container.FindElements(By.CssSelector(".advanced-options-section p"));
    private IEnumerable<IWebElement> AutomatedActionsElements => Container.FindElements(By.CssSelector(".automated-actions-section p"));

    public string GetGoal()
    {
        return GoalElement.Text.Trim();
    }

    public string GetTrafficAllocation(string variantName)
    {
        foreach (var element in TrafficAllocationElements)
        {
            var lines = element.Text.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                
            var name = lines[1].Trim();
            var percentage = lines[2].Trim();

            if (name.Equals(variantName, StringComparison.OrdinalIgnoreCase))
            {
                return percentage;
            }
        }
        throw new KeyNotFoundException($"Variant '{variantName}' not found in traffic allocation.");
    }

    public string GetAutomatedAction(string actionKey)
    {
        var elements = AutomatedActionsElements.ToList();
        foreach (var element in elements)
        {
            var parts = element.Text.Split(':');
            if (parts.Length == 2 && parts[0].Trim().Equals(actionKey, StringComparison.OrdinalIgnoreCase))
            {
                return parts[1].Trim();
            }
        }
        throw new KeyNotFoundException($"Automated action '{actionKey}' not found.");
    }

    public string GetAdvancedOption(string optionKey)
    {
        foreach (var element in AdvancedOptionsElements)
        {
            var text = element.Text.Trim();
            if (text.StartsWith(optionKey, StringComparison.OrdinalIgnoreCase))
            {
                var value = text.Substring(optionKey.Length).Trim();
                return value.StartsWith(":") ? value.Substring(1).Trim() : value;
            }
        }
        throw new KeyNotFoundException($"Advanced option '{optionKey}' not found.");
    }
}
