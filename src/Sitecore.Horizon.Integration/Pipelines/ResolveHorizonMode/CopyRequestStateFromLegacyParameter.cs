// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Context;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode
{
#pragma warning disable CS0618
    internal class CopyRequestStateFromLegacyParameter : IHorizonPipelineProcessor<ResolveHorizonModeArgs>
    {
        public void Process(ref ResolveHorizonModeArgs args)
        {
            if (args.RequestState == null || args.HorizonRequestState == null)
            {
                return;
            }

            // Set Headless mode from legacy horizon parameter when it contains value and a new one is disabled
            if (args.RequestState.Mode == HeadlessMode.Disabled && args.HorizonRequestState.Mode != HorizonMode.Disabled)
            {
                args.RequestState = new HeadlessRequestState(ConvertToHeadlessMode(args.HorizonRequestState!.Mode));
            }
        }

        private static HeadlessMode ConvertToHeadlessMode(HorizonMode horizonMode)
        {
            return horizonMode switch
            {
                HorizonMode.Api => HeadlessMode.Api,
                HorizonMode.Editor => HeadlessMode.Edit,
                HorizonMode.Preview => HeadlessMode.Preview,
                _ => HeadlessMode.Disabled,
            };
        }
    }
#pragma warning restore CS0618
}
