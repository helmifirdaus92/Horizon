// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
using System;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout
{
    public class PageElementsLocator
    {
        private WebElement _container;
        public PageElementsLocator(WebElement container)
        {
            _container = container;
        }
        public CanvasField GetFieldControl(string fieldId, PageFieldType fieldType, string contentItemId = null)
        {
            var sccSelectorId = FormSccSelectorId(fieldId, contentItemId);
            switch (fieldType)
            {
                case PageFieldType.Image:
                    return new CanvasImageField(_container.FindElement($"{sccSelectorId} ~img"));
                case PageFieldType.GeneralLink:
                case PageFieldType.GeneralLinkWithSearch:
                    bool generalLinkAnchorExists = _container.CheckElementExists($"{sccSelectorId} ~a");
                    return generalLinkAnchorExists
                        ? new CanvasField(_container.FindElement($"{sccSelectorId} ~a"))
                        : new CanvasField(_container.FindElement($"{sccSelectorId} ~span"));
                case PageFieldType.RichText:
                    return new CanvasField(_container.FindElement($".scWebEditInput{sccSelectorId} div"));
                default:
                    return new CanvasField(_container.FindElement($".scWebEditInput{sccSelectorId}"));
            }
        }
        private string FormSccSelectorId(string fieldId, string contentItemId = null)
        {
            var id = Guid.Parse(fieldId).ToString("N");
            var sccSelectorId = $"[id *= '{id}']".ToUpper();

            if (contentItemId != null)
            {
                var itemId = Guid.Parse(contentItemId).ToString("N");
                sccSelectorId += $"[id *= '{itemId}']".ToUpper();
            }

            return sccSelectorId;
        }
    }
}
