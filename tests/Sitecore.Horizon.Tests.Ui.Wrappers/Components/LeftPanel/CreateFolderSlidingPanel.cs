// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel
{
    public class CreateFolderSlidingPanel
    {
        private WebElement _slidingPanel;
        private string inlineNotificationSelector = "ng-spd-inline-notification";

        public CreateFolderSlidingPanel(WebElement container)
        {
            _slidingPanel = container;
        }

        public ReadOnlyCollection<WebElement> InsertOptionsElements => _slidingPanel.FindElement("ng-spd-list").GetChildren();
        public string InlineNotification => _slidingPanel.FindElement(inlineNotificationSelector).Text;
        public bool IsInlineNotificationShown => _slidingPanel.CheckElementExists(inlineNotificationSelector);

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
            var jsHelper = new JsHelper(template.Driver);
            template.Click();
            _slidingPanel.Driver.WaitForHorizonIsStable();
        }
    }
}
