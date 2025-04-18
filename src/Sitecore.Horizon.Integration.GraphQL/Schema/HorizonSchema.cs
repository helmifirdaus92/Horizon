// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using GraphQL;
using GraphQL.Types;
using Microsoft.Extensions.DependencyInjection;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.GraphQL.Configuration;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Media;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Publishing;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Workflow;
using Sitecore.Horizon.Integration.GraphQL.Performance;
using Sitecore.Horizon.Integration.GraphQL.Queries;

namespace Sitecore.Horizon.Integration.GraphQL.Schema
{
#pragma warning disable CA1001 // Schema is never disposed

    internal class HorizonSchema : IHorizonSchema
    {
        private readonly global::GraphQL.Types.Schema _schema;

        private IGraphQLPerformance? _performance;

        public HorizonSchema(

            // Queries
            HorizonQueries basicQueries,
            HorizonComponentQueries componentQueries,
            HorizonConfigurationQueries configurationQueries,
            HorizonDataSourceResolverQueries dataSourceResolverQueries,
            HorizonMediaQueries mediaQueries,
            HorizonPublishingQueries publishingQueries,
            HorizonRenderingDefinitionQueries renderingDefinitionQueries,
            HorizonPersonalizationQueries personalizationQueries,

            // Mutations
            HorizonBasicMutations basicMutations,
            HorizonPublishingMutations publishingMutations,
            HorizonWorkflowMutations workflowMutations,
            HorizonMediaMutations mediaMutations,

            // System
            BaseSettings settings,
            IDependencyResolver dependencyResolver,
            IEnumerable<IHorizonSchemaExtender> schemaExtenders,
            IServiceProvider serviceProvider
        )
        {
            ShowDetailedErrors = settings.HorizonGql().ShowDetailedErrors;

            _schema = new global::GraphQL.Types.Schema(dependencyResolver)
            {
                Query = CreateRootQuery(
                    basicQueries,
                    componentQueries,
                    configurationQueries,
                    dataSourceResolverQueries,
                    mediaQueries,
                    publishingQueries,
                    renderingDefinitionQueries,
                    personalizationQueries),
                Mutation = CreateRootMutation(
                    basicMutations,
                    publishingMutations,
                    workflowMutations,
                    mediaMutations
                )
            };

            _schema.RegisterType<ItemGraphType>();
            _schema.RegisterType<PageGraphType>();
            _schema.RegisterType<FolderGraphType>();

            _schema.RegisterType<ItemTemplateGraphType>();
            _schema.RegisterType<BranchTemplateGraphType>();

            foreach (var extender in schemaExtenders)
            {
                extender.ExtendSchema(_schema);
            }

            _performance = serviceProvider.GetService<IGraphQLPerformance>();
        }

        private bool ShowDetailedErrors { get; }

        public async Task<ExecutionResult> RunQuery(string? operationName, string query, Inputs inputs)
        {
            var sw = Stopwatch.StartNew();

            var executor = new DocumentExecuter();
            var result = await executor
                .ExecuteAsync(new ExecutionOptions
                {
                    Schema = _schema,
                    OperationName = operationName,
                    Query = query,
                    Inputs = inputs,
                    UserContext = new HorizonQueryContext(),
                    ExposeExceptions = ShowDetailedErrors
                })
                .ConfigureAwait(false);

            if (_performance != null)
            {
                _performance.AddQueryStats(operationName, query, sw.Elapsed);
            }

            return result;
        }

        private IObjectGraphType CreateRootQuery(params ObjectGraphType[] fieldSources)
        {
            var result = new ObjectGraphType
            {
                Name = "Query"
            };

            foreach (var rootField in fieldSources.SelectMany(x => x.Fields))
            {
                result.AddField(rootField);
            }

            return result;
        }

        private IObjectGraphType CreateRootMutation(params ObjectGraphType[] fieldSources)
        {
            var result = new ObjectGraphType
            {
                Name = "Mutation"
            };
            foreach (var rootField in fieldSources.SelectMany(x => x.Fields))
            {
                result.AddField(rootField);
            }

            return result;
        }
    }
}
