// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;
using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders
{
    internal class AddHorizonCanvasState : IHorizonPipelineProcessor<BuildHorizonPageExtendersArgs>
    {
        private readonly IHorizonInternalContext _horizonContext;
        private readonly ICanvasMessageFactory _canvasMessageFactory;

        public AddHorizonCanvasState(IHorizonInternalContext horizonContext, ICanvasMessageFactory canvasMessageFactory)
        {
            _horizonContext = horizonContext;
            _canvasMessageFactory = canvasMessageFactory;
        }

        public void Process(ref BuildHorizonPageExtendersArgs args)
        {
            if (_horizonContext.GetHeadlessMode() is not HeadlessMode.Edit and not HeadlessMode.Preview)
            {
                return;
            }

            args.BodyContent.AppendLine(BuildStateObjectHtml());
        }

        private string BuildStateObjectHtml()
        {
            CanvasMessage<CanvasState> canvasState = _canvasMessageFactory.CreateStateMessage();
            string stateJson = JsonConvert.SerializeObject(canvasState);

            return "<script id='hrz-canvas-state' type='application/json'>" + stateJson + "</script>";
        }
    }
}
