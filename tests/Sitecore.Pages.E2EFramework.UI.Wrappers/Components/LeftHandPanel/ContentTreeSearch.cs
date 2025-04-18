// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;

public class ContentTreeSearch : BaseControl
{
    private readonly Action? _canvasReloadWaitMethod;

    public ContentTreeSearch(IWebElement container, Action? canvasReloadWaitMethod) : base(container)
    {
        _canvasReloadWaitMethod = canvasReloadWaitMethod;
    }

    public IWebElement InputBox => Container.FindElement("ng-spd-search-input input");
    public FilterMenu FilterMenu => new FilterMenu(Container.GetDriver().FindElement(".filter-menu"));
    public ItemsTree SearchResultsTree => new(Container.FindElement("ng-spd-tree"), _canvasReloadWaitMethod);

    public List<string> SearchResults => SearchResultsTree.GetAllVisibleItems().Select(item => item.Name).ToList();

    public bool NoResults => _appEmptyState.Displayed;
    private IWebElement FilterButton => Container.FindElement(".filter-btn button");
    private IWebElement _appEmptyState => Container.FindElement("app-empty-state");

    public void WaitForResults()
    {
        Container.GetDriver().WaitForDotsLoader();
        Container.GetDriver().WaitForHorizonIsStable();
    }


    public FilterMenu OpenFilters()
    {
        FilterButton.Click();
        Container.GetDriver().WaitForHorizonIsStable();
        return FilterMenu;
    }
}
