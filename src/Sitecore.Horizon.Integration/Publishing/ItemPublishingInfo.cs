// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Publishing
{
    internal class ItemPublishingInfo
    {
        public ItemPublishingInfo(bool isPublishable, bool hasPublishableVersion)
        {
            IsPublishable = isPublishable;
            HasPublishableVersion = hasPublishableVersion;
        }

        public bool IsPublishable { get; }
        public bool HasPublishableVersion { get; }
    }
}
