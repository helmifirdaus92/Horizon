// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Abstractions;
using Sitecore.Data.Items;
using Sitecore.Links;
using Sitecore.Links.UrlBuilders;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class MediaItemGraphType : ObjectGraphType<MediaItem>
    {
        private readonly BaseMediaManager _mediaManager;

        public MediaItemGraphType(BaseMediaManager mediaManager)
        {
            _mediaManager = mediaManager;

            Name = "MediaItem";

            Field<NonNullGraphType<StringGraphType>>(
                name: "id",
                resolve: ctx => ctx.Source.ID);

            Field<NonNullGraphType<StringGraphType>>(
                name: "displayName",
                resolve: ctx => ctx.Source.DisplayName);

            Field<NonNullGraphType<StringGraphType>>(
                name: "path",
                resolve: ctx => ctx.Source.MediaPath);

            Field<NonNullGraphType<StringGraphType>>(
                name: "parentId",
                resolve: ctx => ctx.Source.InnerItem.ParentID);

            Field<NonNullGraphType<StringGraphType>>(
                name: "url",
                resolve: ctx => BuildMediaUrl(ctx.Source));

            Field<NonNullGraphType<StringGraphType>>(
                name: "embedUrl",
                resolve: ctx => BuildEmbedUrl(ctx.Source));

            Field<NonNullGraphType<BooleanGraphType>>(
                name: "hasMediaStream",
                resolve: ctx => _mediaManager.HasMediaContent(ctx.Source));

            Field<StringGraphType>(
                name: "alt",
                resolve: ctx => GetValueOrNull(ctx.Source.Alt));

            Field<IntGraphType>(
                name: "width",
                resolve: ctx => ReadIntProperty(ctx.Source, "Width"));

            Field<IntGraphType>(
                name: "height",
                resolve: ctx => ReadIntProperty(ctx.Source, "Height"));

            Field<StringGraphType>(
                name: "dimensions",
                resolve: ctx => GetValueOrNull(ctx.Source.InnerItem["Dimensions"]));

            Field<IntGraphType>(
                name: "size",
                resolve: ctx => ctx.Source.Size);

            Field<StringGraphType>(
                name: "extension",
                resolve: ctx => GetValueOrNull(ctx.Source.Extension));

            Field<StringGraphType>(
                name: "mimeType",
                resolve: ctx => ctx.Source.MimeType);
        }

        private static string? GetValueOrNull(string? value) => !string.IsNullOrEmpty(value) ? value : null;

        private static int? ReadIntProperty(MediaItem item, string fieldName)
        {
            var rawValue = item.InnerItem[fieldName];
            if (int.TryParse(rawValue, out int value))
            {
                return value;
            }

            return null;
        }

        private string BuildMediaUrl(MediaItem item)
        {
            var options = MediaUrlBuilderOptions.GetShellOptions();

            options.DisableBrowserCache = true;

            options.Language = item.InnerItem.Language;
            options.LanguageEmbedding = LanguageEmbedding.Always;
            options.Version = item.InnerItem.Version;
            options.ItemRevision = item.InnerItem[FieldIDs.Revision];

            // Include absolute path, so that "site.VirtualPath" is included.
            // Later when the media request is made, context site is resolved to "shell".
            // That allows to skip query string signature validation when appending required parameters.
            options.AbsolutePath = true;

            return _mediaManager.GetMediaUrl(item, options).TrimStart('/');
        }

        private string BuildEmbedUrl(MediaItem mediaItem)
        {
            var options = MediaUrlBuilderOptions.GetShellOptions();

            options.Language = mediaItem.InnerItem.Language;

            var width = ReadIntProperty(mediaItem, "Width");
            var height = ReadIntProperty(mediaItem, "Height");

            if (width.HasValue)
            {
                options.Width = width.Value;
            }

            if (height.HasValue)
            {
                options.Height = height.Value;
            }

            return _mediaManager.GetMediaUrl(mediaItem, options).TrimStart('/');
        }
    }
}
