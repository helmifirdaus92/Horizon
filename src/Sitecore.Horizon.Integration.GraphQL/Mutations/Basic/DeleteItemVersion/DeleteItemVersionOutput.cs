// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.DeleteItemVersion
{
    internal record DeleteItemVersionResult(Item LatestPublishableVersion);


    internal class DeleteItemVersionOutput : ObjectGraphType<DeleteItemVersionResult>
    {
        public DeleteItemVersionOutput()
        {
            Name = "DeleteItemVersionOutput";

            Field<NonNullGraphType<BooleanGraphType>>("success", resolve: _ => true);
            Field<NonNullGraphType<ContentInterfaceGraphType>>("latestPublishableVersion", resolve: ctx => ctx.Source.LatestPublishableVersion);
        }
    }
}
