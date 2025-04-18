// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Delete
{
    internal record DeleteItemResult;

    internal class DeleteItemOutput : ObjectGraphType<DeleteItemResult>
    {
        public DeleteItemOutput()
        {
            Name = "DeleteItemOutput";

            Field<BooleanGraphType>("success", resolve: _ => true);
        }
    }
}
