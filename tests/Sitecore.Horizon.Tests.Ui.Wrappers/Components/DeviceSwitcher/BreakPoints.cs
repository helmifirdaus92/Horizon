// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.DeviceSwitcher;

public class BreakPoints
{
    private readonly WebElement _breakPoints;

    public BreakPoints(WebElement breakPoints)
    {
        _breakPoints = breakPoints;
    }

    public Rectangle Rectangle => _breakPoints.GetElementRectangle();

    public List<BreakPoint> Items =>
        _breakPoints.FindElements("ng-spd-list button").Select(b => new BreakPoint(b)).ToList();

    public class BreakPoint
    {
        private readonly WebElement _breakPoint;

        public BreakPoint(WebElement breakPoint)
        {
            _breakPoint = breakPoint;
        }

        public string Name => _breakPoint.FindElement(".btn-content").Text;
        public bool IsFixed => _checkBox == null;

        public bool IsChecked => _checkBox.GetClassList().Contains("checked");

        private WebElement _checkBox => _breakPoint.CheckElementExists("ng-spd-checkbox")
            ? _breakPoint.FindElement("ng-spd-checkbox")
            : null;

        public void AddToDeviceSelector()
        {
            if (_checkBox != null && !IsChecked)
            {
                _checkBox.Click();
            }
        }

        public void RemoveFromDeviceSelector()
        {
            if (_checkBox != null && IsChecked)
            {
                _checkBox.Click();
            }
        }

        public void Select() => _breakPoint.Click();
    }
}
