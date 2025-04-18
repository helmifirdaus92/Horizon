// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout
{
    public class CanvasField : CanvasControl
    {
        private static string[] KnownInlineFieldTypes = new[]
        {
            "single-line text",
            "multi-line text",
            "rich text",
            "integer",
            "number",
            "date",
            "datetime"
        };

        public bool IsFieldDimmed => Container.GetParent().CheckElementExists("span[class*='sc-watermark--']") || Container.GetParent().CheckElementExists("div[class*='sc-watermark--']") && Container.GetParent().CheckElementExists("div[class*='ql-blank']");

        public CanvasField(IWebElement container) : base(container)
        {
        }

        public CanvasField Clear()
        {
            Click();
            Container.GetId();
            Container.Clear();
            Thread.Sleep(100);
            return this;
        }

        public CanvasField LooseFocus()
        {
            IWebElement? noMatterRendering = Container.GetDriver().FindElement("[kind='open'] ~ :not(code)");
            noMatterRendering.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            return this;
        }

        public void AutoSaveWithInactivity()
        {
            Thread.Sleep(TimeSpan.FromSeconds(3));
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public override bool IsValidFrameRectangle(Rectangle highlightRectangle)
        {
            return IsValidFieldHighlight(highlightRectangle);
        }

        protected bool IsValidFieldHighlight(Rectangle highlightRectangle)
        {
            Logger.Write($"Hover Rectangle: X={highlightRectangle.X}, Y={highlightRectangle.Y}, Width={highlightRectangle.Width}, Height={highlightRectangle.Height}");
            Logger.Write($"Element Rectangle: X={ElementRectangle.X}, Y={ElementRectangle.Y}, Width={ElementRectangle.Width}, Height={ElementRectangle.Height}");
            //highlight border is extended 2 pixels left to have place for caret before first character in field
            int caretVisibilityLeftShift = 2; //2 px
            if (ElementRectangle.X == highlightRectangle.X + caretVisibilityLeftShift && ElementRectangle.Y == highlightRectangle.Y &&
                ElementRectangle.Width == highlightRectangle.Width - caretVisibilityLeftShift)
            {
                return ElementRectangle.Height == highlightRectangle.Height;
            }

            return false;
        }
    }
}
