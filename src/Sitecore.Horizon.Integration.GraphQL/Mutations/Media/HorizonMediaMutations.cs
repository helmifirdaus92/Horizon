// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Media.UploadMedia;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Media;
using Sitecore.Horizon.Integration.Media.Models;
using Sitecore.Horizon.Integration.Media.Validators;
using SysConvert = System.Convert;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Media
{
    internal class HorizonMediaMutations : ObjectGraphType
    {
        private readonly IHorizonMediaManager _mediaManager;
        private readonly ISitecoreContext _scContext;

        private readonly List<IValidateUploadMedia> _validations = new()
        {
            new ValidateMediaFileExtension(),
            new ValidateMediaFileSize(),
            new ValidateMediaContent()
        };

        public HorizonMediaMutations(ISitecoreContext scContext, IHorizonMediaManager mediaManager)
        {
            _scContext = scContext;
            _mediaManager = mediaManager;

            Name = "HorizonMediaMutations";

            Field<UploadMediaOutput>(
                "uploadMedia",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<UploadMediaInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<UploadMediaInput>("input");
                    var mediaItem = HandleUploadMediaRequest(input.FileName, input.Extension, input.Blob, input.DestinationFolderId, input.MediaId, input.Language, input.Site);

                    return new UploadMediaResult(mediaItem);
                });
        }

        MediaItem HandleUploadMediaRequest(string fileName, string extension, string blob, string destinationFolderId, string mediaId, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);
            MediaItem mediaItem;

            byte[]? blobBytes = null;
            try
            {
                blobBytes = SysConvert.FromBase64String(blob);
            }
            catch (FormatException)
            {
                throw new HorizonGqlError(MediaErrorCode.NotAMedia);
            }

            UploadMediaModel uploadMedia = new()
            {
                MediaId = mediaId,
                FileName = fileName,
                Extension = extension,
                Blob = blobBytes,
                DestinationFolderId = destinationFolderId,
                Language = Language.Parse(language)
            };

            foreach (IValidateUploadMedia validate in _validations.Where(validate => !validate.IsValid(uploadMedia)))
            {
                throw new HorizonGqlError(validate.ErrorCode);
            }

            try
            {
                mediaItem = _mediaManager.CreateMedia(uploadMedia);
            }

            catch (HorizonMediaException ex)
            {
                throw new HorizonGqlError(ex.ErrorCode, innerException: ex);
            }
            catch (Exception ex)
            {
                throw new HorizonGqlError(GenericErrorCodes.UnknownError, ex.Message, innerException: ex);
            }

            return mediaItem;
        }
    }
}
