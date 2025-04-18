// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopPanel;

public class DeviceSwitcher : BaseControl
{
    private string deviceSelectorElementName = "app-device-selector";
    private string popOverLocator = "ng-spd-popover";

    public DeviceSwitcher(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public IWebElement OverlayContainer => Container.GetDriver().FindElement(".cdk-overlay-container");

    public string SelectedDevice
    {
        get
        {
            return GetSelectedDeviceInSwitcher();
        }
    }

    private IWebElement DeviceSelectorButton => Container.FindElement("#devideSelectorBtn");

    public List<string> DevicesList => Container.FindElements($"{deviceSelectorElementName} .devices-container button")
        .Select(d => d.GetTitle()).ToList();

    public DeviceSwitcher SelectDevice(string device)
    {
        string selector = $"{deviceSelectorElementName} button[title*='{device}']";
        Container.FindElement(selector).Click();
        Thread.Sleep(1200);

        return this;
    }

    public DeviceSwitcher SwitchToDevice(string device)
    {
        DeviceSelectorButton.Click();
        string selector = $"button[title*='{device}']";
        OverlayContainer.FindElement(selector).Click();
        Thread.Sleep(1200);

        return this;
    }

    public BreakPoints OpenBreakPoints()
    {
        DeviceSelectorButton.Click();

        return new BreakPoints(OverlayContainer.FindElement(popOverLocator));
    }

    private string GetSelectedDeviceInSwitcher()
    {
        return Container.FindElement($"button[aria-selected=true]").GetTitle();
    }
}

public class BreakPoints : BaseControl
{
    public BreakPoints(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public List<BreakPoint> Items =>
        Container.FindElements("ng-spd-list button").Select(b => new BreakPoint(b)).ToList();

    public void CloseBreakPoints()
    {
        Container.GetParent().Click();
        Container.WaitForCondition(o => !Container.GetDriver().CheckElementExists("ng-spd-popover"));
    }
}

public class BreakPoint : BaseControl
{
    public BreakPoint(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public string Name => Container.FindElement(".btn-content").Text;
    public bool IsFixed => CheckBox == null;

    public bool IsChecked => CheckBox.GetClassList().Contains("checked");

    private IWebElement? CheckBox => Container.CheckElementExists("ng-spd-checkbox")
        ? Container.FindElement("ng-spd-checkbox")
        : null;

    public void AddToDeviceSelector()
    {
        if (CheckBox != null && !IsChecked)
        {
            CheckBox.Click();
        }
    }

    public void RemoveFromDeviceSelector()
    {
        if (CheckBox != null && IsChecked)
        {
            CheckBox.Click();
        }
    }
}
