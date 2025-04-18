// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Diagnostics;
using Sitecore.ExperienceEditor.Pipelines.CanShowEditor;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.CanShowEditor
{
    [UsedInConfiguration]
    internal class HandleHorizonMode : IPlatformPipelineProcessor<CanShowEditorPipelineEventArgs>
    {
        private readonly IHorizonInternalContext _horizonContext;

        public HandleHorizonMode(IHorizonInternalContext horizonContext)
        {
            Assert.ArgumentNotNull(horizonContext, nameof(horizonContext));

            _horizonContext = horizonContext;
        }

        public void Process(CanShowEditorPipelineEventArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            if (_horizonContext.GetHeadlessMode() != HeadlessMode.Disabled)
            {
                args.CanShow = false;
            }
        }
    }
}
