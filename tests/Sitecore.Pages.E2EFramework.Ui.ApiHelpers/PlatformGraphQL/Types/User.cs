// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Security.Policy;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;

public class User
{
    public string name { get; set; }
    public UserProfile profile { get; set; }

    public class UserProfile
    {
        public string userName { get; set; }
        public string email { get; set; }
        public bool isAdministrator { get; set; }
    }
}
