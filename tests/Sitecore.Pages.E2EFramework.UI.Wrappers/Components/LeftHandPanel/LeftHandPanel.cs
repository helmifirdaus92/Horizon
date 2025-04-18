// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel
{
    public class LeftHandPanel : BaseControl
    {
        private readonly Action? _canvasReloadWaitMethod;

        public LeftHandPanel(IWebElement container, Action canvasReloadWaitMethod) : base(container)
        {
            _canvasReloadWaitMethod = canvasReloadWaitMethod;
        }

        public LeftHandPanel(IWebElement container) : base(container)
        {
        }

        public Button CreateNewPageButton => Container.FindControl<Button>("app-content-tree-area  ng-spd-header-with-button button");
        public bool CreateNewPageButtonEnabled => CreateNewPageButton.IsEnabled;
        public ItemsTree SiteContentTree => new(Container.FindElement("ng-spd-tree"), _canvasReloadWaitMethod);
        public ContentTreeSearch SearchResultsPanel => new(Container.FindElement("app-content-tree-search"), _canvasReloadWaitMethod);

        public NamedCollection<Button> EditorLHSContent =>
            Container.FindNamedControls<Button>(".editor-lhs-nav button");

        public PersonalizationPanel PersonalizationPanel => new(Container.FindElement("app-personalization"));

        public PageDesignsEditorPanel PageDesignsEditorPanel => new(Container.FindElement("app-page-designs-lhs-panel"));
        public TemplatesPanel TemplatesPanel => new(Container.FindElement("app-templates-lhs-panel"));

        public ComponentGallery ComponentGallery => new(Container.FindElement(Constants.ComponentsGallerySelector));
        private Button _searchPage => Container.FindControl<Button>("app-content-tree-area button.header-search");
        public void ClickOnSearch() => _searchPage.Click();

        public ComponentGallery OpenComponentsTab()
        {
            Container.GetDriver().FindElement(By.CssSelector("[title='Components']")).Click();
            Container.GetDriver().WaitForHorizonIsStable();
            return ComponentGallery;
        }

        public ItemsTree OpenSiteTree()
        {
            Container.GetDriver().FindElement(By.CssSelector("[title='Pages']")).Click();
            Container.GetDriver().WaitForHorizonIsStable();
            return SiteContentTree;
        }

        public TreeItem? SelectPage(string itemName)
        {
            return SiteContentTree.GetItemByPath(itemName)?.Select();
        }

        public CreateFolderSlidingPanel? GetCreateFolderPanelIfExists()
        {
            bool isCreateFolderPanelOpened = Container.GetDriver().CheckElementExists(Constants.CreateFolderPanelSelector);
            return isCreateFolderPanelOpened ? new CreateFolderSlidingPanel(Container.GetDriver().FindElement(Constants.CreateFolderPanelSelector)) : null;
        }
    }
}
