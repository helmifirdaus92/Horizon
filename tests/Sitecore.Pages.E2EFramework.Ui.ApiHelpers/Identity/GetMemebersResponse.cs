// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity;

public class GetMembersResponse
{
    public int pageNumber { get; set; }
    public int pageLength { get; set; }
    public int totalRecords { get; set; }
    public List<Member> data { get; set; }
}
