// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Context
{
    internal static class HeadlessModeParametersBuilder
    {
        public static HeadlessModeParameters Persistent(HeadlessMode mode)
        {
            return new HeadlessModeParameters()
            {
                Mode = mode,
                Duration = HeadlessModeDuration.Persistent,
            };
        }

        public static HeadlessModeParameters ForRequest(HeadlessMode mode)
        {
            return new HeadlessModeParameters
            {
                Mode = mode,
                Duration = HeadlessModeDuration.CurrentRequest,
            };
        }

        public static HeadlessModeParameters FallbackForDisabledDisplayMode()
        {
            return new HeadlessModeParameters
            {
                Mode = HeadlessMode.Disabled,
                Duration = HeadlessModeDuration.CurrentRequest,
                ResetDisplayMode = true
            };
        }
    }
}
