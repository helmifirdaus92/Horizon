// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

#nullable disable warnings

namespace Sitecore.Horizon.Integration.Items.Saving
{
    internal enum LayoutKind
    {
        Final = 0,
        Shared = 1
    }

    internal class PresentationDetailsInfo
    {
        public LayoutKind Kind { get; set; }

        public string Body { get; set; }
    }
}
