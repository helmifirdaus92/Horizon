// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Create
{
    internal class CreateRawItemOutput : ObjectGraphType<CreateItemResult>
    {
        public CreateRawItemOutput()
        {
            Name = "CreateRawItemOutput";

            Field<NonNullGraphType<BooleanGraphType>>("success", resolve: _ => true);
            Field<NonNullGraphType<RawItemGraphType>>("rawItem", resolve: context => context.Source.Item);
        }
    }
}
