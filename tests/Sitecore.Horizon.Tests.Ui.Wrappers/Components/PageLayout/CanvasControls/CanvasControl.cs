// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls
{
    public class CanvasControl
    {
        protected WebElement Container;
        protected JsHelper _jsHelper;

        public CanvasControl(WebElement container)
        {
            Container = container;
            _jsHelper = new JsHelper(container.Driver);
        }

        public bool IsFieldDimmed => Container.GetParent().CheckElementExists("span[class*='sc-watermark--']") || Container.GetParent().CheckElementExists("div[class*='sc-watermark--']") && Container.GetParent().CheckElementExists("div[class*='ql-blank']");
        public Rectangle FieldRectangle => Container.GetElementRectangle();
        public Rectangle ElementRectangle => Container.GetElementRectangle();
        public string Text => Container.Text;
        public string InnerHTML => Container.InnerHtml;
        public string OuterHTML => (string)Container.Driver.ExecuteJavaScript($"return window['{Container.Id}'].outerHTML");

        public virtual void Highlight()
        {
            Container.Hover();
        }

        public virtual void TakeMouseOut()
        {
            Container.FireMouseEvent(new MouseEvent("mouseleave"));
        }

        public void Click()
        {
            Container.Click();
            Container.Driver.WaitForHorizonIsStable();
        }

        public void CtrlClick()
        {
            var mouseEvent = new MouseEvent("mousedown")
            {
                CtrlKey = true
            };
            Container.FireMouseEvent(mouseEvent);
            Container.Driver.ExecuteJavaScript("document.activeElement.blur()");
            Container.Driver.WaitForHorizonIsStable();
            mouseEvent.Type = "click";
            Container.FireMouseEvent(mouseEvent);
            Container.Driver.WaitForHorizonIsStable();
        }

        public void ClickWithControlKey()
        {
            var script = @"
            function isDescendant(parent, el){
                let desc = parent.querySelectorAll('*');
                for (var i = 0; i < desc.length; ++i){
                    if (desc[i] === el){
                        return true;
                    }
                }
                return false;
            }
            let element = window['" + Container.Id + @"'];
            element.scrollIntoView(false)
            let r = element.getBoundingClientRect();
            let xPoint = r.left + r.width / 2;
            let yPoint = r.top + r.height / 2;
            let elementInCenter = document.elementFromPoint(xPoint, yPoint);
            if (!isDescendant(element, elementInCenter)){
                elementInCenter = element;
            }
            elementInCenter.dispatchEvent(new MouseEvent('mousedown', {'cancelable': true, 'view': window, 'bubbles': true, 'ctrlKey': true }));
            if (document.activeElement.blur) {
                document.activeElement.blur();
            }
            elementInCenter.focus();
            setTimeout(function() {
                elementInCenter.dispatchEvent(new MouseEvent('mouseup', {'cancelable': true, 'view': window, 'bubbles': true, 'ctrlKey': true }));
                elementInCenter.dispatchEvent(new MouseEvent('click', {'cancelable': true, 'view': window, 'bubbles': true, 'ctrlKey': true }));
            },10);";

            Container.Driver.ExecuteJavaScript(script);
            Container.Driver.WaitForHorizonIsStable();
        }

        public virtual void Select()
        {
            Click();
        }

        public void ScrollToElement(bool alignWithTop = false)
        {
            Container.ScrollToVisible(alignWithTop);
        }

        public List<WebElement> GetElements(string cssSelector)
        {
            return Container.FindElements(cssSelector).ToList();
        }

        public WebElement GetElement()
        {
            return Container;
        }

        public WebElement GetChromeElement()
        {
            var element = Container.Driver.FindElement(".sc-frame--2M1LL");
            return element;
        }

        public virtual bool IsValidFrameRectangle(Rectangle highlightRectangle) => ElementRectangle == highlightRectangle;

        public virtual bool IsFrameRectangleEquivalentTo(Rectangle highlightRectangle, int maxDiff = 2)
        {
            int xDiff = Math.Abs(ElementRectangle.X - highlightRectangle.X);
            int yDiff = Math.Abs(ElementRectangle.Y - highlightRectangle.Y);
            int wDiff = Math.Abs(ElementRectangle.Width - highlightRectangle.Width);
            int hDiff = Math.Abs(ElementRectangle.Height - highlightRectangle.Height);
            return (xDiff <= maxDiff && yDiff <= maxDiff && wDiff <= (maxDiff * 2) && hDiff <= (maxDiff * 2));
        }

        public double GetClientHeightBelowTheControl()
        {
            var script = $@"return document.documentElement.getBoundingClientRect().height
                - (window['{Container.Id}'].getBoundingClientRect().y + window['{Container.Id}'].getBoundingClientRect().height)";
            return (double)Container.Driver.ExecuteJavaScript(script);
        }
    }
}
