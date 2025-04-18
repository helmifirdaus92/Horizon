// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Threading.Tasks;
using Sitecore.Horizon.Core.Model.Rendering;

namespace Sitecore.Horizon.Core.Abstractions.Rendering
{
    public interface IRenderingHostService
    {
        Task<RenderResult?> RenderLayout(Uri renderingHostEndpointUrl, string jssEditingSecret, string payloadJson);
    }
}
