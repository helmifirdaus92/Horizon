// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Templates;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps.Templates
{
    public class PageDesigns : App
    {
        public PageDesigns(BrowserWrapper browser, string clientUrl) : base("templates/pagedesigns", browser, clientUrl)
        {
        }

        public CardContainer CardContainer => new CardContainer(Browser.FindElement(".card-container"));
        public List<ItemCard> Designs => CardContainer.ItemCards;

        public PageDesigns Open(string? site = null)
        {
            base.Open(site: site);
            Browser.WaitForHorizonIsStable();
            Browser.WaitForCondition(b => b.CheckElementExists("app-page-designs"));
            Browser.GetDriver().WaitForNetworkCalls();
            Browser.GetDriver().WaitForDotsLoader();
            return this;
        }

        public ItemCard? PageDesignByName(string name)
        {
            return Designs.Find(c => c.Title == name);
        }

        public void CancelPageDesignCreation(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            CardContainer.InvokeContextMenuOnCreate()
                .InvokeCreatePageDesign()
                .EnterItemName(name)
                .ClickCancelButton();
        }

        public void CreatePageDesign(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            CardContainer.InvokeContextMenuOnCreate()
                .InvokeCreatePageDesign()
                .EnterItemName(name)
                .ClickCreateButton();
        }
    }
}
