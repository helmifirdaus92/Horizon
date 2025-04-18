// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList
{
    public class TreeItem
    {
        private readonly WebElement _node;
        private Action _canvasReloadWaitMethod;
        private JsHelper _domJsObserver;
        private string nodeTextCssSelector = "span[class*='text']";

        public TreeItem(WebElement node, Action canvasReloadWaitMethod)
        {
            _node = node;
            _canvasReloadWaitMethod = canvasReloadWaitMethod;
            _domJsObserver = new JsHelper(_node.Driver);
        }

        public string Name => _node.FindElement(nodeTextCssSelector).Text;

        public bool IsExpanded => _node.GetAttribute("aria-expanded").Equals("true", StringComparison.OrdinalIgnoreCase);

        public bool HasChildren => _node.CheckElementExists("ng-spd-nested-tree-node");

        public TreeItem NextSibling
        {
            get
            {
                var nextSibling = _node.GetNextSibling();
                if (nextSibling != null && nextSibling.TagName == _node.TagName)
                {
                    return new TreeItem(nextSibling, _canvasReloadWaitMethod);
                }

                return null;
            }
        }

        public TreeItem Parent
        {
            get
            {
                var parent = _node.GetParent();
                if (parent.TagName == _node.TagName)
                {
                    return new TreeItem(parent, _canvasReloadWaitMethod);
                }

                return null;
            }
        }

        private WebElement ExpandArrow => _node.FindElement("button.ng-spd-tree-toggle");

        public ContextMenu OpenContextMenu()
        {
            _node.Driver.WaitForHorizonIsStable();
            _node.Hover();
            _node.FindElement("button[icon='dots-horizontal']").Click();
            _node.Driver.WaitForHorizonIsStable();
            return new ContextMenu(_node.Driver.FindElement("ng-spd-popover"));
        }

        public void Expand()
        {
            if (IsExpanded)
            {
                _node.WaitForCondition(c=>!c.CheckElementExists("ng-spd-loading-indicator"),2000);
                _node.Driver.WaitForHorizonIsStable();
                return;
            }

            ExpandArrow.Click();
            _node.Driver.WaitForHorizonIsStable();
        }

        public void Collapse()
        {
            if (!IsExpanded)
            {
                return;
            }

            ExpandArrow.Click();
            _node.Driver.WaitForHorizonIsStable();
        }

        public TreeItem Select()
        {
            var node = _node.FindElement("div[role='link']");
            node.Click();

            _canvasReloadWaitMethod?.Invoke();
            _node.Driver.WaitForHorizonIsStable();
            return this;
        }

        public IEnumerable<TreeItem> GetChildren()
        {
            Expand();
            IEnumerable<WebElement> elements = _node.GetChildren().Where(c => c.TagName == _node.TagName);
            return elements.Select(element => new TreeItem(element, _canvasReloadWaitMethod));
        }

        public IEnumerable<TreeItem> GetVisibleChildren()
        {
            IEnumerable<WebElement> elements = _node.GetChildren().Where(c => c.TagName == _node.TagName);
            return elements.Select(element => new TreeItem(element, _canvasReloadWaitMethod));
        }

        public void ScrollToVisible()
        {
            _node.ScrollToVisible();
        }

        public Rectangle GetElementRectangle()
        {
            return _node.GetElementRectangle();
        }

        public WebElement GetItemWebElement()
        {
            return _node;
        }

        public void SetDisplayName(string newName)
        {
            var textElement = _node.FindElement(nodeTextCssSelector);
            textElement.Clear();
            textElement.TypeKeys(newName);
            _node.Driver.WaitForHorizonIsStable();
        }

        public bool IsDisplayNameInEditMode => bool.Parse(_node.FindElement(nodeTextCssSelector).GetAttribute("contenteditable"));

        public void PressKey(string key)
        {
            var textElement = _node.FindElement(nodeTextCssSelector);
            switch (key)
            {
                case "Enter":
                    textElement.PressKeyJS("keydown", "Enter");
                    break;
                case "ESC":
                    textElement.PressKeyJS("keyup", "Escape");
                    break;
                case "F2":
                    string script = "window['documentCustomId'] = document";
                    textElement.Driver.ExecuteJavaScript(script);
                    WebElement document = new WebElement(_node.Driver, "documentCustomId");
                    document.PressKeyJS("keyup", "F2");
                    break;
            }

            _node.Driver.WaitForHorizonIsStable();
        }
    }
}
