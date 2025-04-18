// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Threading.Tasks;

namespace Sitecore.Horizon.Core.Abstractions.Rendering
{
    public interface IContentManagementService
    {
        Task<string?> GetPageLayout(Uri platformUrl, string layoutServiceConfig, string path);

        Task<string?> GetComponentLayout(Uri platformUrl, string layoutServiceConfig, string path);

        Task<string?> GetDictionaryInfo(Uri platformUrl, string layoutServiceConfig, string appName, string language);
    }
}
