// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList
{
    public class ContextMenu: BaseContextMenu
    {

        public ContextMenu(WebElement element):base(element)
        {
        }

        public Rectangle Rectangle => _contextMenu.GetElementRectangle();

        public bool IsContextMenuDisplayed()
        {
            return _contextMenu.Displayed;
        }

        public void InvokeDelete()
        {
            GetElement(ContextMenuButtons.Delete).Click();
        }

        public SelectTemplateDialog InvokeCreatePage()
        {
            GetElement(ContextMenuButtons.CreatePage).Click();
            return GetSelectTemplateDialog();
        }

        public CreateFolderSlidingPanel InvokeCreateFolder()
        {
            GetElement(ContextMenuButtons.CreateFolder).Click();
            return GetCreateFolderSlidingPanel();
        }

        public void InvokeRename()
        {
            ClickOnContextMenuOption(ContextMenuButtons.Rename);
        }

        public RenameItemDialog InvokeRenameItem()
        {
            ClickOnContextMenuOption(ContextMenuButtons.RenameItem);
            return new RenameItemDialog(_contextMenu.Driver.FindElement("app-rename-item-dialog"));
        }

        public void InvokeRenamePageVariant()
        {
            ClickOnContextMenuOption(ContextMenuButtons.RenamePageVariant);
        }

        public void InvokeEditAudience()
        {
            ClickOnContextMenuOption(ContextMenuButtons.EditAudience);
        }

        public void InvokeSetPublishingDates()
        {
            ClickOnContextMenuOption(ContextMenuButtons.SetPublishingDates);
        }

        public void InvokeDuplicate()
        {
            ClickOnContextMenuOption(ContextMenuButtons.Duplicate);
        }

        public void InvokeEdit()
        {
            ClickOnContextMenuOption(ContextMenuButtons.Edit);
        }

        public bool IsButtonEnabled(ContextMenuButtons button)
        {
            return !GetElement(button).HasAttribute("disabled");
        }

        public string GetButtonTitle(ContextMenuButtons button)
        {
            return GetElement(button).GetTitle();
        }

        public void ClickOnContextMenuOption(ContextMenuButtons button)
        {
            GetElement(button).Click();
            _contextMenu.Driver.WaitForHorizonIsStable();
        }

        public void ClickOnContextMenuOptionWithoutWaitingForHorizonIsStable(ContextMenuButtons button)
        {
            var menuOptionElement = GetElement(button);
            Logger.WriteLine("menuOptionElement of menu: " + menuOptionElement.GetAttribute("Title"));
            menuOptionElement.Click();
        }

        private WebElement GetElement(ContextMenuButtons button)
        {
            string text = null;
            switch (button)
            {
                case ContextMenuButtons.Delete:
                    text = "Delete";
                    break;
                case ContextMenuButtons.CreatePage:
                    text = "Create a subpage";
                    break;
                case ContextMenuButtons.CreateFolder:
                    text = "Create a folder";
                    break;
                case ContextMenuButtons.CreateNew:
                    text = "Create new";
                    break;
                case ContextMenuButtons.Rename:
                    text = "Rename";
                    break;
                case ContextMenuButtons.RenameItem:
                    text = "Rename item";
                    break;
                case ContextMenuButtons.SetPublishingDates:
                    text = "Set publishing dates";
                    break;
                case ContextMenuButtons.Duplicate:
                    text = "Duplicate";
                    break;
                case ContextMenuButtons.RenamePageVariant:
                    text = "Rename page variant";
                    break;
                case ContextMenuButtons.EditAudience:
                    text = "Edit audience";
                    break;
                case ContextMenuButtons.Folder:
                    text = "Folder";
                    break;
                case ContextMenuButtons.PartialDesign:
                    text = "Partial design";
                    break;
                case ContextMenuButtons.PageDesign:
                    text = "Page design";
                    break;
                case ContextMenuButtons.Edit:
                    text = "Edit";
                    break;
            }

            return _contextMenu.FindElements("ng-spd-list button").First(element => element.Text == text);
        }

        private CreateFolderSlidingPanel GetCreateFolderSlidingPanel()
        {
            _contextMenu.Driver.FindElement(Constants.createFolderPanelSelector).WaitForCSSAnimation();
            var slidingPanel = new CreateFolderSlidingPanel(_contextMenu.Driver.FindElement(Constants.createFolderPanelSelector));
            return slidingPanel;
        }


        private SelectTemplateDialog GetSelectTemplateDialog()
        {
            _contextMenu.Driver.WaitForHorizonIsStable();
            SelectTemplateDialog selectTemplateDialog = new(_contextMenu.Driver.FindElement("ng-spd-dialog-panel"));
            return selectTemplateDialog;
        }

        public void InvokeCreatePartialDesignFolder()
        {
            ClickOnContextMenuOption(ContextMenuButtons.Folder);
        }

        public CreateDialog InvokeCreatePartialDesign()
        {
            ClickOnContextMenuOptionWithoutWaitingForHorizonIsStable(ContextMenuButtons.PartialDesign);
            _contextMenu.Driver.WaitForDialog();
            return new CreateDialog(_contextMenu.Driver.FindElement("ng-spd-dialog-panel"));
        }

        public CreateDialog InvokeCreatePageDesign()
        {
            ClickOnContextMenuOptionWithoutWaitingForHorizonIsStable(ContextMenuButtons.PageDesign);
            _contextMenu.Driver.WaitForDialog();
            return new CreateDialog(_contextMenu.Driver.FindElement("ng-spd-dialog-panel"));
        }
    }

    public enum ContextMenuButtons
    {
        Delete,
        CreatePage,
        CreateFolder,
        CreateNew,
        Rename,
        RenameItem,
        SetPublishingDates,
        Duplicate,
        RenamePageVariant,
        EditAudience,
        Folder,
        PartialDesign,
        PageDesign,
        Edit
    }
}
