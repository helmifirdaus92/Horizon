// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Controls
{
    public class ToggleButton : IExpandable
    {
        private const string ExpandedCss = "rotate";
        private readonly WebElement _button;
        private readonly bool _reverse;

        public ToggleButton(WebElement element, bool reverse = false)
        {
            _button = element;
            _reverse = reverse;
        }

        public bool IsExpanded => _reverse ? !_button.GetClass().Contains(ExpandedCss) : _button.GetClass().Contains(ExpandedCss);
        public bool Displayed => _button.Displayed;

        public void Expand()
        {
            if (!IsExpanded)
            {
                _button.Click();
                _button.WaitForCondition(b => IsExpanded);
                _button.Driver.WaitForHorizonIsStable();
            }
        }

        public void Collapse()
        {
            if (IsExpanded)
            {
                _button.Click();
                _button.WaitForCondition(b => !IsExpanded);
                _button.Driver.WaitForHorizonIsStable();
            }
        }
    }
}
