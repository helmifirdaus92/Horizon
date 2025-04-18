// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Media.UploadMedia
{
    internal record UploadMediaResult(MediaItem MediaItem);

    internal class UploadMediaOutput : ObjectGraphType<UploadMediaResult>
    {
        public UploadMediaOutput()
        {
            Name = "UploadMediaOutput";

            Field<NonNullGraphType<BooleanGraphType>>("success", resolve: _ => true);
            Field<NonNullGraphType<MediaItemGraphType>>("mediaItem", resolve: context => context.Source.MediaItem);
        }
    }
}
