// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Core.Abstractions.Rendering
{
    public interface IPageExtenderService
    {
        string AddPageExtenders(string html, string layout, string variant, Uri platformUrl);
    }
}
