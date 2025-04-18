// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.RenameItemVersion
{
    internal record RenameItemVersionResult(Item ItemVersion);

    internal class RenameItemVersionOutput : ObjectGraphType<RenameItemVersionResult>
    {
        public RenameItemVersionOutput()
        {
            Name = "RenameItemVersionOutput";

            Field<NonNullGraphType<BooleanGraphType>>("success", resolve: _ => true);
            Field<NonNullGraphType<ContentInterfaceGraphType>>("itemVersion", resolve: ctx => ctx.Source.ItemVersion);
        }
    }
}
