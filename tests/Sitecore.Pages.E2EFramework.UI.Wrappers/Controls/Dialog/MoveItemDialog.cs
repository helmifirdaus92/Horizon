// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog
{
    public class MoveItemDialog : DialogBase
    {
        private IWebElement? _editableElement;

        public MoveItemDialog(IWebElement container) : base(container)
        {
        }

        public string EmptyFolderDescription => Container.FindElement("app-empty-state").Text;
        private Button MoveUpButton => new(Container.FindElement("ng-spd-dialog-header button"));
        private IEnumerable<IWebElement> Folders => Container.FindElements("ng-spd-item-card[icon=folder-outline]");

        public void ClickNewFolderButton()
        {
            Container.GetDriver().WaitForHorizonIsStable();
            ClickActionButton("New folder");
        }
        public void ClickCancelButton() { ClickActionButton("Cancel"); }

        public void ClickMoveButton()
        {
            Container.GetDriver().WaitForHorizonIsStable();
            ClickActionButton("Move here");
        }

        public bool IsMoveButtonEnabled()
        {
            var moveButton = Buttons.FirstOrDefault(element => element.Text == "Move here");
            this.WaitForCondition(c => !moveButton.HasAttribute("disabled"));
            return moveButton != null && moveButton.Enabled;
        }

        public bool IsMoveButtonDisabled()
        {
            var moveButton = Buttons.FirstOrDefault(element => element.Text == "Move here");
            this.WaitForCondition(c => moveButton.HasAttribute("disabled"));
            return moveButton != null && !moveButton.Enabled;
        }

        public MoveItemDialog SelectFolderToMove(string title)
        {
            Container.GetDriver().WaitForDialog();
            var folderToSelect = Folders.First(folder => folder.FindElement(".title").Text == title);
            folderToSelect.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            return this;
        }

        public MoveItemDialog CreateNewFolder(string newFolderName)
        {
            ClickNewFolderButton();

            _editableElement = FindEditableElement();
            TextBox text = new(_editableElement);
            text.Clear();
            text.Text = newFolderName;
            _editableElement?.SendKeys(Keys.Enter);
            Container.GetDriver().WaitForHorizonIsStable();
            return this;
        }

        public MoveItemDialog MoveToHeader()
        {
            MoveUpButton.Click();
            return this;
        }

        private IWebElement FindEditableElement()
        {
            return Folders.Select(el => el.FindElement(".title")).ToList()
                .First(el => el.GetAttribute("contenteditable") == "true");
        }
    }
}
