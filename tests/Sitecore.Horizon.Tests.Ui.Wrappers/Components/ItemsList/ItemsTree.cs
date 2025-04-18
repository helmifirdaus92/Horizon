// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Controls;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList
{
    public enum ItemMovePosition
    {
        Into,
        Before,
        After
    }

    public class ItemsTree
    {
        private readonly string _nodeCss = "ng-spd-nested-tree-node";
        private readonly string _nodeContentCss = ".node";
        private readonly WebElement _listControl;
        private readonly string _createPageButtonSelector = "app-content-tree-area button";
        private Action _canvasReloadWaitMethod;

        public ItemsTree(WebElement treeElement, Action canvasReloadWaitMethod)
        {
            _listControl = treeElement;
            _canvasReloadWaitMethod = canvasReloadWaitMethod;
        }

        public TreeItem RootItem => new TreeItem(_listControl.FindElement(_nodeCss), _canvasReloadWaitMethod);

        public TreeItem SelectedItem
        {
            get
            {
                TreeItem listItem = null;
                this.WaitForCondition(c =>
                {
                    listItem = new TreeItem(_listControl.FindElement("div[class*='selected']").GetParent(), _canvasReloadWaitMethod);
                    return !string.IsNullOrEmpty(listItem.Name);
                }, 5000);
                return listItem;
            }
        }

        public bool IsRootItemExist => _listControl.CheckElementExists(_nodeCss);
        public bool IsLoaded => _listControl.CheckElementExists(_nodeCss);

        public bool IsExpanded => _toggleButton.IsExpanded;

        private ToggleButton _toggleButton
        {
            get
            {
                WebElement toggleElement = _listControl.Driver.FindElement("button.toggle-lhs-hide");

                return new ToggleButton(toggleElement);
            }
        }

        public TreeItem GetItem(IGenericItem item, string language = "en")
        {
            WaitForLoading();
            var items = new List<string>();
            do
            {
                var displayName = item.GetDisplayName(language);
                var name = string.IsNullOrEmpty(displayName) ? item.Name : displayName;
                items.Add(name);
                item = item.GetParentItem();
            } while (item.Name != "");

            items.Reverse();
            var itemsInTree = items.Skip(items.IndexOf(RootItem.Name)).ToList();

            if (itemsInTree.Count == 0)
            {
                return null;
            }

            try
            {
                return GoToItemRecursively(itemsInTree.ToArray());
            }
            catch (Exception e)
            {
                Logger.WriteLineWithTimestamp($"ItemsTree|GetItem() - Exception thrown: {e}");
                Logger.WriteLineWithTimestamp("ItemsTree|GetItem() - Trying one more time after exception");
                return GoToItemRecursively(itemsInTree.ToArray());
            }
        }

        public TreeItem GetItemByPath(string path)
        {
            WaitForLoading();
            string t = path.Replace("/sitecore/content/", "");
            string[] items = t.Split(new[]
            {
                "/"
            }, StringSplitOptions.None);

            return GoToItemRecursively(items);
        }

        public void Expand()
        {
            _toggleButton.Expand();
            WaitForLoading();
        }

        public void Collapse()
        {
            _listControl.Hover();
            _toggleButton.WaitForCondition(t => t.Displayed, 2000);
            _toggleButton.Collapse();
        }

        public List<TreeItem> GetAllVisibleItems()
        {
            _listControl.Driver.WaitForHorizonIsStable();
            var allNodes = new List<TreeItem>();

            TreeItem nextNode = RootItem;
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

        public void ScrollToLastElement()
        {
            var nodes = GetAllVisibleItems();
            nodes.Last().ScrollToVisible();
        }

        public void Refresh()
        {
            if (RootItem.HasChildren)
            {
                RootItem.Collapse();
                RootItem.Expand();
            }
        }

        public SelectTemplateDialog InvokeCreatePage()
        {
            WebElement createPageButton = _listControl.Driver.FindElement(_createPageButtonSelector);
            createPageButton.Click();

            SelectTemplateDialog selectTemplateDialog = new(_listControl.Driver.FindElement("ng-spd-dialog-panel"));
            _listControl.Driver.WaitForHorizonIsStable();
            return selectTemplateDialog;
        }

        public bool IsCreatePageButtonEnabled()
        {
            return _listControl.Driver.FindElement(_createPageButtonSelector).Enabled;
        }

        public bool WaitForLoading()
        {
            _listControl.Driver.WaitForHorizonIsStable();
            return IsLoaded;
        }

        public void DragAndDropItem(IGenericItem sourceItem, IGenericItem targetItem, ItemMovePosition movePosition)
        {
            var sourceWebElement = GetItemNode(sourceItem);
            var targetWebElement = GetItemNode(targetItem);
            var offset = GetDropPointOffset(movePosition, targetWebElement);
            sourceWebElement.DragAndDrop(targetWebElement, offset.xOffset, offset.yOffset);
            _listControl.Driver.WaitForHorizonIsStable();
        }

        public void DragAndDropItem(TreeItem sourceTreeItem, TreeItem targetTreeItem, ItemMovePosition movePosition)
        {
            var sourceWebElement = sourceTreeItem.GetItemWebElement().FindElement(_nodeContentCss);
            var targetWebElement = targetTreeItem.GetItemWebElement().FindElement(_nodeContentCss);
            var offset = GetDropPointOffset(movePosition, targetWebElement);
            sourceWebElement.DragAndDrop(targetWebElement, offset.xOffset, offset.yOffset);
            _listControl.Driver.WaitForHorizonIsStable();
        }

        public void DragAndMoveItem(IGenericItem sourceItem, IGenericItem targetItem, ItemMovePosition movePosition)
        {
            _listControl.Driver.WaitForHorizonIsStable();
            var sourceWebElement = GetItemNode(sourceItem);
            var targetWebElement = GetItemNode(targetItem);
            var offset = GetDropPointOffset(movePosition, targetWebElement);
            sourceWebElement.DragAndMove(targetWebElement, offset.xOffset, offset.yOffset);
            _listControl.Driver.WaitForHorizonIsStable();
        }

        public void MoveAndDropItem(IGenericItem sourceItem, IGenericItem targetItem, ItemMovePosition movePosition)
        {
            _listControl.Driver.WaitForHorizonIsStable();
            var sourceWebElement = GetItemNode(sourceItem);
            var targetWebElement = GetItemNode(targetItem);
            var offset = GetDropPointOffset(movePosition, targetWebElement);
            sourceWebElement.MoveAndDrop(targetWebElement, offset.xOffset, offset.yOffset);
            _listControl.Driver.WaitForHorizonIsStable();
        }

        public void DragAndMoveOverItem(IGenericItem sourceItem, IGenericItem targetItem, ItemMovePosition movePosition, int hoverTime)
        {
            _listControl.Driver.WaitForHorizonIsStable();
            var sourceWebElement = GetItemNode(sourceItem);
            var targetWebElement = GetItemNode(targetItem);
            var offset = GetDropPointOffset(movePosition, targetWebElement);
            sourceWebElement.DragAndMoveOver(targetWebElement, hoverTime);
            _listControl.Driver.WaitForHorizonIsStable();
        }

        private TreeItem GoToItemRecursively(string[] items)
        {
            TreeItem item = GetAllVisibleItems().First(e => e.Name == items[0]);
            for (var i = 1; i < items.Length; i++)
            {
                Logger.WriteLineWithTimestamp($"ItemsTree|GoToItemRecursively. Current item: {item.Name}, nextItem: {items[i]}");
                item.Expand();
                var childrenItems = item.GetChildren();
                Logger.WriteLineWithTimestamp("ItemsTree|GoToItemRecursively. Number of children: " + childrenItems.Count());
                item = childrenItems.FirstOrDefault(el => el.Name == items[i]);
                if (item == null)
                {
                    return null;
                }
            }

            return item;
        }

        private TreeItem GetNextNode(TreeItem currentNode, ref bool nodIsAlreadyTraversed)
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

        private WebElement GetItemNode(IGenericItem item)
        {
            return GetItem(item).GetItemWebElement().FindElement(_nodeContentCss);
        }

        private (int xOffset, int yOffset) GetDropPointOffset(ItemMovePosition position, TreeItem dropItem)
        {
            var itemRectangle = dropItem.GetElementRectangle();
            return GetDropPointOffsetFromRect(position, itemRectangle);
        }

        private (int xOffset, int yOffset) GetDropPointOffset(ItemMovePosition position, WebElement dropItem)
        {
            var itemRectangle = dropItem.GetElementRectangle();
            return GetDropPointOffsetFromRect(position, itemRectangle);
        }

        private (int xOffset, int yOffset) GetDropPointOffsetFromRect(ItemMovePosition position, Rectangle rectangle)
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

            return (xOffset, yOffset);
        }
    }
}
