// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls
{
    public class CanvasImageField : CanvasField
    {
        public CanvasImageField(WebElement container) : base(container)
        {
        }

        public int Height => int.Parse(Container.GetAttribute("height"));
        public int Width => int.Parse(Container.GetAttribute("width"));
        public string Source => Container.GetAttribute("src");
    }
}
