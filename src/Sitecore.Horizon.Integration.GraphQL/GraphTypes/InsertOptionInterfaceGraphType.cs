// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Items;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class InsertOptionInterfaceGraphType : InterfaceGraphType<TemplateItem>
    {
        public InsertOptionInterfaceGraphType(ItemTemplateGraphType itemTemplateGraphType, BranchTemplateGraphType branchTemplateGraphType, IHorizonItemHelper itemHelper)
        {
            Name = "InsertOption";

            Field<NonNullGraphType<StringGraphType>>("id");

            Field<NonNullGraphType<StringGraphType>>("displayName");

            ResolveType = value =>
            {
                var branchId = itemHelper.GetBranchTemplateId((TemplateItem) value);
                return branchId is null ? itemTemplateGraphType : branchTemplateGraphType;
            };
        }
    }
}
