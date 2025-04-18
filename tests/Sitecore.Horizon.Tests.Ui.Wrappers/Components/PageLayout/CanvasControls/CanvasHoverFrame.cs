// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Drawing;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls
{
    public class CanvasHoverFrame
    {
        private const string FrameSelector = "div[class*='sc-frame--']:not([select])";

        private readonly UtfWebDriver _driver;

        private CanvasHoverFrame(UtfWebDriver driver)
        {
            _driver = driver;
        }

        public Rectangle Rectangle => FindFrameElement().GetElementRectangle();

        public string ChipTitle => FindChipTextElement().Text;

        public static CanvasHoverFrame TryFindFrame(UtfWebDriver driver, bool throwIfNotFound)
        {
            driver.WaitForHorizonIsStable();
            return driver.CheckElementExists(FrameSelector)
                ? new CanvasHoverFrame(driver)
                : throwIfNotFound
                    ? throw new InvalidOperationException("Hover frame is not found")
                    : null;
        }

        private WebElement FindFrameElement() => _driver.FindElement(FrameSelector);
        private WebElement FindChipElement() => _driver.FindElement("div[class*='sc-page-element-outline--']");

        private WebElement FindChipTextElement() => FindChipElement().FindElement("[class*='text--']");
    }
}
