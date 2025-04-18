// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Create
{
    internal class CreateFolderOutput : ObjectGraphType<CreateItemResult>
    {
        public CreateFolderOutput()
        {
            Name = "CreateFolderOutput";

            Field<NonNullGraphType<BooleanGraphType>>("success", resolve: _ => true);
            Field<NonNullGraphType<ContentInterfaceGraphType>>("item", resolve: context => context.Source.Item);
        }
    }
}
