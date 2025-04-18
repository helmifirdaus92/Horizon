// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Web;

namespace Sitecore.Horizon.Integration.Canvas
{
    internal class CanvasMessageFactory : ICanvasMessageFactory
    {
        private readonly ISitecoreContext _sitecoreContext;

        public CanvasMessageFactory(ISitecoreContext sitecoreContext)
        {
            Assert.ArgumentNotNull(sitecoreContext, nameof(sitecoreContext));

            _sitecoreContext = sitecoreContext;
        }

        public CanvasMessage<CanvasState> CreateStateMessage()
        {
            return new CanvasMessage<CanvasState>(CanvasMessageType.State, CreateState());
        }

        public CanvasState CreateState()
        {
            return  new CanvasState
            {
                ItemId = _sitecoreContext.Item?.ID,
                SiteName = _sitecoreContext.Site?.Name,
                Language = _sitecoreContext.Language.Name,
                DeviceId = _sitecoreContext.Device?.ID,
                ItemVersion = _sitecoreContext.Item?.Version.Number,
                PageMode = _sitecoreContext.Site?.DisplayMode.ToString("G").ToUpperInvariant() ?? "UNKNOWN",
                Variant = WebUtil.GetQueryString("sc_variant", null)
            };
        }

        public CanvasMessage<PresentationDetails> CreatePresentationDetailsMessage(PresentationDetails presentationDetails)
        {
            return new CanvasMessage<PresentationDetails>(CanvasMessageType.Layout, presentationDetails);
        }

        public CanvasMessage<HostVerificationModel> CreateHostVerificationTokenMessage(HostVerificationModel hostVerification)
        {
            return new CanvasMessage<HostVerificationModel>(CanvasMessageType.HostVerificationToken, hostVerification);
        }
    }
}
