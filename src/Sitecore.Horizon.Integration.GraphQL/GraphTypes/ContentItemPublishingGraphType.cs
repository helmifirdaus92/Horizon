// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using GraphQL.Types;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class ContentItemPublishingGraphType : ObjectGraphType<ItemPublishing>
    {
        public ContentItemPublishingGraphType()
        {
            Name = "ContentItemPublishing";

            Field<NonNullGraphType<BooleanGraphType>>("isPublishable", resolve: ctx => !ctx.Source.NeverPublish);
            Field<NonNullGraphType<BooleanGraphType>>("hasPublishableVersion", resolve: ctx =>
            {
                var itemPublishing = ctx.Source;
                DateTime now = DateTime.UtcNow;

                return !itemPublishing.NeverPublish
                    && itemPublishing.IsPublishable(now, true)
                    && itemPublishing.GetValidVersion(now, false) != null;
            });
            Field<NonNullGraphType<StringGraphType>>("validFromDate", resolve: ctx => ctx.Source.ValidFrom);
            Field<NonNullGraphType<StringGraphType>>("validToDate", resolve: ctx => ctx.Source.ValidTo);
            Field<NonNullGraphType<BooleanGraphType>>("isAvailableToPublish", resolve: ctx => !ctx.Source.HideVersion);
        }
    }
}
