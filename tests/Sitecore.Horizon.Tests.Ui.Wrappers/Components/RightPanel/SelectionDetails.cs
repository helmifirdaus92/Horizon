// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class SelectionDetails
    {
        private readonly WebElement _details;
        private readonly string _accordionHeaderContentSelector = ".ng-spd-accordion-header-content";

        public SelectionDetails(WebElement details)
        {
            _details = details;
        }

        public IList<WebElement> Sections => _details.FindElements("ng-spd-accordion");

        public Accordion GetAccordion(string sectionName) => new Accordion(Sections.First(s => s.FindElement(_accordionHeaderContentSelector).Text == sectionName));
        public bool IsAccordionPresent(string sectionName) => _details.FindElements(_accordionHeaderContentSelector).Any(a => a.Text == sectionName);
    }
}
