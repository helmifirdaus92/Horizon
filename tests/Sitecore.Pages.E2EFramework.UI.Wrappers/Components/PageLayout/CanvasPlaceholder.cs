// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.ObjectModel;
using System.Drawing;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;

public class CanvasPlaceholder : BaseControl, INamedObject
{
    private readonly Point _frameLocation;

    public CanvasPlaceholder(IWebElement container, Point frameLocation) : base(container)
    {
        _frameLocation = frameLocation;
    }

    public string Name => Container.Text;

    public IWebElement AddComponentButton => Container.FindElement("#emptySpacerContainer button");

    public Rectangle ElementRectangle => new(Container.Location, Container.Size);
    public virtual bool IsValidFrameRectangle(Rectangle highlightRectangle) => ElementRectangle == highlightRectangle;

    public Point DropLocation
    {
        get
        {
            var internalLocation = Container.Location;
            return new Point(internalLocation.X + _frameLocation.X + 1, internalLocation.Y + _frameLocation.Y + 1);
        }
    }

    public List<CanvasControl> GetAllRenderingsInThisPlaceholder()
    {
        List<CanvasControl> allRenderings = new List<CanvasControl>();
        IWebElement parent = Container.GetParent(); //element which combines current placeholder and all renderings inside it

        var allRenderingsCodeElements = parent.FindElements(Constants.RenderingCodeSelector);
        foreach (IWebElement? renderingCodeElement in allRenderingsCodeElements)
        {
            CanvasControl rendering = new(renderingCodeElement);
            allRenderings.Add(rendering);
        }

        return allRenderings;
    }
}
