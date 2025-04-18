// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity;

public class AddMemberRolesRequest
{
    public AddMemberRolesRequest(Role role)
    {
        roles = new List<Role>()
        {
            role
        };
    }

    public List<Role> roles { get; set; }
}
