// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout
{
    public class CanvasSelectionFrame : BaseControl
    {
        private const string FrameChipSelector = "div[class*='sc-page-element-outline--'][select]";

        public CanvasSelectionFrame(IWebElement container, params object[] parameters) : base(container, parameters)
        {
        }

        public Rectangle FrameRectangle => FindFrameElement().GetElementRectangle();
        public ChipElement ChipElement => new(Container.GetDriver().FindElement(FrameChipSelector));

        public bool IsPersonalized => FrameShowsPersonalizationApplied(FindFrameElement()) && ChipShowsPersonalizationApplied(Container.GetDriver().FindElement(FrameChipSelector));

        private bool FrameShowsPersonalizationApplied(IWebElement element)
        {
            return element.GetClassList().Any(c => c.Contains("sc-personalized"));
        }

        private IWebElement FindFrameElement() => Container.GetDriver().FindElement("div[class*='sc-frame--'][select]");

        private bool ChipShowsPersonalizationApplied(IWebElement element)
        {
            return element.GetClassList().Any(c => c.Contains("sc-personalized"));
        }
    }
}
