// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.Media.Models;

namespace Sitecore.Horizon.Integration.Media.Validators;

internal interface IValidateUploadMedia
{
    public MediaErrorCode ErrorCode { get; set; }

    bool IsValid(UploadMediaModel uploadMedia);
}
