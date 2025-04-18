// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode
{
    internal class CheckRequestedMode : IHorizonPipelineProcessor<ResolveHorizonModeArgs>
    {
        public void Process(ref ResolveHorizonModeArgs args)
        {
            Assert.ArgumentNotNull(args.RequestState, nameof(args.RequestState));

            if (args.RequestState!.Mode == HeadlessMode.Disabled)
            {
                args.SetResultAndAbortPipeline(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Disabled)));
            }
        }
    }
}
