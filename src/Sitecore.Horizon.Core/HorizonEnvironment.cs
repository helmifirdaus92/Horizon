// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;

namespace Sitecore.Horizon.Core
{
    [ExcludeFromCodeCoverage]
    internal static class HorizonEnvironment
    {
        public static readonly bool EnableDevLiveClientCompilation = Environment.GetEnvironmentVariable("HORIZON_DEV_CLIENT_LIVE") != null;
    }
}
