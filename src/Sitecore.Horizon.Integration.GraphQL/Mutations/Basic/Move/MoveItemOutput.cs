// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Move
{
    internal record MoveItemResult;

    internal class MoveItemOutput : ObjectGraphType<MoveItemResult>
    {
        public MoveItemOutput()
        {
            Name = "MoveItemOutput";

            Field<NonNullGraphType<BooleanGraphType>>("success", resolve: _ => true);
        }
    }
}
