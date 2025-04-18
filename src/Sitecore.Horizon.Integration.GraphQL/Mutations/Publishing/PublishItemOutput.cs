// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Publishing
{
    internal class PublishItemOutput : ObjectGraphType<Handle>
    {
        public PublishItemOutput()
        {
            Name = "PublishItemOutput";

            Field<NonNullGraphType<BooleanGraphType>>(name: "acknowledged", resolve: _ => true, description: "Specifies whether publishing request has been successfully queued.");

            Field<NonNullGraphType<StringGraphType>>(name: "handle", resolve: ctx => ctx.Source.ToString(), description: "A handle used to query publishing status later.");
        }
    }
}
