// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Responses;

public class CreateSiteResponse
{
    public ScaffoldSolution scaffoldSolution { get; set; }

    public class ScaffoldSolution
    {
        public Job job { get; set; }
    }
}
