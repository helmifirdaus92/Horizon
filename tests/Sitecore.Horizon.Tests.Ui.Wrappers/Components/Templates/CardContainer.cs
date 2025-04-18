// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;
using Keys = OpenQA.Selenium.Keys;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates
{
    public class CardContainer
    {
        //.card-container
        private readonly WebElement _cardContainer;
        private readonly string _cdkOverlayContainerCdkOverlayPane = ".cdk-overlay-container .cdk-overlay-pane";
        private WebElement _editableElement;

        public CardContainer(WebElement cardContainer)
        {
            _cardContainer = cardContainer;
        }

        public WebElement HeaderContainer => _cardContainer.FindElement(".header-container");

        public WebElement Content => _cardContainer.FindElement("div[class='content']");

        public WebElement ItemDetails => _cardContainer.FindElement("app-item-details");

        private WebElement EmptyContainer => _cardContainer.FindElement(".left-container .empty");

        private WebElement LeftContainer => _cardContainer.FindElement(".left-container");

        private WebElement CreateButton => _cardContainer.FindElement(".header-container button");


        public string GetHeaderName()
        {
            return HeaderContainer.Exists ? HeaderContainer.FindElement("span").Text : string.Empty;
        }

        public string GetEmptyViewText()
        {
            return EmptyContainer.Exists ? EmptyContainer.FindElement("p").Text : string.Empty;
        }

        public Dictionary<string, string> GetDetailsInfo()
        {
            _cardContainer.Driver.WaitForDotsLoader();

            var keyValuePairs = new Dictionary<string, string>();

            var spansWithValue = ItemDetails.FindElements("span.details-heading + span");
            var names = ItemDetails.FindElements("span.details-heading");

            int spanIndex = 0;

            while (spanIndex < spansWithValue.Count)
            {
                var key = names[spanIndex].Text;
                var value = spansWithValue[spanIndex].Text;
                keyValuePairs.Add(key, value);
                spanIndex++;
            }

            return keyValuePairs;
        }

        public string GetEmptyDetailsText()
        {
            return ItemDetails.Exists ? ItemDetails.FindElement(".text").Text : string.Empty;
        }

        public List<WebElement> GetFolderTitles()
        {
            List<WebElement> folders = GetFolders();
            List<WebElement> folderTitles = folders.Select(folder => folder.FindElement((".title"))).ToList();
            return folderTitles.ToList();
        }

        public List<WebElement> GetFolders()
        {
            bool elementExists = _cardContainer.Driver.CheckElementExists("app-empty-state");
            if (elementExists)
            {
                _cardContainer.WaitForCondition(b => !b.CheckElementExists("app-empty-state"));
            }

            _cardContainer.Driver.WaitForDotsLoader();
            IReadOnlyCollection<WebElement> folders = _cardContainer.FindElements("ng-spd-item-card[icon=folder-outline]");
            return folders.ToList();
        }

        public WebElement GetFolderByTitle(string title)
        {
            List<WebElement> folders = GetFolders();
            return folders.FirstOrDefault(folder => folder != null && folder.FindElement(".title").Text == title);
        }

        public List<WebElement> GetItemCards()
        {
            IReadOnlyCollection<WebElement> elements = _cardContainer.FindElements("ng-spd-item-card:not([icon=folder-outline]");
            return elements.ToList();
        }

        public List<WebElement> GetBreadCrumbs()
        {
            IReadOnlyCollection<WebElement> breadCrumbs = _cardContainer.FindElements(".breadcrumb-link");
            return breadCrumbs.ToList();
        }

        public void ClickCreateButton()
        {
            _cardContainer.WaitForCondition(d =>
            {
                bool elementExists = _cardContainer.CheckElementExists(".header-container button");
                return elementExists;
            });

            CreateButton.Click();
        }

        public void OpenFolder(string folderName)
        {
            _cardContainer.Driver.WaitForDotsLoader();
            _cardContainer.Driver.WaitForCondition(c => GetFolderTitles().Count > 0, 1000);


            WebElement neededFolder = GetFolderTitles().FirstOrDefault(element => element.Text == folderName);
            neededFolder?.Click();
            _cardContainer.Driver.WaitForDotsLoader();
        }

        public List<string> GetItemCardNames()
        {
            _cardContainer.Driver.WaitForCondition(c => GetItemCards().Count > 0, 1000);
            return GetItemCards()
                .Select(element => element.FindElement("span.title.ng-star-inserted").Text).ToList();
        }

        public bool IsItemCardPresent()
        {
            return GetItemCards().Count > 0;
        }

        public List<string> GetFolderNames()
        {
            return GetFolderTitles().Select(element => element.Text).ToList();
        }

        public void NavigateToLinkInBreadcrumbs(string breadcrumbName)
        {
            var neededBreadcrumb = GetBreadCrumbs().FirstOrDefault(element => element.Text == breadcrumbName);
            neededBreadcrumb?.Click();
            _cardContainer.Driver.WaitForDotsLoader();
        }

        public int GetNumberOfBreadcrumbs()
        {
            return GetBreadCrumbs().Count;
        }

        public WebElement SelectItemCard(string name)
        {
            _cardContainer.Driver.WaitForCondition(c => GetItemCards().Count > 0, 1000);
            var itemCard = GetItemCards().FirstOrDefault(element => element.Text == name);
            itemCard?.Click();
            _cardContainer.Driver.WaitForDotsLoader();
            return itemCard;
        }

        public void InvokeEditModeForItemCard(string name)
        {
            SelectItemCard(name).FindElement("button[icon=pencil-outline]").Click();
            _cardContainer.Driver.WaitForDotsLoader();
        }

        public void CreateFolder(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            CreateFolderWithoutConfirmation(name);
            _editableElement.Driver.PressKeySelenium(Keys.Enter);
        }

        public void CreatePartialDesign(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            var dialog = InvokeCreatePartialDesignDialog();
            dialog.EnterItemName(name);
            dialog.ClickCreateButton();
        }

        public void CreatePageDesign(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            var dialog = InvokeCreatePageDesignDialog();
            dialog.EnterItemName(name);
            dialog.ClickCreateButton();
        }

        public void CancelPartialDesignCreation(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            var dialog = InvokeCreatePartialDesignDialog();
            dialog.EnterItemName(name);
            dialog.ClickCancelButton();
        }

        public void CancelPageDesignCreation(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            var dialog = InvokeCreatePageDesignDialog();
            dialog.EnterItemName(name);
            dialog.ClickCancelButton();
        }

        public CreateDialog InvokeCreatePartialDesignDialog()
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            ClickCreateButton();
            var menu = GetContextMenuOnCreateButton();
            _cardContainer.Driver.WaitForCondition(m => menu.IsContextMenuDisplayed());
            var dialog = menu.InvokeCreatePartialDesign();
            return dialog;
        }

        public CreateDialog InvokeCreatePageDesignDialog()
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            ClickCreateButton();
            var menu = GetContextMenuOnCreateButton();
            _cardContainer.Driver.WaitForCondition(m => menu.IsContextMenuDisplayed());
            var dialog = menu.InvokeCreatePageDesign();
            return dialog;
        }

        public RenameDialog InvokeRenameDesignDialog(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            _cardContainer.Driver.WaitForCondition(c => GetItemCards().Count > 0, 1000);
            var itemCard = GetItemCards().FirstOrDefault(element => element.Text == name);

            ItemCard design = new(itemCard);

            var menu = design.OpenContextMenu();
            _cardContainer.Driver.WaitForCondition(m => menu.IsContextMenuDisplayed());
            menu.InvokeRename();

            return new RenameDialog(_cardContainer.Driver.FindElement("ng-spd-dialog-panel"));
        }
        public DeleteDialog InvokeDeleteDialog(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            _cardContainer.Driver.WaitForCondition(c => GetItemCards().Count > 0, 1000);
            var itemCard = GetItemCards().FirstOrDefault(element => element.Text == name);

            ItemCard design = new(itemCard);

            var menu = design.OpenContextMenu();
            _cardContainer.Driver.WaitForCondition(m => menu.IsContextMenuDisplayed());
            menu.InvokeDelete();

            return new DeleteDialog(_cardContainer.Driver.FindElement("ng-spd-dialog-panel"));
        }

        public void CancelFolderCreation(string name)
        {

            CreateFolderWithoutConfirmation(name);
            _editableElement.Driver.PressKeySelenium(Keys.Escape);
        }

        public void RenameFolder(string folderName, string newName)
        {
            var folder = GetFolderByTitle(folderName);
            if (folder == null)
            {
                Logger.WriteLine($"=========> folder element is null");
                this.WaitForCondition(f =>
                {
                    folder = GetFolderByTitle(folderName);
                    return f != null;
                });
            }

            ItemCard folderItem = new(folder);

            var menu = folderItem.OpenContextMenu();
            _cardContainer.Driver.WaitForCondition(m => menu.IsContextMenuDisplayed());
            menu.InvokeRename();

            _editableElement = FindEditableElement();
            _editableElement.Clear();
            _editableElement.TypeKeys(newName);

            _editableElement.Driver.PressKeySelenium(Keys.Enter);
        }

        public void DeleteFolder(string folderName)
        {
            PerformDeleteDialogAction(folderName, dialog => dialog.ClickDeleteButton());
        }

        public void CancelDeleteFolder(string folderName)
        {
            PerformDeleteDialogAction(folderName, dialog => dialog.ClickCancelButton());
        }

        private void CreateFolderWithoutConfirmation(string name)
        {
            Thread.Sleep(2000);
            ClickCreateButton();
            var menu = GetContextMenuOnCreateButton();
            _cardContainer.Driver.WaitForCondition(m => menu.IsContextMenuDisplayed());
            menu.InvokeCreatePartialDesignFolder();

            _editableElement = FindEditableElement();

            _editableElement.Clear();

            _editableElement.TypeKeys(name);
        }

        private ContextMenu GetContextMenuOnCreateButton()
        {
            _cardContainer.Driver.WaitForContextMenu();
            return new ContextMenu(_cardContainer.Driver.FindElement(_cdkOverlayContainerCdkOverlayPane));
        }

        private void PerformDeleteDialogAction(string folderName, Action<DeleteDialog> dialogAction)
        {
            var folder = GetFolderByTitle(folderName);

            if (folder == null)
            {
                Logger.WriteLine($"=========> folder element is null");
                this.WaitForCondition(f =>
                {
                    folder = GetFolderByTitle(folderName);
                    return f != null;
                }, "Waiting for folder to be initialized ...");
            }

            ItemCard folderItem = new(folder);
            var menu = folderItem.OpenContextMenu();
            _cardContainer.Driver.WaitForCondition(m => menu.IsContextMenuDisplayed());
            menu.InvokeDelete();

            _cardContainer.Driver.WaitForDialog();
            var dialog = new DeleteDialog(_cardContainer.Driver.FindElement("ng-spd-dialog-panel"));
            dialogAction(dialog);
        }

        private WebElement FindEditableElement()
        {
            return GetFolderTitles().FirstOrDefault(el => el.GetAttribute("contenteditable") == "true");
        }

    }
}
