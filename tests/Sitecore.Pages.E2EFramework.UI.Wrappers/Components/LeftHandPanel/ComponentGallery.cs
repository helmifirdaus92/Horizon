// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel
{
    public class ComponentGallery : BaseControl
    {
        private string componentThumbnailSelector = "app-gallery-item";

        public ComponentGallery(IWebElement container) : base(container)
        {
        }

        public NamedCollection<AngularAccordion> ComponentGroups =>
            Container.FindNamedControls<AngularAccordion>("ng-spd-accordion");

        public IWebElement InputBox => Container.FindElement("ng-spd-search-input input");
        public FilterMenu FilterMenu => new(Container.GetDriver().FindElement(".filter-menu"));
        public string FilterLimitationText => FilterMenu.DescriptionText;
        public bool NoResults => _appEmptyState.Displayed;
        public string NoResultsText => _appEmptyState.Text;
        private IWebElement FilterButton => Container.FindElement(".filter-btn button");
        private IWebElement _appEmptyState => Container.FindElement("app-empty-state");

        public FilterMenu OpenFilters()
        {
            FilterButton.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            return FilterMenu;
        }

        public IWebElement GetPageContentComponent(string name)
        {
            this.WaitForCondition(p => p.ComponentGroups["Page Content"].GalleryItems[name].IsEnabled, Settings.LongWaitTimeout);
            return ComponentGroups["Page Content"].GalleryItems[name].Container;
        }

        public IWebElement GetPageStructureComponent(string name)
        {
            this.WaitForCondition(p => p.ComponentGroups["Page Structure"].GalleryItems[name].IsEnabled, Settings.LongWaitTimeout);
            return ComponentGroups["Page Structure"].GalleryItems[name].Container;
        }

        public IWebElement GetMediaComponent(string name)
        {
            this.WaitForCondition(p => p.ComponentGroups["Media"].GalleryItems[name].IsEnabled, Settings.LongWaitTimeout);
            return ComponentGroups["Media"].GalleryItems[name].Container;
        }

        public IWebElement GetFeAASComponent(string componentName, string groupName)
        {
            this.WaitForCondition(p => p.ComponentGroups[groupName].IsExpanded, Settings.LongWaitTimeout);
            return ComponentGroups[groupName].FeAASComponentCards.First(c => c.Text.Contains(componentName));
        }

        public void SelectComponentThumbnail(string componentName)
        {
            var requiredComponent = GetComponentElement(componentName);
            requiredComponent!.Click();
            requiredComponent.GetDriver().WaitForHorizonIsStable();
        }

        public void DragAndDropComponentToCanvas(string componentName, Point dropPoint)
        {
            var cssSelector = $"app-gallery-item[title='{componentName}']";
            var sourceWebElement = GetComponentElement(componentName);
            if (sourceWebElement != null)
            {
                sourceWebElement.DragAndDropToCanvas(cssSelector, dropPoint);
                sourceWebElement.GetDriver().WaitForHorizonIsStable();
            }
        }

        private IWebElement? GetComponentElement(string componentName)
        {
            IWebElement? requiredComponent = Container.FindElements(componentThumbnailSelector).FirstOrDefault(componentThumbnail => componentThumbnail.Text == componentName);
            return requiredComponent;
        }
    }
}
