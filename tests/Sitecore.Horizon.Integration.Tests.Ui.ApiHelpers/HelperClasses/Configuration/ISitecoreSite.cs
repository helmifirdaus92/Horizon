// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.File;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Configuration
{
    public interface ISitecoreSite
    {
        string Name { get; set; }
        string Language { get; set; }
        string StartItem { get; set; }
        GenericFile PatchFile { get; }
    }
}
