// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Publishing
{
    internal record SetPublishingSettingsResult(Item item);

    internal class SetPublishingSettingsOutput : ObjectGraphType<SetPublishingSettingsResult>
    {
        public SetPublishingSettingsOutput()
        {
            Name = "SetPublishingSettingsOutput";

            Field<NonNullGraphType<BooleanGraphType>>("success", resolve: _ => true);
            Field<NonNullGraphType<ContentInterfaceGraphType>>("item", resolve: ctx => ctx.Source.item);
        }
    }
}
