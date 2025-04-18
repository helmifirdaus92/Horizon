// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel;
using System.Collections.Generic;
using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopPanel;

public class VersionActionsDialog
{
    private WebElement _versionActionsDialog;

    public VersionActionsDialog(WebElement versionActionsDialog)
    {
        _versionActionsDialog = versionActionsDialog;
    }

    public CreateVersion CreateVersion => new(_versionActionsDialog.FindElement("app-create-version"));
    public RenameVersion RenameVersion => new(_versionActionsDialog.FindElement("app-rename-version"));
    public DuplicateVersion DuplicateVersion => new(_versionActionsDialog.FindElement("app-duplicate-version"));

}
