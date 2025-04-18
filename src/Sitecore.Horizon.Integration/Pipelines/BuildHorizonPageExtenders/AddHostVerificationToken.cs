// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;
using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Security;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders
{
    internal class AddHostVerificationToken : IHorizonPipelineProcessor<BuildHorizonPageExtendersArgs>
    {
        private readonly IHorizonInternalContext _horizonContext;
        private readonly ISitecoreContext _sitecoreContext;
        private readonly IHostVerificationTokenHelper _hostTokenVerificationProvider;
        private readonly ICanvasMessageFactory _canvasMessageFactory;

        public AddHostVerificationToken(IHorizonInternalContext horizonContext,
            ISitecoreContext sitecoreContext,
            IHostVerificationTokenHelper tokenHelper,
            ICanvasMessageFactory canvasMessageFactory
        )
        {
            _horizonContext = horizonContext;
            _sitecoreContext = sitecoreContext;
            _hostTokenVerificationProvider = tokenHelper;
            _canvasMessageFactory = canvasMessageFactory;
        }

        public void Process(ref BuildHorizonPageExtendersArgs args)
        {
            if (_sitecoreContext.Item == null || _horizonContext.GetHeadlessMode() != HeadlessMode.Edit)
            {
                return;
            }

            args.BodyContent.AppendLine(VerificationTokenHtml());

            string VerificationTokenHtml()
            {
                var hostVerification = new HostVerificationModel()
                {
                    HostVerificationToken = _hostTokenVerificationProvider.BuildHostVerificationToken()
                };

                CanvasMessage<HostVerificationModel> hostVerificationMessage = _canvasMessageFactory.CreateHostVerificationTokenMessage(hostVerification);

                return "<script id='hrz-canvas-verification-token' type='application/json'>" + JsonConvert.SerializeObject(hostVerificationMessage) + "</script>";
            }
        }
    }
}
