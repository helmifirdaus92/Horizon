// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using Sitecore.Web.UI;

namespace Sitecore.Horizon.Integration.ExternalProxy
{
    internal interface IThemeHelper
    {
        string MapTheme(string sourcePath, ImageDimension dimension);
    }
}
