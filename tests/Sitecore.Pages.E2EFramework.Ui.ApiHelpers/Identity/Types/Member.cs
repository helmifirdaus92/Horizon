// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity.Types;

public class Member
{
    public List<Role> roles { get; set; }
    public string id { get; set; }
    public string email { get; set; }
    public bool emailVerified { get; set; }
    public DateTime created { get; set; }
    public DateTime updated { get; set; }
    public string lastLogin { get; set; }
    public bool signUpCompleted { get; set; }
    public object isExternal { get; set; }
    public string givenName { get; set; }
    public string familyName { get; set; }
    public string password { get; set; }
    public string nickName { get; set; }
    public string phoneNumber { get; set; }
    public string company { get; set; }
    public string jobRole { get; set; }
    public string preferredLanguage { get; set; }
    public List<OrganizationConsent> organizationConsents { get; set; }
}

public class OrganizationConsent
{
    public string organizationId { get; set; }
    public DateTime date { get; set; }
}
