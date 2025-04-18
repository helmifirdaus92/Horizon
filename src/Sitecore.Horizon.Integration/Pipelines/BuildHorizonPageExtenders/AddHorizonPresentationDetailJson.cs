// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Globalization;
using Newtonsoft.Json;
using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Presentation;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders
{
    internal class AddHorizonPresentationDetailsJson : IHorizonPipelineProcessor<BuildHorizonPageExtendersArgs>
    {
        private readonly IHorizonInternalContext _horizonContext;
        private readonly ISitecoreContext _sitecoreContext;
        private readonly IPresentationDetailsRepository _presentationDetailsRepository;
        private readonly ICanvasMessageFactory _canvasMessageFactory;

        public AddHorizonPresentationDetailsJson(IHorizonInternalContext horizonContext,
            ISitecoreContext sitecoreContext,
            IPresentationDetailsRepository presentationDetailsRepository,
            ICanvasMessageFactory canvasMessageFactory
        )
        {
            _horizonContext = horizonContext;
            _sitecoreContext = sitecoreContext;
            _presentationDetailsRepository = presentationDetailsRepository;
            _canvasMessageFactory = canvasMessageFactory;
        }

        public void Process(ref BuildHorizonPageExtendersArgs args)
        {
            if (_sitecoreContext.Item == null || _horizonContext.GetHeadlessMode() != HeadlessMode.Edit)
            {
                return;
            }

            var presentationDetails = _presentationDetailsRepository.GetItemPresentationDetails(_sitecoreContext.Item);
            CanvasMessage<PresentationDetails> presentationDetailMessage = _canvasMessageFactory.CreatePresentationDetailsMessage(presentationDetails);

            args.BodyContent.AppendLine("<script id='hrz-canvas-layout' type='application/json'>" + JsonInvariant(presentationDetailMessage) + "</script>");
        }

        private static string JsonInvariant(object value)
        {
            var settings = new JsonSerializerSettings
            {
                Culture = CultureInfo.InvariantCulture
            };

            return JsonConvert.SerializeObject(value, settings);
        }
    }
}
