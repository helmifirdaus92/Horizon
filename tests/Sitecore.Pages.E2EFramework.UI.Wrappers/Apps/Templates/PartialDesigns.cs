// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Templates;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps.Templates
{
    public class PartialDesigns : App
    {
        public PartialDesigns(BrowserWrapper browser, string clientUrl) : base("templates/partialdesigns", browser, clientUrl)
        {
        }

        public CardContainer CardContainer => new CardContainer(Browser.FindElement(".card-container"));
        public List<ItemCard> Designs => CardContainer.ItemCards;

        public ItemCard? PartialDesignByName(string name)
        {
            return Designs.Find(c => c.Title == name);
        }

        public PartialDesigns Open(string? site = null)
        {
            base.Open(site: site);
            Browser.WaitForHorizonIsStable();
            Browser.WaitForCondition(b => b.CheckElementExists("app-partial-designs"));
            Browser.GetDriver().WaitForNetworkCalls();
            Browser.GetDriver().WaitForDotsLoader();
            return this;
        }

        public void CreatePartialDesign(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            CardContainer.InvokeContextMenuOnCreate()
                .InvokeCreatePartialDesign()
                .EnterItemName(name)
                .ClickCreateButton();
        }

        public void CancelPartialDesignCreation(string name)
        {
            Thread.Sleep(2000); //need to substitute it with fancy wait
            CardContainer.InvokeContextMenuOnCreate()
                .InvokeCreatePartialDesign()
                .EnterItemName(name)
                .ClickCancelButton();
        }

        public bool IsOpened()
        {
            return Browser.PageUrl.Contains("/templates/partialdesigns?");
        }
    }
}
