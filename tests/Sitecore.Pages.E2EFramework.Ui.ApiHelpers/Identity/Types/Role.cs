// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity.Types;

public class Role
{
    public Role()
    {
        scope = "XMCloud";
        role = "User";
    }

    public string scope { get; set; }
    public string role { get; set; }
    public string organizationId { get; set; }
    public string tenantId { get; set; }
}
