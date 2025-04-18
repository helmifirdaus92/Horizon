// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class SaveItemErrorGraphType : ObjectGraphType<SaveItemError>
    {
        public SaveItemErrorGraphType()
        {
            Name = "SaveItemError";

            Field<StringGraphType>("errorCode", resolve: ctx => ctx.Source.ErrorCode.ToString());
            Field<StringGraphType>("message", resolve: ctx => ctx.Source.Message);

            Field<StringGraphType>("itemId", resolve: ctx => ctx.Source.ItemId);
        }
    }
}
