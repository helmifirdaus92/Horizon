// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Pipelines.GetComponents;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal record ComponentsInfo(IEnumerable<Item> Ungrouped, IEnumerable<ComponentGroup> Groups);

    internal class ComponentsGraphType : ObjectGraphType<ComponentsInfo>
    {
        public ComponentsGraphType()
        {
            Name = "Components";

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<ComponentGroupGraphType>>>>(
                "groups",
                resolve: ctx => ctx.Source.Groups);

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<ComponentInfoGraphType>>>>(
                "ungrouped",
                resolve: ctx => ctx.Source.Ungrouped);
        }
    }
}
