// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Templates
{
    public class CardContainer : BaseControl
    {
        private const string CurrentSiteTab = "Current site";

        private const string SharedSiteTab = "Shared sites";

        private IWebElement? _editableElement;

        public CardContainer(IWebElement container) : base(container)
        {
            Container.GetDriver().WaitForDotsLoader();
        }

        public IWebElement Table => Container.FindElement("ng-spd-table");


        public IWebElement HeaderContainer => Container.FindElement(".header-container");

        public IWebElement Content => Container.FindElement("div[class='content']");

        public IWebElement ItemDetails => Container.FindElement("app-item-details");
        public List<ItemCard> ItemCards => GetItemCards().ConvertAll(new Converter<IWebElement, ItemCard>(WebElementToItemCard));
        public string? ActiveTab => SiteTabs.Find(t => t.GetAttribute("aria-selected").Equals("true"))?.Text.Trim();
        public bool TabsVisible => ActiveTab != null;
        public bool CreateButtonEnabled => CreateButton.IsEnabled;

        private IWebElement SearchBox => Container.FindElement("app-design-search .search input");

        private IWebElement EmptyContainer => Container.FindElement(".left-container .empty");

        private IWebElement LeftContainer => Container.FindElement(".left-container");

        private Button CreateButton => HeaderContainer.FindControl<Button>("button");
        private List<IWebElement> SiteTabs => Container.FindElements("ng-spd-tab-group button").ToList();

        public CardContainer SelectSharedSiteTab()
        {
            SiteTabs.Find(t => t.Text.Trim().Equals(SharedSiteTab))?.Click();
            Container.GetDriver().WaitForDotsLoader();
            return this;
        }

        public CardContainer SelectCurrentSiteTab()
        {
            SiteTabs.Find(t => t.Text.Trim().Equals(CurrentSiteTab))?.Click();
            Container.GetDriver().WaitForDotsLoader();
            return this;
        }

        public void InvokeEditModeForItemCard(string name)
        {
            SelectItemCard(name).FindElement("button[icon=pencil-outline]").Click();
            Container.GetDriver().WaitForDotsLoader();
        }

        public IWebElement? SelectItemCard(string name)
        {
            var itemCard = GetItemCards().FirstOrDefault(element => element.Text == name);
            itemCard?.Hover();
            itemCard?.Click();
            return itemCard;
        }

        public List<string> GetItemCardNames()
        {
            Container.GetDriver().WaitForCondition(c => GetItemCards().Count > 0, TimeSpan.FromMilliseconds(1000));
            return GetItemCards()
                .Select(element => element.FindElement("span.title.ng-star-inserted").Text).ToList();
        }

        public string GetHeaderName()
        {
            return HeaderContainer.FindElement("span").Text;
        }

        public string GetHeaderDescription()
        {
            return HeaderContainer.FindElement(".description").Text;
        }

        public void Search(string value)
        {
            Container.GetDriver().WaitForNetworkCalls();
            Container.GetDriver().WaitForHorizonIsStable();
            SearchBox.Clear();
            SearchBox.SendKeys(value);
            Container.GetDriver().WaitForDotsLoader();
        }

        public void ClearResultsAndCloseOverlay()
        {
            SearchBox.Clear();
            SearchBox.ClickOutside();
        }

        public SearchResults GetSearchResults()
        {
            var searchResults = new SearchResults(Container.GetDriver().FindElement(Constants.CdkOverlayContainerCdkOverlayPane));
            Container.GetDriver().WaitForCondition(m => searchResults.IsSearchResultsDisplayed());

            return searchResults;
        }

        public string GetEmptyViewText()
        {
            return EmptyContainer.FindElement("p").Text;
        }

        public Dictionary<string, string> GetDetailsInfo()
        {
            Container.GetDriver().WaitForDotsLoader();

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

        public RenameDialog? InvokeRenameDesignDialog(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            Container.GetDriver().WaitForCondition(c => GetItemCards().Count > 0, TimeSpan.FromMilliseconds(1000));
            IWebElement? itemCard = GetItemCards().FirstOrDefault(element => element.Text == name);

            if (itemCard == null)
            {
                return null;
            }

            ItemCard design = new(itemCard);

            return design.InvokeRenameDialog();
        }

        public DeleteDialog? InvokeDeleteDesignDialog(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            Container.GetDriver().WaitForCondition(c => GetItemCards().Count > 0, TimeSpan.FromMilliseconds(1000));
            IWebElement? itemCard = GetItemCards().FirstOrDefault(element => element.Text == name);

            if (itemCard == null)
            {
                return null;
            }

            ItemCard design = new(itemCard);

            return design.InvokeDeleteDialog();
        }

        public string GetEmptyDetailsText()
        {
            return ItemDetails.FindElement(".text").Text;
        }

        public List<IWebElement> GetFolderTitleElements()
        {
            List<IWebElement> folders = GetFolders();
            List<IWebElement> folderTitles = folders.Select(folder => folder.FindElement((".title"))).ToList();
            return folderTitles.ToList();
        }

        public List<string> GetFolderTitles()
        {
            return GetFolderTitleElements().Select(t => t.Text).ToList();
        }

        public List<IWebElement> GetFolders()
        {
            bool elementExists = Container.GetDriver().CheckElementExists("app-empty-state");
            if (elementExists)
            {
                Container.GetDriver().WaitForCondition(b => !b.CheckElementExists("app-empty-state"));
            }

            Container.GetDriver().WaitForDotsLoader();
            IReadOnlyCollection<IWebElement> folders = Container.FindElements("ng-spd-item-card[icon=folder-outline]");
            return folders.ToList();
        }

        public void SelectFolder(string folderName)
        {
            GetFolderByTitle(folderName).Click();
        }

        public IWebElement GetFolderByTitle(string title)
        {
            List<IWebElement> folders = GetFolders();
            return folders.First(folder => folder.FindElement(".title").Text == title);
        }

        public MoveItemDialog InvokeMoveDialogOnFolder(string folderName)
        {
            var folder = GetFolderByTitle(folderName);
            ItemCard itemcard = new(folder);
            return itemcard.InvokeMoveItemDialog();
        }

        public void CancelDeleteFolder(string folderName)
        {
            PerformDeleteDialogAction(folderName, dialog => dialog.ClickCancelButton());
        }

        public void DeleteFolder(string folderName)
        {
            PerformDeleteDialogAction(folderName, dialog => dialog.ClickDeleteButton());
        }

        public void RenameFolder(string folderName, string newName)
        {
            IWebElement? folder = GetFolderByTitle(folderName);
            if (folder == null)
            {
                Logger.Write($"=========> folder element is null");
                this.WaitForCondition(f =>
                {
                    folder = GetFolderByTitle(folderName);
                    return f != null;
                });
            }

            if (folder != null)
            {
                ItemCard folderItem = new(folder);

                var menu = folderItem.InvokeContextMenu();
                Container.GetDriver().WaitForCondition(m => menu.IsContextMenuDisplayed());
                menu.InvokeRename();
            }

            _editableElement = FindEditableElement();
            TextBox text = new TextBox(_editableElement);
            text.Clear();
            text.Text = newName;

            _editableElement?.SendKeys(Keys.Enter);
        }

        public List<string> GetBreadCrumbs()
        {
            return BreadCrumbs().Select(e => e.Text).ToList();
        }

        public List<IWebElement> BreadCrumbs()
        {
            IReadOnlyCollection<IWebElement> breadCrumbs = Container.FindElements(".breadcrumb-link,  .breadcrumb-not-clickable");
            return breadCrumbs.ToList();
        }

        public void ClickCreateButton()
        {
            Container.WaitForCondition(d =>
            {
                bool elementExists = Container.CheckElementExists(".header-container button");
                return elementExists;
            });

            CreateButton.Click();
        }

        public bool IsItemCardPresent()
        {
            return ItemCards.Count > 0;
        }

        public void NavigateToLinkInBreadcrumbs(string breadcrumbName)
        {
            var neededBreadcrumb = BreadCrumbs().FirstOrDefault(element => element.Text == breadcrumbName);
            neededBreadcrumb?.Click();
            Container.GetDriver().WaitForDotsLoader();
        }

        public int GetNumberOfBreadcrumbs()
        {
            return GetBreadCrumbs().Count;
        }

        public void CreateFolder(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            CreateFolderWithoutConfirmation(name);
            _editableElement?.SendKeys(Keys.Enter);
        }

        public void CreateFolderButCancel(string name)
        {
            CreateFolderWithoutConfirmation(name);
            Container.GetDriver().PressKeySelenium(Keys.Escape);
        }

        public ContextMenu InvokeContextMenuOnCreate()
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            ClickCreateButton();
            return Container.GetDriver().GetContextMenuOnButton();
        }

        public ItemCard? GetItemCardByName(string name)
        {
            return ItemCards.FirstOrDefault(element => element.Title == name);
        }
        
        private static ItemCard WebElementToItemCard(IWebElement element)
        {
            return new ItemCard(element);
        }

        private List<IWebElement> GetItemCards()
        {
            IReadOnlyCollection<IWebElement> elements = Container.FindElements("ng-spd-item-card:not([icon=folder-outline]");
            return elements.ToList();
        }

        private void CreateFolderWithoutConfirmation(string newName)
        {
            ClickCreateButton();
            Container.GetDriver().GetContextMenuOnButton().InvokeCreateFolder();

            _editableElement = FindEditableElement();
            TextBox text = new TextBox(_editableElement);
            text.Clear();
            text.Text = newName;
        }

        private IWebElement? FindEditableElement()
        {
            return GetFolderTitleElements().FirstOrDefault(el => el.GetAttribute("contenteditable") == "true");
        }

        private void PerformDeleteDialogAction(string folderName, Action<DeleteDialog> dialogAction)
        {
            IWebElement? folder = GetFolderByTitle(folderName);

            if (folder == null)
            {
                Logger.Write($"=========> folder element is null");
                this.WaitForCondition(f =>
                {
                    folder = GetFolderByTitle(folderName);
                    return f != null;
                }, "Waiting for folder to be initialized ...");
            }

            if (folder != null)
            {
                ItemCard folderItem = new(folder);
                var menu = folderItem.InvokeContextMenu();
                Container.GetDriver().WaitForCondition(m => menu.IsContextMenuDisplayed());
                menu.InvokeDelete();
            }

            Container.GetDriver().WaitForDialog();
            var dialog = new DeleteDialog(Container.GetDriver().FindElement(Constants.DialogPanelLocator));
            dialogAction(dialog);
        }
    }
}
