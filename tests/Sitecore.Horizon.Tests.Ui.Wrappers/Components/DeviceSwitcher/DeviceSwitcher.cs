// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.DeviceSwitcher
{
    public class DeviceSwitcher
    {
        protected const int TransitionTimeout = 1200;
        private readonly Action _waitAction;
        private string deviceSelectorElementName = "app-device-selector";
        private readonly string canvasCssSelector = "iframe:not([hidden])";

        public DeviceSwitcher(BrowserWrapper browser, Action waitActionAfterSwitchingDevice = null)
        {
            _browser = browser;
            _waitAction = waitActionAfterSwitchingDevice;
        }

        public string SelectedDevice
        {
            get
            {
                return GetSelectedDeviceInSwitcher();
            }
        }

        public string WorkspaceWidth
        {
            get
            {
                bool isAppWithCanvasOpened = _browser.CheckElementExists(canvasCssSelector);
                return isAppWithCanvasOpened ? GetSelectedDeviceInCanvas() : null;
            }
        }

        public Size LayoutSize
        {
            get
            {
                int width = PixelsToInt(LayoutFrame.GetCssValue("width"));
                int height = PixelsToInt(LayoutFrame.GetCssValue("height"));

                return new Size(width, height);
            }
        }

        public BreakPoints BreakPointsPopOver => new(_deviseSelector.Driver.FindElement(Constants.popOverLocator));

        public List<string> List => _browser.FindElements($"{deviceSelectorElementName} .devices-container button")
            .Select(d => d.GetTitle()).ToList();

        protected virtual WebElement LayoutFrame => _browser.FindElement(canvasCssSelector);

        protected WebElement DeviceChrome => LayoutFrame.GetParent().GetParent();

        private BrowserWrapper _browser { get; }
        private WebElement _deviseSelector => _browser.FindElement(deviceSelectorElementName);
        private WebElement deviceSelectorButton => _browser.FindElement($"{deviceSelectorElementName} ng-spd-tab-group button");
        private WebElement breakPointsDropdown => _deviseSelector.FindElement("button#devideSelectorBtn");

        public BreakPoints OpenBreakPoints()
        {
            if (!_deviseSelector.Driver.CheckElementExists(Constants.popOverLocator))
            {
                breakPointsDropdown.Click();
                _deviseSelector.Driver.WaitForHorizonIsStable();
            }
            return BreakPointsPopOver;
        }

        public void CloseBreakPoints()
        {
            breakPointsDropdown.Click();
            _deviseSelector.Driver.WaitForHorizonIsStable();
            _deviseSelector.WaitForCondition(o => !_deviseSelector.Driver.CheckElementExists(Constants.popOverLocator));
        }

        public DeviceSwitcher SwitchTo(string device)
        {
            deviceSelectorButton.Click();
            deviceSelectorButton.Driver.WaitForHorizonIsStable();
            var selector = $"app-device-selector button[title*='{device}']";
            _browser.FindElement(selector).Click();
            if (_waitAction != null)
            {
                _waitAction();
            }
            else
            {
                Thread.Sleep(TransitionTimeout);
            }

            return this;
        }

        protected int PixelsToInt(string value)
        {
            return int.Parse(value.Replace("px", "").Split(new[]
            {
                "."
            }, StringSplitOptions.RemoveEmptyEntries).First());
        }

        private string GetSelectedDeviceInSwitcher()
        {
            return _browser.FindElement($"{deviceSelectorElementName} button[aria-selected=true]").GetTitle();
        }

        private string GetSelectedDeviceInCanvas()
        {
            return DeviceChrome.GetCssValue("width");
        }
    }
}
