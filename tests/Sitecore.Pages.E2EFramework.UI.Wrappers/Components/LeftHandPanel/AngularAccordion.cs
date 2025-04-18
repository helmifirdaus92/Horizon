// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel
{
    public class AngularAccordion : AngularControl, INamedObject
    {
        public AngularAccordion(IWebElement container) : base(container)
        {
        }

        public string Name => Container.FindElement("ng-spd-accordion-header").Text;

        public bool IsExpanded => ContentContainer.Displayed
            && ContentContainer.GetClassList().Contains("open");

        public NamedCollection<Button> GalleryItems
        {
            get
            {
                Expand();
                return ContentContainer.FindNamedControls<Button>("app-gallery-item");
            }
        }

        public IReadOnlyCollection<IWebElement> ComponentCards => ContentContainer.FindElements("app-gallery-item");
        public IReadOnlyCollection<IWebElement> FeAASComponentCards => ContentContainer.FindElements("ng-spd-accordion-content .card-container");
        public List<string> FeAASComponentNames => FeAASComponentCards.Select(c => c.FindElement(".card-text").Text.Trim()).ToList();

        private IWebElement ContentContainer => Container.FindElement("ng-spd-accordion-content");

        public void Expand()
        {
            if (!IsExpanded)
            {
                Container.Click();
                this.WaitForCondition(e => e.IsExpanded);
            }
        }

        public void Collapse()
        {
            if (IsExpanded)
            {
                Container.Click();
                this.WaitForCondition(e => !e.IsExpanded);
            }
        }
    }
}
