// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls
{
    public class SearchResults : BaseControl
    {
        public SearchResults(IWebElement container) : base(container)
        {
        }

        public string EmptyContainerTitle => EmptyContainer.FindElement(".title").Text;

        public string EmptyContainerDescription => EmptyContainer.FindElement(".description").Text;

        private NamedCollection<Button> Items
        {
            get
            {
                return Container.FindNamedControls<Button>("button");
            }
        }

        private IWebElement EmptyContainer => Container.FindElement(" .empty-container");

        public List<string> ListOfItems()
        {
            return Items.Select(button => button.Name).ToList();
        }

        public void ClickOnResult(string result)
        {
            var item = Items.First(element => element.Name == result);
            item.Click();
            item.Container.GetDriver().WaitForOverlayPanelToDisappear();
        }

        public bool IsSearchResultsDisplayed()
        {
            return Container.Displayed;
        }

        public bool IsEmptyContainerDisplayed()
        {
            try
            {
                return EmptyContainer.Displayed;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
            catch (StaleElementReferenceException)
            {
                return false;
            }
        }
    }
}
