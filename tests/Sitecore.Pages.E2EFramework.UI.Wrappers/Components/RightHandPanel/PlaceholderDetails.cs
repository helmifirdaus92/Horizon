// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;

public class PlaceholderDetails : BaseControl
{
    public PlaceholderDetails(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public string PlaceholderKey => GetItemParameterText("Placeholder key");

    private string GetItemParameterText(string propertyName)
    {
        Container.WaitForCondition(props => Container.FindElements(".ph-details .header").Any(x => x.Text.Contains(propertyName)));

        var properties = Container.FindElements(".ph-details .header");

        return properties.First(el => el.Text.Contains(propertyName)).GetNextSibling().Text;
    }
}
