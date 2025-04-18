// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls
{
    public class CanvasRendering : CanvasControl
    {
        private WebElement _codeElement;

        public CanvasRendering(WebElement codeElement, WebElement container) : base(container)
        {
            _codeElement = codeElement;
        }

        public string Name => _codeElement.GetAttribute("hintName");

        public string RenderingNameFromContent => Container.FindElement("h5").Text;

        public override void TakeMouseOut()
        {
            Container.FireMouseEvent(new MouseEvent("mouseout"));
        }

        public override void Select()
        {
            if (Container.CheckElementExists("#selectPoint"))
            {
                Container.FindElement("#selectPoint").Click();
                Container.Driver.WaitForHorizonIsStable();
            }
            else
            {
                Container.JsClick();
            }
        }

        public CanvasField GetFieldControl(string fieldId, PageFieldType fieldType, string contentItemId = null)
        {
            return new PageElementsLocator(Container).GetFieldControl(fieldId, fieldType, contentItemId);
        }
    }
}
