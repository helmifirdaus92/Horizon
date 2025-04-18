// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class CanvasHoverFrame : BaseControl
{
    private const string FrameSelector = "div[class*='sc-frame--']:not([select])";

    public CanvasHoverFrame(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public Rectangle Rectangle => new(FindFrameElement().Location, FindFrameElement().Size);

    public string ChipTitle => FindChipTextElement().Text;
    public string HighlightedChipText => FindFrameHighlight().Text;

    public CanvasHoverFrame? TryFindFrame(IWebDriver driver, bool throwIfNotFound)
    {
        driver.WaitForHorizonIsStable();
        return driver.CheckElementExists(FrameSelector)
            ? new CanvasHoverFrame(FindFrameElement())
            : throwIfNotFound
                ? throw new InvalidOperationException("Hover frame is not found")
                : null;
    }

    private IWebElement FindFrameElement() => Container.GetDriver().FindElement(FrameSelector);
    private IWebElement FindChipElement() => Container.GetDriver().FindElement("div[class*='sc-page-element-outline--']");
    private IWebElement FindChipTextElement() => FindChipElement().FindElement("[class*='text--']");
    private IWebElement FindFrameHighlight() => Container.GetDriver().FindElement("[class*='sc-highlight']");
}
