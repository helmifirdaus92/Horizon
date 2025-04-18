// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Rename
{
    internal record RenameItemResult(Item Item);

    internal class RenameItemOutput : ObjectGraphType<RenameItemResult>
    {
        public RenameItemOutput()
        {
            Name = "RenameItemOutput";

            Field<NonNullGraphType<BooleanGraphType>>("success", resolve: _ => true);
            Field<NonNullGraphType<ContentInterfaceGraphType>>("item", resolve: ctx => ctx.Source.Item);
        }
    }
}
