// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Publishing
{
    internal class PublishingChecker : IPublishingChecker
    {
        public ItemPublishingInfo GetItemPublishingInfo(Item item)
        {
            DateTime now = DateTime.UtcNow;
            var hasPublishableVersion = false;
            var isPublishable = !item.Publishing.NeverPublish;

            if (isPublishable)
            {
                hasPublishableVersion = item.Publishing.IsPublishable(now, true) && item.Publishing.GetValidVersion(now, false) != null;
            }

            return new ItemPublishingInfo(isPublishable, hasPublishableVersion);
        }
    }
}
