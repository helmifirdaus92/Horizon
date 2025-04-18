// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Abstractions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Pipelines.ResolveRenderingDatasource;

namespace Sitecore.Horizon.Integration.GraphQL.Queries
{
    internal class HorizonDataSourceResolverQueries : ObjectGraphType
    {
        private readonly IHorizonItemHelper _itemHelper;
        private readonly ISitecoreContext _scContext;
        private readonly BaseCorePipelineManager _pipelineManager;

        public HorizonDataSourceResolverQueries(IHorizonItemHelper itemHelper, ISitecoreContext scContext, BaseCorePipelineManager pipelineManager)
        {
            _itemHelper = itemHelper;
            _scContext = scContext;
            _pipelineManager = pipelineManager;

            Name = "DataSourceResolverRoot";

            Field<NonNullGraphType<ContentInterfaceGraphType>>(
                name: "resolveDataSource",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "source",
                        Description = "Data source path"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "contextItemId",
                        Description = "Context Item Id"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "language",
                        Description = "Item language"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "site",
                        Description = "Site"
                    }
                ),
                resolve: ctx => ResolveDataSource(
                    source: ctx.GetNonEmptyStringArg("source"),
                    contextItemId: ctx.GetNonEmptyStringArg("contextItemId"),
                    language: ctx.GetNonEmptyStringArg("language"),
                    site: ctx.GetNonEmptyStringArg("site"),
                    queryContext: ctx.GetHorizonUserContext()
                ));
        }

        private Item ResolveDataSource(string source, string contextItemId, string language, string site, HorizonQueryContext queryContext)
        {
            _scContext.SetQueryContext(language: language, site: site);
            queryContext.HorizonOnlyItems = false;

            Item contextItem = _itemHelper.GetItem(contextItemId) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);

            var args = new ResolveRenderingDatasourceArgs(source);
            args.CustomData.Add("contextItem", contextItem);
            _pipelineManager.Platform().ResolveRenderingDataSource(args);

            return _itemHelper.GetItem(args.Datasource) ?? throw new HorizonGqlError(ItemErrorCode.InvalidDataSource);
        }
    }
}
