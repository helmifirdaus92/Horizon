// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Items;
using Sitecore.JavaScriptServices.Configuration;
using Sitecore.Sites;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class SiteGraphType : ObjectGraphType<SiteContext>
    {
        private const string PointOfSaleFieldName = "POS";
        private IConfigurationResolver? _configurationResolver;


        public SiteGraphType(IHorizonItemHelper itemHelper, IConfigurationResolver configurationResolver)
        {
            Assert.ArgumentNotNull(configurationResolver, nameof(configurationResolver));

            _configurationResolver = configurationResolver;

            Name = "Site";

            Field<NonNullGraphType<StringGraphType>>(
                "name",
                resolve: context => context.Source.Name
            );

            Field<ContentInterfaceGraphType>(
                "rootItem",
                arguments: new QueryArguments
                {
                    new QueryArgument<StringGraphType>
                    {
                        Name = "language",
                        Description = "Language of item to get. Site language used if not specified."
                    }
                },
                resolve: ctx =>
                {
                    using (new LanguageSwitcher(ctx.GetArgument<string?>("language") ?? ctx.Source.Language))
                    {
                        return itemHelper.GetItem(ctx.Source.RootPath);
                    }
                });

            Field<ContentInterfaceGraphType>(
                "startItem",
                arguments: new QueryArguments
                {
                    new QueryArgument<StringGraphType>
                    {
                        Name = "language",
                        Description = "Language of item to get. Site language used if not specified."
                    }
                },
                resolve: ctx =>
                {
                    using (new LanguageSwitcher(ctx.GetArgument<string?>("language") ?? ctx.Source.Language))
                    {
                        return itemHelper.GetItem(ctx.Source.StartPath);
                    }
                });

            Field<NonNullGraphType<StringGraphType>>(
                "startPath",
                resolve: context => context.Source.StartPath
            );

            Field<NonNullGraphType<StringGraphType>>(
                "rootPath",
                resolve: context => context.Source.RootPath
            );

            Field<NonNullGraphType<StringGraphType>>(
                "language",
                resolve: context => context.Source.Language
            );

            Field<NonNullGraphType<StringGraphType>>(
                "enableWebEdit",
                resolve: context => context.Source.EnableWebEdit
            );

            Field<StringGraphType>(
                "layoutServiceConfig",
                resolve: context =>
                {
                    Item? startItem = itemHelper.GetItem(context.Source.StartPath);
                    return _configurationResolver.ResolveForItem(startItem)?.LayoutServiceConfiguration;
                }
            );

            Field<StringGraphType>(
                "renderingEngineEndpointUrl",
                resolve: context =>
                {
                    Item? startItem = itemHelper.GetItem(context.Source.StartPath);
                    return _configurationResolver.ResolveForItem(startItem)?.ServerSideRenderingEngineEndpointUrl;
                }
            );

            Field<StringGraphType>(
                "renderingEngineApplicationUrl",
                resolve: context =>
                {
                    Item? startItem = itemHelper.GetItem(context.Source.StartPath);
                    return _configurationResolver.ResolveForItem(startItem)?.ServerSideRenderingEngineApplicationUrl;
                }
            );

            Field<StringGraphType>(
                "appName",
                resolve: context =>
                {
                    Item? startItem = itemHelper.GetItem(context.Source.StartPath);
                    return _configurationResolver.ResolveForItem(startItem)?.Name;
                }
            );

            Field<StringGraphType>(
                "pointOfSale",
                resolve: context => context.Source.Properties[PointOfSaleFieldName]);
        }
    }
}
