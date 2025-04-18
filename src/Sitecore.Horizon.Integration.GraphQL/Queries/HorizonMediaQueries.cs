// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Media;

namespace Sitecore.Horizon.Integration.GraphQL.Queries
{
    internal class HorizonMediaQueries : ObjectGraphType
    {
        private readonly IHorizonMediaManager _mediaManager;
        private readonly IHorizonItemHelper _itemHelper;
        private readonly ISitecoreContext _scContext;

        public HorizonMediaQueries(IHorizonMediaManager mediaManager, IHorizonItemHelper itemHelper, ISitecoreContext scContext)
        {
            _mediaManager = mediaManager;
            _itemHelper = itemHelper;
            _scContext = scContext;

            // Doesn't matter, it's not really used.
            Name = "HorizonMediaRoot";

            Field<MediaItemGraphType>(
                name: "mediaItem",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "path",
                        Description = "Media item path or id"
                    },
                    new QueryArgument<NonNullGraphType<ListGraphType<NonNullGraphType<StringGraphType>>>>
                    {
                        Name = "sources",
                        Description = "Sources for the media items to retrieve."
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "language",
                        Description = "Media item language"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "site",
                    }
                ),
                resolve: ctx => GetMediaItem(
                    path: ctx.GetNonEmptyStringArg("path"),
                    sources: ctx.GetArgument<string[]>("sources"),
                    language: ctx.GetNonEmptyStringArg("language"),
                    site: ctx.GetNonEmptyStringArg("site")
                ));

            Field<MediaQueryResultGraphType>(
                "mediaQuery",
                arguments: new QueryArguments(
                    new QueryArgument<StringGraphType>
                    {
                        Name = "query",
                        Description = "Optional query used to search media items."
                    },
                    new QueryArgument<StringGraphType>
                    {
                        Name = "root",
                        Description = "Optional folder path for the media items to retrieve."
                    },
                    new QueryArgument<NonNullGraphType<ListGraphType<NonNullGraphType<StringGraphType>>>>
                    {
                        Name = "sources",
                        Description = "Sources for the media items to retrieve."
                    },
                     new QueryArgument<ListGraphType<NonNullGraphType<StringGraphType>>>
                     {
                         Name = "baseTemplateIds",
                         Description = "base templates of the media items to retrieve."
                     },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "language",
                        Description = "Media item language"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "site",
                    }
                ),
                resolve: ctx => QueryMedia(
                    query: ctx.GetArgument<string?>("query"),
                    root: ctx.GetArgument<string?>("root"),
                    sources: ctx.GetArgument<string[]>("sources"),
                    baseTemplateIds: ctx.GetArgument<string[]?>("baseTemplateIds"),
                    language: ctx.GetNonEmptyStringArg("language"),
                    site: ctx.GetNonEmptyStringArg("site")
                ));

            Field<MediaFolderItemGraphType>(
                name: "mediaFolderItem",
                arguments: new QueryArguments(
                    new QueryArgument<StringGraphType>
                    {
                        Name = "path",
                        Description = "Optional media folder item path or id"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "language",
                        Description = "Media folder item language"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "site",
                    }
                ),
                resolve: ctx => QueryMediaFolderItem(
                    path: ctx.GetArgument<string?>("path"),
                    language: ctx.GetNonEmptyStringArg("language"),
                    site: ctx.GetNonEmptyStringArg("site")
                ));

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<MediaFolderItemGraphType>>>>(
                name: "mediaFolderAncestors",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "path",
                        Description = "Media folder item path or id"
                    },
                    new QueryArgument<NonNullGraphType<ListGraphType<NonNullGraphType<StringGraphType>>>>
                    {
                        Name = "sources",
                        Description = "Root folders till the ancestors should be retrieved to."
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "language",
                        Description = "Media folder item language"
                    },
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "site",
                    }
                ),
                resolve: ctx => GetMediaFolderAncestors(
                    path: ctx.GetNonEmptyStringArg("path"),
                    sources: ctx.GetArgument<string[]>("sources"),
                    language: ctx.GetNonEmptyStringArg("language"),
                    site: ctx.GetNonEmptyStringArg("site")
                ));
        }

        private MediaItem GetMediaItem(string path, string[] sources, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            try
            {
                return _mediaManager.GetMediaItem(path, sources);
            }
            catch (HorizonMediaException ex)
            {
                throw new HorizonGqlError(ex.ErrorCode, innerException: ex);
            }
            catch (Exception ex)
            {
                throw new HorizonGqlError(GenericErrorCodes.UnknownError, ex.Message, innerException: ex);
            }
        }

        private MediaQueryResult QueryMedia(string? query, string? root, string[] sources, string[]? baseTemplateIds, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            try
            {
                return _mediaManager.QueryMedia(query, root, sources, baseTemplateIds);
            }
            catch (HorizonMediaException ex)
            {
                throw new HorizonGqlError(ex.ErrorCode, innerException: ex);
            }
            catch (Exception ex)
            {
                throw new HorizonGqlError(GenericErrorCodes.UnknownError, ex.Message, innerException: ex);
            }
        }

        private Item QueryMediaFolderItem(string? path, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            if (string.IsNullOrEmpty(path))
            {
                return _itemHelper.GetItem(ItemIDs.MediaLibraryRoot, ItemScope.MediaOnly) ?? throw new HorizonGqlError(GenericErrorCodes.UnknownError, "Media library root is not accessible");
            }

            try
            {
                return _mediaManager.GetMediaFolderItem(path!);
            }
            catch (HorizonMediaException ex)
            {
                throw new HorizonGqlError(ex.ErrorCode, innerException: ex);
            }
            catch (Exception ex)
            {
                throw new HorizonGqlError(GenericErrorCodes.UnknownError, ex.Message, innerException: ex);
            }
        }

        private IEnumerable<Item> GetMediaFolderAncestors(string path, string[] sources, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            try
            {
                return _mediaManager.GetMediaFolderAncestors(path, sources);
            }
            catch (HorizonMediaException ex)
            {
                throw new HorizonGqlError(ex.ErrorCode, innerException: ex);
            }
            catch (Exception ex)
            {
                throw new HorizonGqlError(GenericErrorCodes.UnknownError, ex.Message, innerException: ex);
            }
        }
    }
}
