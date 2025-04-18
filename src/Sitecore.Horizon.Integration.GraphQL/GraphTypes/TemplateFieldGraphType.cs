// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using GraphQL.Types;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Pipelines.GetRootSourceItems;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class TemplateFieldGraphType : ObjectGraphType<TemplateFieldItem>
    {
        private readonly BaseCorePipelineManager _pipelineManager;

        public TemplateFieldGraphType(BaseCorePipelineManager pipelineManager)
        {
            _pipelineManager = pipelineManager;

            Name = "TemplateField";

            Field<NonNullGraphType<StringGraphType>>(
                name: "id",
                resolve: ctx => ctx.Source.ID);

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<StringGraphType>>>>(
                name: "sources",
                resolve: ctx => ResolveSources(
                    item: ctx.Source,
                    queryContext: ctx.GetHorizonUserContext()));
        }

        private object ResolveSources(TemplateFieldItem item, HorizonQueryContext queryContext)
        {
            var source = item.Source;
            if (string.IsNullOrEmpty(source))
            {
                return Array.Empty<ID>();
            }

            var getRootSourceItemsArgs = new GetRootSourceItemsArgs()
            {
                Item = queryContext.ContextItem,
                Source = source
            };
            _pipelineManager.Platform().GetRootSourceItems(getRootSourceItemsArgs);

            var rootSourceItems = getRootSourceItemsArgs.Result;
            if (rootSourceItems.Count == 0)
            {
                throw new HorizonGqlError(ItemErrorCode.InvalidTemplateSource);
            }

            return rootSourceItems.Cast<Item>().Select(x => x.ID);
        }
    }
}
