// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields;

public class EditorOptionsSection : IEditorOptionsSection
{
    private readonly string _contextItemPath;
    private readonly DatabaseType _contextDatabase;
    private readonly HelperService _helperService;
    private readonly string _compatibleRenderings = "Compatible Renderings";

    public EditorOptionsSection(string contextItemPath, DatabaseType contextDatabase, HelperService helperService)
    {
        _contextItemPath = contextItemPath;
        _contextDatabase = contextDatabase;
        _helperService = helperService;
    }
    public void AddToCompatibleRenderingsList(List<string> renderingIds)
    {
        _helperService.EditItem(_contextItemPath, _compatibleRenderings, string.Join("|", renderingIds), (Database)_contextDatabase);
    }

    public ICollection<string> GetCompatibleRenderingsList()
    {
        return _helperService.GetItemFieldValue(_contextItemPath, _compatibleRenderings, (Database)_contextDatabase).Split('|').ToList();
    }
}
