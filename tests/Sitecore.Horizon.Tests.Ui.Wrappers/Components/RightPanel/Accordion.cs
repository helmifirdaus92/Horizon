// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.ObjectModel;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class Accordion
    {
        private readonly WebElement _section;

        public Accordion(WebElement section)
        {
            _section = section;
        }

        public string Text => _section.Text;

        public WebElement Contents => _section.FindElement("ng-spd-accordion-content");
        private WebElement SectionHeader => _section.FindElement("ng-spd-accordion-header");
        public string HeaderText => SectionHeader.Text;

        public ReadOnlyCollection<WebElement> GetExtensions()
        {
            return _section.FindElements("app-sitecore-extension");
        }

        public bool IsExpanded()
        {
            return Contents.GetClass().Contains("open");
        }

        public void Expand()
        {
            if (IsExpanded())
            {
                return;
            }
            SectionHeader.Click();
            _section.WaitForCondition(s => IsExpanded());
            _section.Driver.WaitForHorizonIsStable();
        }

        public void Collapse()
        {
            if (!IsExpanded())
            {
                return;
            }

            SectionHeader.Click();
        }
    }
}
