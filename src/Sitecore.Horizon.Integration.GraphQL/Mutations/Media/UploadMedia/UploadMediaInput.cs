// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

#nullable disable warnings

using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Media.UploadMedia
{
    internal class UploadMediaInput : BaseItemInput
    {
        public UploadMediaInput()
        {
            Name = "UploadMediaInput";

            Field<NonNullGraphType<StringGraphType>>("fileName");
            Field<NonNullGraphType<StringGraphType>>("extension");
            Field<NonNullGraphType<StringGraphType>>("blob");
            Field<StringGraphType>("destinationFolderId");
            Field<StringGraphType>("mediaId");
        }

        public string FileName { get; set; }

        public string Extension { get; set; }

        public string Blob { get; set; }

        public string DestinationFolderId { get; set; } = string.Empty;

        public string MediaId { get; set; } = string.Empty;
    }
}
