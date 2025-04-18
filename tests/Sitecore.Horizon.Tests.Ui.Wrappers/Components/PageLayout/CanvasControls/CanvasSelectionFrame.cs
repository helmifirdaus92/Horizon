// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Drawing;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageDesigning;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls
{
    public class CanvasSelectionFrame
    {
        private const string FrameSelector = "div[class*='sc-frame--'][select]";

        private readonly UtfWebDriver _driver;

        private CanvasSelectionFrame(UtfWebDriver driver)
        {
            _driver = driver;
        }

        public Rectangle FrameRectangle => FindFrameElement().GetElementRectangle();

        public Rectangle ChipRectangle => ChipElement.GetElementRectangle();

        public bool IsPersonalized => FrameShowsPersonalizationApplied(FindFrameElement()) && ChipShowsPersonalizationApplied(ChipElement);

        public string ChipTitle => FindChipTextElement().Text;

        public bool HasChipIcon => FindChipIconElement().Displayed;

        public WebElement ChipElement => _driver.FindElement("div[class*='sc-page-element-outline--'][select]");

        public static CanvasSelectionFrame TryFindFrame(UtfWebDriver driver, bool throwIfNotFound)
        {
            driver.WaitForHorizonIsStable();
            return driver.CheckElementExists(FrameSelector)
                ? new CanvasSelectionFrame(driver)
                : throwIfNotFound
                    ? throw new InvalidOperationException("Selection frame is not found")
                    : null;
        }

        public void ChipNavigateUp()
        {
            var iconElement = FindChipIconElement();
            iconElement.Click();
            _driver.WaitForHorizonIsStable();
        }

        public void MoveRenderingUp() => ChipElement.FindElement("[class*='arrow-up']:not([class*='arrow-up-left'])").Click();
        public void MoveRenderingDown() => ChipElement.FindElement("[class*='arrow-down']").Click();

        public DatasourceDialog OpenAssignContentItemDialog()
        {
            ChipElement.FindElement("[class*='text-search']").Click();
            _driver.SwitchToRootDocument();
            var datasourceDialog = new DatasourceDialog(_driver.FindElement(Constants.datasourceDialogSelector));
            _driver.WaitForHorizonIsStable();
            return datasourceDialog;
        }

        public void DeleteRendering() => ChipElement.FindElement("[class*='delete-outline']").Click();
        public bool IsDeleteButtonPresent() => ChipElement.CheckElementExists("[class*='delete-outline']");

        private WebElement FindFrameElement() => _driver.FindElement(FrameSelector);

        private WebElement FindChipTextElement() => ChipElement.FindElement("[class*='text--']");

        private WebElement FindChipIconElement() => ChipElement.FindElement("[title='Select parent element']");

        private bool ChipShowsPersonalizationApplied(WebElement element)
        {
            return element.GetClassList().Any(c => c.Contains("sc-personalized"));
        }

        private bool FrameShowsPersonalizationApplied(WebElement element)
        {
            return element.GetClassList().Any(c => c.Contains("sc-personalized"));
        }
    }
}
