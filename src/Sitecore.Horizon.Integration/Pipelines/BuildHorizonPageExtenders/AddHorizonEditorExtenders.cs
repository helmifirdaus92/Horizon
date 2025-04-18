// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using Sitecore.Horizon.Integration.Context;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders
{
    internal class AddHorizonEditorExtenders : IHorizonPipelineProcessor<BuildHorizonPageExtendersArgs>
    {
        private readonly IHorizonInternalContext _horizonContext;

        public AddHorizonEditorExtenders(IHorizonInternalContext horizonContext)
        {
            _horizonContext = horizonContext;
        }

        public void Process(ref BuildHorizonPageExtendersArgs args)
        {
            if (_horizonContext.GetHeadlessMode() != HeadlessMode.Edit)
            {
                return;
            }

            args.BodyContent.AppendLine(GetMetadataStylesHtml());
        }

        private static string GetMetadataStylesHtml()
        {
            return @"
            <style>
                .scpm, .scChromeData {
                    display: none !important;
                }
            </style>";
        }
    }
}
