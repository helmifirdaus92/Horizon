// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.DeviceSwitcher;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout
{
    public class PageLayout
    {
        private readonly string _frameSccSelector;
        private readonly BrowserWrapper _browser;
        private FramePage _canvas;
        private readonly WebElement _container;

        public PageLayout(string frameSccSelector, BrowserWrapper browser)
        {
            _browser = browser;
            _frameSccSelector = frameSccSelector;
            _canvas = _browser.GetFrame(_frameSccSelector);
            _container = _canvas.Driver.FindElement("body");
        }

        public LayoutWarning LayoutWarning
        {
            get
            {
                string text = GetControl("div.sc-applicationHeader-title").Text;
                if (text.Contains("The layout for the requested document was not found"))
                {
                    return LayoutWarning.NoLayoutFound;
                }

                return text.Contains("Permission to the requested document was denied") ? LayoutWarning.NoAccessToPage : LayoutWarning.None;
            }
        }

        public void InvokeInlineAddComponent(string placeholderKey)
        {
            GetPlaceholderControl(placeholderKey).GetElement().FindElement("#emptySpacerContainer button").Click();
        }

        public List<TimedNotification.TimedNotification> GetAllTimedNotifications()
        {
            var elements = _browser.FindElements("ng-spd-timed-notification-item");
            return elements.Select(element => new TimedNotification.TimedNotification(element)).ToList();
        }

        public Dictionary<string, string> GetCanvasCookies()
        {
            var cookie = new Dictionary<string, string>();
            var cookiesByJs = (string)_canvas.Driver.ExecuteJavaScript("return document.cookie;");
            var cookieArray = cookiesByJs.Split(';');
            foreach (string c in cookieArray)
            {
                var cookieNameAndValue = c.Trim().Split('=');
                cookie.Add(cookieNameAndValue.First(), cookieNameAndValue.Last());
            }

            return cookie;
        }

        public string GetText()
        {
            return _canvas.Driver.FindElement("body").Text;
        }

        public ScrollingState GetScrollingState()
        {
            var verticalScrollPresent = (bool)_canvas.Driver.ExecuteJavaScript("return document.documentElement.scrollHeight>document.documentElement.clientHeight;");
            var horizontalScrollPresent = (bool)_canvas.Driver.ExecuteJavaScript("return document.documentElement.scrollWidth>document.documentElement.clientWidth;");
            if (verticalScrollPresent && horizontalScrollPresent)
            {
                return ScrollingState.VerticalAndHorizontal;
            }

            if (horizontalScrollPresent)
            {
                return ScrollingState.HorizontalOnly;
            }

            if (verticalScrollPresent)
            {
                return ScrollingState.VerticalOnly;
            }

            return ScrollingState.None;
        }

        public void ScrollToElement(string cssSelector, bool allignWithTop = false)
        {
            WebElement element = _canvas.Driver.FindElement(cssSelector);
            element.ScrollToVisible(allignWithTop);
        }

        public CanvasControl GetLayoutElement()
        {
            WebElement layout = _canvas.Driver.FindElement("body");
            return new CanvasControl(layout);
        }

        public bool IsElementExists(string cssSelector)
        {
            return _canvas.Driver.CheckElement(cssSelector) != null;
        }

        public CanvasRendering GetRenderingControl(string name)
        {
            var (codeSelector, containerSelector) = Constants.GetRenderingSelectors(name);
            return new CanvasRendering(_canvas.Driver.FindElement(codeSelector), _canvas.Driver.FindElement(containerSelector));
        }

        public CanvasRendering GetRenderingControlUnderPlaceholder(string renderingName, string fullPlaceholderName)
        {
            var placeholder = GetPlaceholderControl(fullPlaceholderName);
            return placeholder.GetRenderingInThisPlaceholder(renderingName);
        }

        public List<CanvasRendering> GetAllRenderingsUnderPlaceholder(string fullPlaceholderName)
        {
            var placeholder = GetPlaceholderControl(fullPlaceholderName);
            return placeholder.GetAllRenderingsInThisPlaceholder();
        }

        public List<CanvasRendering> GetAllRenderings()
        {
            var allRenderings = new List<CanvasRendering>();
            var allRenderingsCodeElements = _canvas.Driver.FindElements(Constants.RenderingCodeSelector);
            foreach (var rederingCodeElement in allRenderingsCodeElements)
            {
                string renderingName = rederingCodeElement.GetAttribute("hintName");
                var (_, containerSelector) = Constants.GetRenderingSelectors(renderingName);
                var rendering = new CanvasRendering(rederingCodeElement, _canvas.Driver.FindElement(containerSelector));
                allRenderings.Add(rendering);
            }

            return allRenderings;
        }

        public CanvasPlaceholder GetPlaceholderControl(string name)
        {
            var (codeSelector, containerSelector) = Constants.GetPlaceholderSelectors(name);
            return new CanvasPlaceholder(_canvas.Driver.FindElement(codeSelector), _canvas.Driver.FindElement(containerSelector));
        }

        public CanvasField GetFieldControl(string fieldId, PageFieldType fieldType, string contentItemId = null)
        {
            return new PageElementsLocator(_container).GetFieldControl(fieldId, fieldType, contentItemId);
        }

        public CanvasField GetFieldControl(string cssSelector)
        {
            return new CanvasField(_canvas.Driver.FindElement($"{cssSelector}"));
        }

        public CanvasControl GetControl(string cssSelector)
        {
            return new CanvasControl(_canvas.Driver.FindElement($"{cssSelector}"));
        }

        public CanvasSelectionFrame GetSelectedFrame(bool throwIfNotFound = true) => CanvasSelectionFrame.TryFindFrame(_canvas.Driver, throwIfNotFound);

        public CanvasHoverFrame GetHoveredFrame(bool throwIfNotFound = true) => CanvasHoverFrame.TryFindFrame(_canvas.Driver, throwIfNotFound);

        public bool CheckControlExist(string cssSelector)
        {
            return _canvas.Driver.CheckElementExists($"{cssSelector}");
        }

        public object ExecuteJavaScript(string script)
        {
            return _canvas.Driver.ExecuteJavaScript(script);
        }

        public void ResetSelectionAndHighlight()
        {
            _canvas.Driver.FindElement("body").FireMouseEvent(new MouseEvent("mousedown"));
            _canvas.Driver.WaitForHorizonIsStable();
        }

        public void WaitForLoading()
        {
            _canvas = _browser.GetFrame(_frameSccSelector);
            _canvas.Driver.WaitForDocumentLoaded();
            _browser.WaitForDocumentLoaded();
        }
    }
}
