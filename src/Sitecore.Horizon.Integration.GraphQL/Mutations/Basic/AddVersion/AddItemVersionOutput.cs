// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.AddVersion
{
    internal record AddItemVersionResult(Item Item);

    internal class AddItemVersionOutput : ObjectGraphType<AddItemVersionResult>
    {
        public AddItemVersionOutput()
        {
            Name = "AddItemVersionOutput";

            Field<NonNullGraphType<BooleanGraphType>>("success", resolve: _ => true);
            Field<NonNullGraphType<ContentInterfaceGraphType>>("item", resolve: ctx => ctx.Source.Item);
        }
    }
}
