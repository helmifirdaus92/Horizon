// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Diagnostics.CodeAnalysis;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Timeline
{
    internal class ItemVersionPublishingRange
    {
        [SuppressMessage("Microsoft.Design", "CA1045:DoNotPassTypesByReference", Justification = "'in' keyword is a common usage for readonly struct.")]
        public ItemVersionPublishingRange(Item itemVersion, in PublishingRange range)
        {
            Assert.ArgumentNotNull(itemVersion, nameof(itemVersion));

            ItemVersion = itemVersion;
            Range = range;
        }

        public Item ItemVersion { get; }

        public PublishingRange Range { get; }
    }
}
