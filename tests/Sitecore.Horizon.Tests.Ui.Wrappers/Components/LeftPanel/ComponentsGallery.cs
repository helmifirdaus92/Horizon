// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel
{
    public class ComponentsGallery
    {
        private WebElement _container;
        private string componentThumbnailSelector = "app-gallery-item";


        public ComponentsGallery(WebElement container)
        {
            _container = container;
        }

        public void SelectComponentThumbnail(string componentName)
        {
            var requiredComponent = GetComponentElement(componentName);
            requiredComponent.ScrollToVisible();
            requiredComponent.Click();
            requiredComponent.Driver.WaitForHorizonIsStable();
        }

        public List<string> GetAllComponents()
        {
            var components = new List<string>();
            components = _container.FindElements(componentThumbnailSelector).Select(component => component.Text).ToList();
            return components;
        }

        public void DragAndDropComponentOnCanvas(string componentName, Point dropPoint)
        {
            var sourceWebElement = GetComponentElement(componentName);
            sourceWebElement.DragAndDropToCanvas(dropPoint);
            sourceWebElement.Driver.WaitForHorizonIsStable();
        }

        public void DragAndMoveToCanvas(string componentName, Point dropPoint)
        {
            var sourceWebElement = GetComponentElement(componentName);
            sourceWebElement.DragAndMoveToCanvas(dropPoint);
            sourceWebElement.Driver.WaitForHorizonIsStable();
        }

        public void MoveAndDropToCanvas(string componentName, Point dropPoint)
        {
            var sourceWebElement = GetComponentElement(componentName);
            sourceWebElement.MoveAndDropToCanvas(dropPoint);
            sourceWebElement.Driver.WaitForHorizonIsStable();
        }

        private WebElement GetComponentElement(string componentName)
        {
            WebElement requiredComponent = null;
            this.WaitForCondition(c =>
            {
                requiredComponent = _container.FindElements(componentThumbnailSelector).FirstOrDefault(componentThumbnail => componentThumbnail.Text == componentName);
                return requiredComponent != null;
            }, 2000);
            return requiredComponent;
        }

        public Accordion GetAccordion(string sectionName)
        {
            WebElement accordion = null;
            this.WaitForCondition(c =>
            {
                accordion = Sections.FirstOrDefault(s => s.FindElement("ng-spd-accordion-header").Text == sectionName);
                return accordion != null;
            }, 2000);
            return new Accordion(accordion);
        }

        public IList<WebElement> Sections => _container.FindElements("ng-spd-accordion");

        public void ExpandSection(string sectionName)
        {
            var section = GetAccordion(sectionName);
            section.Expand();
            section.WaitForCondition(s => s.IsExpanded(), 5000);
            _container.Driver.WaitForHorizonIsStable();
        }
    }
}
