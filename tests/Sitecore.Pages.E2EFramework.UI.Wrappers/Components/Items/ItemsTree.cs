// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Action = System.Action;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items
{
    public class ItemsTree : BaseControl
    {
        private readonly string _nodeCss = "ng-spd-nested-tree-node";
        private readonly string _nodeContentCss = ".node";
        private readonly string _createPageButtonSelector = "app-content-tree-area button";
        private readonly IWebElement _listControl;
        private Action? _canvasReloadWaitMethod;

        public ItemsTree(IWebElement container, Action? canvasReloadWaitMethod) : base(container)
        {
            _canvasReloadWaitMethod = canvasReloadWaitMethod;
            _listControl = container;
        }

        public ItemsTree(IWebElement container) : base(container)
        {
            _listControl = container;
        }

        public TreeItem RootItem => new(Container.FindElement(_nodeCss), _canvasReloadWaitMethod);
        public bool IsLoaded => Container.CheckElement(_nodeCss) != null;
        public bool IsExpanded => _toggleButton.IsExpanded;

        public TreeItem? SelectedItem
        {
            get
            {
                TreeItem? listItem = null;
                this.WaitForCondition(c =>
                {
                    listItem = new TreeItem(Container.FindElement("div[class*='selected']").GetParent(), _canvasReloadWaitMethod);
                    return !string.IsNullOrEmpty(listItem.Name);
                });
                return listItem;
            }
        }

        private ToggleButton _toggleButton
        {
            get
            {
                IWebElement toggleElement = _listControl.GetDriver().FindElement("button.toggle-lhs-hide");

                return new ToggleButton(toggleElement);
            }
        }

        public void RefreshTreeAtRootItem()
        {
            if (RootItem.IsExpanded)
            {
                RootItem.Collapse();
                RootItem.Expand();
            }
            else
            {
                RootItem.Expand();
            }
        }

        public void Collapse()
        {
            _listControl.Hover();
            _toggleButton.WaitForCondition(t => t.Displayed, TimeSpan.FromSeconds(2));
            _toggleButton.Collapse();
        }
        
        public void Expand()
        {
            _toggleButton.Expand();
            WaitForLoading();
        }
        
        public void ScrollToLastElement()
        {
            var nodes = GetAllVisibleItems();
            nodes.Last().ScrollToVisible();
        }
        public List<TreeItem> GetAllVisibleItems()
        {
            Container.GetDriver().WaitForHorizonIsStable();
            var allNodes = new List<TreeItem>();

            TreeItem? nextNode = RootItem;
            bool nodIsAlreadyTraversed = false;
            do
            {
                if (!nodIsAlreadyTraversed)
                {
                    allNodes.Add(nextNode);
                }

                nextNode = GetNextNode(nextNode, ref nodIsAlreadyTraversed);
            } while (nextNode != null);

            return allNodes;
        }

        public TreeItem? GetItemByPath(string path)
        {
            WaitForLoading();
            string[] items = path.Split(new[]
            {
                "/"
            }, StringSplitOptions.None);

            return GoToItemRecursively(items);
        }

        public bool WaitForLoading()
        {
            Container.GetDriver().WaitForHorizonIsStable();
            return IsLoaded;
        }

        public SelectTemplateDialog InvokeCreatePage()
        {
            IWebElement createPageButton = Container.GetDriver().FindElement(_createPageButtonSelector);
            createPageButton.Click();

            SelectTemplateDialog selectTemplateDialog = new(Container.GetDriver().FindElement("ng-spd-dialog-panel"));
            Container.GetDriver().WaitForHorizonIsStable();
            return selectTemplateDialog;
        }

        public bool IsCreatePageButtonEnabled()
        {
            return Container.GetDriver().FindElement(_createPageButtonSelector).Enabled;
        }

        public void DragAndDropItem(TreeItem sourceTreeItem, TreeItem targetTreeItem, ItemMovePosition movePosition)
        {
            var sourceWebElement = sourceTreeItem.GetItemWebElement().FindElement(_nodeContentCss);
            var targetWebElement = targetTreeItem.GetItemWebElement().FindElement(_nodeContentCss);
            var offset = GetDropPointOffset(movePosition, targetWebElement);

            Container.GetDriver().DragAndDropElement(sourceWebElement, offset.xOffset, offset.yOffset);
            Container.GetDriver().WaitForHorizonIsStable();
        }

        private static (int xOffset, int yOffset) GetDropPointOffset(ItemMovePosition position, IWebElement dropItem)
        {
            var itemRectangle = new Rectangle(dropItem.Location, dropItem.Size);
            return GetDropPointOffsetFromRect(position, itemRectangle);
        }

        private static (int xOffset, int yOffset) GetDropPointOffsetFromRect(ItemMovePosition position, Rectangle rectangle)
        {
            int xOffset, yOffset = 0;
            switch (position)
            {
                case ItemMovePosition.Before:
                    xOffset = rectangle.Width / 2;
                    yOffset = 10;
                    break;
                case ItemMovePosition.After:
                    xOffset = rectangle.Width / 2;
                    yOffset = rectangle.Height - 10;
                    break;
                default:
                    xOffset = rectangle.Width / 2;
                    yOffset = rectangle.Height / 2;

                    break;
            }

            return (rectangle.X + xOffset, rectangle.Y + yOffset);
        }

        private TreeItem? GetNextNode(TreeItem currentNode, ref bool nodIsAlreadyTraversed)
        {
            if (!nodIsAlreadyTraversed)
            {
                if (currentNode.GetVisibleChildren().Any())
                {
                    return currentNode.GetVisibleChildren().First();
                }
            }

            nodIsAlreadyTraversed = false;
            var nextSibling = currentNode.NextSibling;
            if (nextSibling != null)
            {
                return nextSibling;
            }

            var parent = currentNode.Parent;
            if (parent != null)
            {
                nodIsAlreadyTraversed = true;
                return parent;
            }

            return null;
        }

        private TreeItem? GoToItemRecursively(string[] items)
        {
            TreeItem? item = GetAllVisibleItems().First(e => e.Name == items[0]);
            for (var i = 1; i < items.Length; i++)
            {
                Logger.Write($"ItemsTree|GoToItemRecursively. Current item: {item.Name}, nextItem: {items[i]}");
                item.Expand();
                var childrenItems = item.GetChildren();
                Logger.Write("ItemsTree|GoToItemRecursively. Number of children: " + childrenItems.Count());
                item = childrenItems.FirstOrDefault(el => el != null && el.Name == items[i]);
                if (item == null)
                {
                    return null;
                }
            }

            return item;
        }
    }

    public enum ItemMovePosition
    {
        Into,
        Before,
        After
    }
}
