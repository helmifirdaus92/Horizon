// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Core.Abstractions.Rendering
{
    public interface IRelativeLinksTransformer
    {
        string ConvertToAbsolute(string renderingHost, string xmCloudHost, string html);
    }
}
