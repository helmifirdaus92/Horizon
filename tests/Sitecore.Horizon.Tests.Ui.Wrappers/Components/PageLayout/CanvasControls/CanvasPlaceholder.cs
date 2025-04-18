// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls
{
    public class CanvasPlaceholder : CanvasControl
    {
        private readonly WebElement _codeElement;
        private readonly WebElement _container;

        public CanvasPlaceholder(WebElement codeElement, WebElement container) : base(container)
        {
            _codeElement = codeElement;
            _container = container;
        }

        public string Key => _codeElement.GetAttribute("key");
        public string Name => Key.Split('/').Last();

        public Rectangle GetDesigningOutlineRectangle()
        {
            var outlineElement = _container.Driver.FindElement("[class*=sc-designing-frame]");
            if (outlineElement.GetClass().Contains("non-droppable"))
            {
                throw new Exception("outline should be droppable");
            }

            return outlineElement.GetElementRectangle();
        }

        public Rectangle GetDesigningNonDroppableOutlineRectangle()
        {
            return _container.Driver.FindElement("[class*=non-droppable]").GetElementRectangle();
        }

        public CanvasRendering GetRenderingInThisPlaceholder(string renderingName)
        {
            var (codeSelector, containerSelector) = Constants.GetRenderingSelectors(renderingName);
            var parent = _container.GetParent(); //element which combines current placeholder and all renderings inside it
            return new CanvasRendering(parent.FindElement(codeSelector), parent.FindElement(containerSelector));
        }
        public void ClickAtNotCenter()
        {
            var (_, containerSelector) = Constants.GetPlaceholderSelectors(Key);
            _container.Driver.ClickAtNotCenter(containerSelector);
        }

        public List<CanvasRendering> GetAllRenderingsInThisPlaceholder()
        {
            var allRenderings = new List<CanvasRendering>();
            var parent = _container.GetParent(); //element which combines current placeholder and all renderings inside it

            var allRenderingsCodeElements = parent.FindElements(Constants.RenderingCodeSelector);
            foreach (var rederingCodeElement in allRenderingsCodeElements)
            {
                string renderingName = rederingCodeElement.GetAttribute("hintName");
                var (_, containerSelector) = Constants.GetRenderingSelectors(renderingName);
                var rendering = new CanvasRendering(rederingCodeElement, parent.FindElement(containerSelector));
                allRenderings.Add(rendering);
            }

            return allRenderings;
        }

        public bool IsRenderingShownUnderPlaceholder(string renderingName)
        {
            var (codeSelector, containerSelector) = Constants.GetRenderingSelectors(renderingName);
            var parent = _container.GetParent();
            return parent.CheckElementExists(codeSelector) || parent.CheckElementExists(containerSelector);
        }

        public bool IsRenderingHiddenInPlaceholder(string renderingName)
        {
            var parent = _container.GetParent();

            var allRenderingsCodeElements = parent.FindElements(Constants.RenderingCodeSelector).ToList();
            var rendering = allRenderingsCodeElements.Find(e => e.GetAttribute("hintname").Equals(renderingName)).GetNextSibling();

            return rendering.InnerHtml.Contains("bg_hidden_rendering.png");
        }

        public bool IsPlaceholderEmpty()
        {
            return _container.GetClass().Contains("empty-placeholder");
        }

        public bool IsSpinnerPresent()
        {
            var elementRectangle = _container.GetElementRectangle();
            const string spinnerCssSelector = "div[class*='sc-designing-frame--'] div[class*='horizon-loading-indicator--']";
            var spinnerElement = _container.Driver.CheckElement(spinnerCssSelector);
            if (spinnerElement == null)
            {
                return false;
            }

            var spinnerRectangle = spinnerElement.GetElementRectangle();
            return elementRectangle.Contains(spinnerRectangle.X, spinnerRectangle.Y);
        }
    }
}
