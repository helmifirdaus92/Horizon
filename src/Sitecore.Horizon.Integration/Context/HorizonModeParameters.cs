// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Integration.Context
{

#pragma warning disable CS0618
    internal class HorizonModeParameters
    {
        [Obsolete("use HeadlessModeParameters instead")]
        public HorizonMode Mode { get; set; }

        [Obsolete("use HeadlessModeParameters instead")]
        public HorizonModeDuration Duration { get; set; }

        public bool ResetDisplayMode { get; set; }

        public bool AllowBeacon { get; set; }

        public string? HorizonHost { get; set; }
    }
#pragma warning restore CS0618
}
