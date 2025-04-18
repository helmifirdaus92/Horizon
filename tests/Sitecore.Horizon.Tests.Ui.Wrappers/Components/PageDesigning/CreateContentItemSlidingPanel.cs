// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageDesigning
{
    public class CreateContentItemSlidingPanel
    {
        private readonly WebElement _slidingPanel;

        public CreateContentItemSlidingPanel(WebElement container)
        {
            _slidingPanel = container;
        }

        public ReadOnlyCollection<WebElement> InsertOptionsElements => _slidingPanel.FindElement("ng-spd-list").GetChildren();

        public List<string> GetInsertOptions()
        {
            return InsertOptionsElements.Select(ie => ie.Text).ToList();
        }

        public void SelectTemplate(string templateName)
        {
            WebElement template = null;
            this.WaitForCondition(c =>
            {
                template = InsertOptionsElements.FirstOrDefault(element => element.Text == templateName);
                return template != null;
            }, 10000);

            template.Click();
            _slidingPanel.Driver.WaitForHorizonIsStable();
        }

        public void GoBack()
        {
            _slidingPanel.Driver.FindElement("ng-spd-slide-in-panel-header button").Click();
            _slidingPanel.Driver.WaitForHorizonIsStable();
        }
    }
}
