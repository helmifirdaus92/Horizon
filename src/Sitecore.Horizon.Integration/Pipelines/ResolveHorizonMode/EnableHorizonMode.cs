// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;

namespace Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode
{
    internal class EnableHorizonMode : IHorizonPipelineProcessor<ResolveHorizonModeArgs>
    {
        public void Process(ref ResolveHorizonModeArgs args)
        {
            Assert.ArgumentNotNull(args.RequestState, nameof(args.RequestState));

            // None of previous processors have set the Horizon mode as disabled, so proceed with resolved mode.
            HeadlessModeParametersWithHorizonHost result =
                new(HeadlessModeParametersBuilder.Persistent(args.RequestState!.Mode),
                    args.HorizonRequestState?.HorizonHost);

            args.SetResult(result);
        }
    }
}
