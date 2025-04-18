// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items
{
    public class TreeItem : BaseControl
    {
        private Action? _canvasReloadWaitMethod;
        private string nodeTextCssSelector = "span[class*='text']";

        public TreeItem(IWebElement container, Action? canvasReloadWaitMethod) : base(container)
        {
            _canvasReloadWaitMethod = canvasReloadWaitMethod;
        }

        public TreeItem(IWebElement container) : base(container)
        {
        }

        public string Name => Container.FindElement(nodeTextCssSelector).Text;
        public bool IsExpanded => Container.GetAttribute("aria-expanded").Equals("true", StringComparison.OrdinalIgnoreCase);
        public bool IsDisabled => Container.FindElement(".node-content").GetClassList().Contains("node-incompatible");
        public bool IsSelected => _node.GetClassList().Contains("ng-spd-tree-selected");

        public IWebElement CreateLanguageVersionBtn => Container.FindElement("button.add-version");

        private IWebElement AbTestIcon => Container.FindElement("span.abtest-icon");

        public TreeItem? NextSibling
        {
            get
            {
                var nextSibling = Container.GetNextSibling();
                if (nextSibling != null && nextSibling.TagName == Container.TagName)
                {
                    return new TreeItem(nextSibling, _canvasReloadWaitMethod);
                }

                return null;
            }
        }

        public TreeItem? Parent
        {
            get
            {
                var parent = Container.GetParent();
                if (parent.TagName == Container.TagName)
                {
                    return new TreeItem(parent, _canvasReloadWaitMethod);
                }

                return null;
            }
        }

        private IWebElement _node => Container.FindElement("div.node");

        private IWebElement _contentMenuDots => Container.FindElement("button[icon=dots-horizontal]");
        private IWebElement _dsPickerAddButton => Container.FindElement("app-datasource-picker-context-menu button#hrzMenuAddCreateDatasource");
        private IWebElement _dsPickerDuplicateButton => Container.FindElement("app-datasource-picker-context-menu button#hrzMenuDuplicateDatasource");

        private IWebElement ExpandArrow => Container.FindElement("button.ng-spd-tree-toggle");

        public bool ContextMenuDisabled()
        {
            Container.FindElement("button[icon='dots-horizontal']").Click();
            Container.GetDriver().FindElement("ng-spd-popover");
            return Container.GetDriver().FindElements(By.CssSelector("ng-spd-popover ng-spd-list button")).All(b => b.HasAttribute("disabled"));
        }

        public IEnumerable<TreeItem> GetVisibleChildren()
        {
            IEnumerable<IWebElement> elements = Container.GetChildren().Where(c => c.TagName == Container.TagName);
            return elements.Select(element => new TreeItem(element, _canvasReloadWaitMethod));
        }

        public void Expand()
        {
            if (IsExpanded)
            {
                /*Container.WaitForCondition(c =>
                {
                    var temp = Container.CheckElement("ng-spd-loading-indicator");
                    return temp != null;
                }, TimeSpan.FromMilliseconds(2000));*/
                Container.GetDriver().WaitForHorizonIsStable();
            }
            else
            {
                ExpandArrow.Click();
                Container.GetDriver().WaitForHorizonIsStable();
            }
        }

        public void Collapse()
        {
            if (!IsExpanded)
            {
                return;
            }

            ExpandArrow.Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public IEnumerable<TreeItem?> GetChildren()
        {
            if (!IsExpanded)
            {
                Expand();
            }

            IEnumerable<IWebElement> elements = Container.GetChildren().Where(c => c.TagName == Container.TagName);
            return elements.Select(element => new TreeItem(element, _canvasReloadWaitMethod));
        }

        public TreeItem Hover()
        {
            _node.Hover();
            return this;
        }

        public TreeItem Select(bool waitForLoad = true)
        {
            _node.Click();

            if (waitForLoad)
            {
                _canvasReloadWaitMethod?.Invoke();
                Container.GetDriver().WaitForLoaderToDisappear();
            }

            Container.GetDriver().WaitForHorizonIsStable();
            return this;
        }

        public void LooseFocus()
        {
            Container.ClickOutside(x:200);
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public void ScrollToVisible()
        {
            Container.ScrollIntoView();
        }

        public Rectangle GetElementRectangle()
        {
            var size = Container.Size;
            return new Rectangle(Container.Location, Container.Size);
        }

        public ContextMenu InvokeContextMenu()
        {
            _contentMenuDots.Click();
            return Container.GetDriver().GetContextMenuOnButton();
        }

        public PageAbnTestDetailsDialog InvokeAbnTestsList()
        {
            AbTestIcon.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            return new PageAbnTestDetailsDialog(Container.GetDriver().FindElement(Constants.PageAbTestsDetailsDialogLocator));
        }

        public void InvokeSlidingPanel()
        {
            _dsPickerAddButton.Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public void SetDisplayName(string newName)
        {
            var textElement = Container.FindElement(nodeTextCssSelector);
            textElement.SendKeys(newName);
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public IWebElement GetItemWebElement()
        {
            return Container;
        }

        public IWebElement GetTextElement()
        {
            return Container.FindElement(nodeTextCssSelector);
        }

        public void PressKey(string key)
        {
            IWebElement? textElement = Container.FindElement(nodeTextCssSelector);
            switch (key)
            {
                case "Enter":
                    textElement.SendKeys(Keys.Enter);
                    break;
                case "ESC":
                    textElement.GetDriver().PressKeySelenium(Keys.Escape);
                    break;
                case "F2":
                    textElement.SendKeys(Keys.F2);
                    break;
            }

            Container.GetDriver().WaitForHorizonIsStable();
        }

        public bool IsItemVisible()
        {
            Rectangle itemRectangle = Container.GetElementRectangle();
            return itemRectangle.Y >= 70;
        }

        public void DuplicateItem()
        {
            _dsPickerDuplicateButton.Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }
    }
}
