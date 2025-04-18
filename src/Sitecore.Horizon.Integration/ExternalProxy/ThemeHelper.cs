// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Resources;
using Sitecore.Web.UI;

namespace Sitecore.Horizon.Integration.ExternalProxy
{
    internal class ThemeHelper : IThemeHelper
    {
        public string MapTheme(string sourcePath, ImageDimension dimension)
        {
            return Images.GetThemedImageSource(sourcePath, dimension);
        }
    }
}
