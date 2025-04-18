// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel
{
    public class SelectTemplateDialog
    {
        private WebElement _selectTemplateDialog;

        public SelectTemplateDialog(WebElement selectTemplateDialog)
        {
            _selectTemplateDialog = selectTemplateDialog;
        }

        public List<SelectTemplateCard> TemplatesCards => _selectTemplateDialog.FindElements(".template-design-list ng-spd-item-card").ToList()
            .ConvertAll(WebElementToPageDesignCard);


        private WebElement _actions => _selectTemplateDialog.FindElement("ng-spd-dialog-actions");
        private WebElement _closeButton => _actions.FindElement("button.basic");
        private WebElement _selectButton => _actions.FindElement("button.primary");

        private WebElement _emptyState => _selectTemplateDialog.FindElement("app-empty-state");

        public void Select()
        {
            _selectButton.Click();
        }

        public void Close()
        {
            _closeButton.Click();
        }

        public List<string> GetInsertOptions()
        {
            return TemplatesCards.Select(ie => ie.Title).ToList();
        }

        public SelectTemplateCard SelectTemplate(string name)
        {
            return TemplatesCards.Find(c => c.Title.Equals(name)).Select();
        }

        public WebElement GetEmptyState()
        {
            return _emptyState;
        }

        private static SelectTemplateCard WebElementToPageDesignCard(WebElement input)
        {
            return new SelectTemplateCard(input);
        }
    }
}
