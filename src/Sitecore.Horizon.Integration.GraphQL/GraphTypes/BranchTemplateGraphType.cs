// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Items;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class BranchTemplateGraphType : ItemInsertOptionGraphType
    {
        public BranchTemplateGraphType(IHorizonItemHelper itemHelper)
        {
            Name = "BranchTemplate";

            Field<NonNullGraphType<StringGraphType>>(
                "templateId",
                resolve: ctx => itemHelper.GetBranchTemplateId(ctx.Source)
            );
        }
    }
}
