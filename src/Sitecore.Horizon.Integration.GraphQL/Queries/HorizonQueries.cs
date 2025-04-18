// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using GraphQL.Types;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Integration.Sites;
using Sitecore.Sites;

namespace Sitecore.Horizon.Integration.GraphQL.Queries
{
    internal class HorizonQueries : ObjectGraphType
    {
        private readonly ISitecoreContext _scContext;
        private readonly IHorizonItemHelper _horizonItemHelper;
        private readonly ILanguageRepository _languageRepository;
        private readonly IHorizonSiteManager _siteRepository;

        public HorizonQueries(ISitecoreContext scContext, IHorizonItemHelper horizonItemHelper, ILanguageRepository languageRepository, IHorizonSiteManager siteRepository)
        {
            _scContext = scContext;
            _horizonItemHelper = horizonItemHelper;
            _languageRepository = languageRepository;
            _siteRepository = siteRepository;

            Name = "Root";

            Field<ContentInterfaceGraphType>(
                "item",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "path",
                        Description = "Item path or ID"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "language",
                        Description = "Item language"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "site",
                    },
                    new QueryArgument<IntGraphType>
                    {
                        Name = "version",
                        Description = "Item version"
                    },
                    new QueryArgument<BooleanGraphType>
                    {
                        Name = "enableItemFiltering",
                        Description = "Controls whether item filtering should be enabled. When enabled, non-publishable versions of item are omitted (default behavior).",
                        DefaultValue = true
                    }
                ),
                resolve: ctx => QueryItem(
                    path: ctx.GetNonEmptyStringArg("path"),
                    enableItemFiltering: ctx.GetArgument<bool>("enableItemFiltering"),
                    language: ctx.GetNonEmptyStringArg("language"),
                    site: ctx.GetNonEmptyStringArg("site"),
                    version: ctx.GetArgument<int?>("version"),
                    queryContext: ctx.GetHorizonUserContext()
                )
            );

            Field<RawItemGraphType>(
                "rawItem",
                description: "Information about item regardless item has presentation or not",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "path",
                        Description = "Item path or ID"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "language",
                        Description = "Item language"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "site"
                    },
                    new QueryArgument<BooleanGraphType>
                    {
                        Name = "enableItemFiltering",
                        Description = "Controls whether item filtering should be enabled. When enabled, non-publishable versions of item are omitted (default behavior).",
                        DefaultValue = true
                    }
                ),
                resolve: ctx => QueryRawItem(
                    path: ctx.GetNonEmptyStringArg("path"),
                    enableItemFiltering: ctx.GetArgument<bool>("enableItemFiltering"),
                    language: ctx.GetNonEmptyStringArg("language"),
                    site: ctx.GetNonEmptyStringArg("site"),
                    queryContext: ctx.GetHorizonUserContext()
                )
            );

            Field<ListGraphType<NonNullGraphType<SiteGraphType>>>(
                "sites",
                description: "Information about sites configured in Sitecore instance",
                arguments: new QueryArguments(
                    new QueryArgument<StringGraphType>
                    {
                        Name = "name",
                        Description = "Name of site to get"
                    },
                    new QueryArgument<BooleanGraphType>
                    {
                        Name = "enableItemFiltering",
                        Description = "Controls whether item filtering should be enabled. When enabled, non-publishable versions of item are omitted (default behavior).",
                        DefaultValue = true
                    }
                ),
                resolve: ctx => QuerySites(
                    siteName: ctx.GetArgument<string?>("name"),
                    enableItemFiltering: ctx.GetArgument<bool>("enableItemFiltering")
                )
            );
            Field<NonNullGraphType<ListGraphType<NonNullGraphType<LanguageGraphType>>>>(
                "languages",
                arguments: new QueryArguments(
                    new QueryArgument<StringGraphType>
                    {
                        Name = "site",
                        Description = "Name of site to get"
                    }
                ),
                resolve: _ => _languageRepository.GetLanguages(),
                description: "Information about languages configured in Sitecore instance"
            );

            Field<NonNullGraphType<UserProfileGraphType>>(
                "user",
                resolve: _ => _scContext.User,
                description: "Information about logged in user"
            );
        }

        private Item QueryItem(string path, bool enableItemFiltering, string language, string site, int? version, HorizonQueryContext queryContext)
        {
            _scContext.SetQueryContext(language, site, enableItemFiltering, _horizonItemHelper.DefaultDevice);

            Item? item = version.HasValue ? _horizonItemHelper.GetItem(path, Version.Parse(version)) : _horizonItemHelper.GetItem(path);

            if (item == null)
            {
                throw new HorizonGqlError(ItemErrorCode.ItemNotFound);
            }

            queryContext.ContextItem = item;
            queryContext.HorizonOnlyItems = true;

            return item;
        }

        private Item QueryRawItem(string path, bool enableItemFiltering, string language, string site, HorizonQueryContext queryContext)
        {
            _scContext.SetQueryContext(language, site, enableItemFiltering, _horizonItemHelper.DefaultDevice);

            var item = _horizonItemHelper.GetItem(path, ItemScope.AllRootsItem) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);

            queryContext.ContextItem = item;
            queryContext.HorizonOnlyItems = false;

            return item;
        }

        private IEnumerable<SiteContext> QuerySites(string? siteName, bool enableItemFiltering)
        {
            _scContext.SetQueryContext(enableItemFiltering: enableItemFiltering, deviceItem: _horizonItemHelper.DefaultDevice);

            return string.IsNullOrEmpty(siteName)
                ? _siteRepository.GetAllSites(includeSystemSites: false)
                : _siteRepository.GetSiteByName(siteName!) is { } site
                    ? new[]
                    {
                        site
                    }
                    : Enumerable.Empty<SiteContext>();
        }
    }
}
