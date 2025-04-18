// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields.Site;

public interface ISiteSettingsSection
{
    Dictionary<string, string> POS { get; set; }
    Dictionary<string, string> GetPosValues();
    void SetPosValues(Dictionary<string, string> posValues);
}
