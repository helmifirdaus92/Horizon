// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields.Site;

public class SiteSettingsSection : ISiteSettingsSection
{
    private readonly string _contextItemPath;
    private readonly HelperService _helperService;
    private readonly DatabaseType _contextDatabase;
    private readonly string posFieldName = "POS";

    public SiteSettingsSection(string contextItemPath, DatabaseType contextDatabase, HelperService helperService)
    {
        _contextItemPath = contextItemPath;
        _helperService = helperService;
        _contextDatabase = contextDatabase;
    }

    public Dictionary<string, string> POS { get; set; }

    public Dictionary<string, string> GetPosValues()
    {
        var value = _helperService.GetItemFieldValue(_contextItemPath, posFieldName, Database.Master);
        var pos = value.Split('&')
            .Select(a => a.Split('='))
            .ToDictionary(x => x[0], x => x[1]);
        return pos;
    }

    public void SetPosValues(Dictionary<string, string> posValues)
    {
        string value = "";
        if (posValues != null)
        {
            foreach (var pos in posValues)
            {
                value += pos.Key + "=" + pos.Value + "&";
            }

            value.TrimEnd('&');
        }

        _helperService.EditItem(_contextItemPath, posFieldName, value);
    }
}
