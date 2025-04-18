// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.ChangeDisplayName
{
    internal record ChangeDisplayNameResult(Item Item);

    internal class ChangeDisplayNameOutput : ObjectGraphType<ChangeDisplayNameResult>
    {
        public ChangeDisplayNameOutput()
        {
            Name = "ChangeDisplayNameOutput";

            Field<BooleanGraphType>("success", resolve: _ => true);
            Field<ContentInterfaceGraphType>("item", resolve: context => context.Source.Item);
        }
    }
}
