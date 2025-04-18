// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class ItemInsertOptionGraphType : ObjectGraphType<TemplateItem>
    {
        public ItemInsertOptionGraphType()
        {
            Name = "ItemInsertOption";

            Interface<InsertOptionInterfaceGraphType>();

            Field<NonNullGraphType<StringGraphType>>(
                "displayName",
                resolve: context => context.Source.DisplayName
            );

            Field<NonNullGraphType<StringGraphType>>(
                "id",
                resolve: context => context.Source.ID
            );
        }
    }
}
