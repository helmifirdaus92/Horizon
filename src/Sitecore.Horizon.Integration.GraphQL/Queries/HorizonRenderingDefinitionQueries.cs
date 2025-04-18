// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using GraphQL.Types;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Pipelines.GetRenderingDatasource;

namespace Sitecore.Horizon.Integration.GraphQL.Queries
{
    internal class HorizonRenderingDefinitionQueries : ObjectGraphType
    {
        private readonly ISitecoreContext _scContext;
        private readonly IHorizonItemHelper _itemHelper;
        private readonly BaseCorePipelineManager _pipelineManager;

        public HorizonRenderingDefinitionQueries(ISitecoreContext scContext, IHorizonItemHelper itemHelper, BaseCorePipelineManager pipelineManager)
        {
            _scContext = scContext;
            _itemHelper = itemHelper;
            _pipelineManager = pipelineManager;
            Name = "RenderingDefinitionRoot";

            Field<RenderingDefinitionGraphType>(
                name: "renderingDefinition",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "path",
                        Description = "Rendering definition Item path or id"
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
                    }
                ),
                resolve: ctx => GetRenderingDefinition(
                    path: ctx.GetNonEmptyStringArg("path"),
                    contextItemId: ctx.GetNonEmptyStringArg("contextItemId"),
                    language: ctx.GetNonEmptyStringArg("language"),
                    site: ctx.GetNonEmptyStringArg("site"),
                    queryContext: ctx.GetHorizonUserContext()
                ));
        }

        private RenderingDefinitionInfo GetRenderingDefinition(string path, string contextItemId, string language, string site, HorizonQueryContext queryContext)
        {
            _scContext.SetQueryContext(language: language, site: site);
            queryContext.HorizonOnlyItems = false;

            Item renderingItem = _itemHelper.GetItem(path, ItemScope.LayoutOnly) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);
            Item contextItem = _itemHelper.GetItem(contextItemId) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);

            var renderingDataSource = GetRenderingDatasource(renderingItem, _scContext.Database, contextItem);

            List<TemplateItem> templates = renderingDataSource.TemplatesForSelection.Select(x => _scContext.Database.Templates[x.ID]).ToList();

            // GetRenderingDatasource pipeline does not add branch template so we add it manually
            if (renderingDataSource.Prototype?.TemplateID == TemplateIDs.BranchTemplate)
            {
                templates.Add(new TemplateItem(renderingDataSource.Prototype));
            }

            return new RenderingDefinitionInfo(
                renderingDataSource.DatasourceRoots,
                templates
            );
        }

        private GetRenderingDatasourceArgs GetRenderingDatasource(Item renderingItem, Database contentDatabase, Item contextItem)
        {
            var getRenderingDataSourceArgs = new GetRenderingDatasourceArgs(renderingItem, contentDatabase)
            {
                ContextItemPath = contextItem.Paths.FullPath,
                ContentLanguage = contextItem.Language
            };

            _pipelineManager.Platform().GetRenderingDatasource(getRenderingDataSourceArgs);

            return getRenderingDataSourceArgs;
        }
    }
}
