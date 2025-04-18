// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser
{
    public class WindowWidth
    {
        public const int LargeDesktop = 1200;
        public const int Large = 1199;
        public const int Medium = 991;
        public const int Small = 767;
        public const int ExtraSmall = 566;

        public static int Get(string width)
        {
            switch (width.ToLower())
            {
                case "largedesktop":
                case "extralarge":
                    return LargeDesktop;
                case "large":
                    return Large;
                case "medium":
                    return Medium;
                case "small": return Small;
                case "extrasmall": return ExtraSmall;
                default: throw new ArgumentException("Unknown screen width");
            }
        }
    }
}
