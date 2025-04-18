// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;

public class CanvasControl : BaseControl
{
    public CanvasControl(IWebElement container) : base(container)
    {
    }

    public string Text => Container.Text;
    public string InnerHTML => Container.GetInnerHtml();

    public string Name => Container.GetAttribute("hintName");

    public Rectangle ElementRectangle => new(Container.Location, Container.Size);

    public void Click()
    {
        Container.Click();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void CtrlClick()
    {
        Actions actions = new(Container.GetDriver());
        actions.KeyDown(Keys.LeftControl)
            .Click(Container)
            .KeyUp(Keys.LeftControl)
            .Build()
            .Perform();
    }

    public virtual void Hover()
    {
        Container.Hover();
    }

    public virtual void Select()
    {
        Container.HoverAndClick();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public virtual bool IsValidFrameRectangle(Rectangle highlightRectangle) => ElementRectangle == highlightRectangle;

    public virtual bool IsFrameRectangleEquivalentTo(Rectangle highlightRectangle, int maxDiff = 2)
    {
        Logger.Write($"Hover Rectangle: X={highlightRectangle.X}, Y={highlightRectangle.Y}, Width={highlightRectangle.Width}, Height={highlightRectangle.Height}");
        Logger.Write($"Element Rectangle: X={ElementRectangle.X}, Y={ElementRectangle.Y}, Width={ElementRectangle.Width}, Height={ElementRectangle.Height}");

        int xDiff = Math.Abs(ElementRectangle.X - highlightRectangle.X);
        int yDiff = Math.Abs(ElementRectangle.Y - highlightRectangle.Y);
        int wDiff = Math.Abs(ElementRectangle.Width - highlightRectangle.Width);
        int hDiff = Math.Abs(ElementRectangle.Height - highlightRectangle.Height);
        return (xDiff <= maxDiff && yDiff <= maxDiff && wDiff <= (maxDiff * 2) && hDiff <= (maxDiff * 2));
    }

    public void ScrollToElement()
    {
        Container.GetDriver().ExecuteJavaScript($"window.scrollBy({Container.Location.X}, {Container.Location.Y} - 200)");
    }
}
