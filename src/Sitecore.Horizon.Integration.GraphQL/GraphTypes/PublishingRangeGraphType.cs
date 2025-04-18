// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Timeline;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class PublishingRangeGraphType : ObjectGraphType<ItemVersionPublishingRange>
    {
        public PublishingRangeGraphType()
        {
            Name = "PublishingRange";

            Field<IntGraphType>("version", resolve: context => context.Source.ItemVersion.Version.Number);
            Field<DateTimeGraphType>("publishDate", resolve: context => context.Source.Range.PublishDate);
            Field<DateTimeGraphType>("unpublishDate", resolve: context => context.Source.Range.UnpublishDate);
        }
    }
}
