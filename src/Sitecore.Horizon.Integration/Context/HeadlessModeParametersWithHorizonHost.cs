// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Context
{
    internal class HeadlessModeParametersWithHorizonHost
    {
        public HeadlessModeParametersWithHorizonHost(HeadlessModeParameters parameters, string? horizonHost = null)
        {
            Parameters = parameters;
            HorizonHost = horizonHost;
        }

        public HeadlessModeParameters Parameters { get; set; }

        public string? HorizonHost { get; set; }
    }
}
