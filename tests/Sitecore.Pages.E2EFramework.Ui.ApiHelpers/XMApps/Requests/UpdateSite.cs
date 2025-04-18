// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps.Requests;

public class UpdateSite
{
    public List<string> supportedLanguages { get; set; }
    public bool shared { get; set; }
}
