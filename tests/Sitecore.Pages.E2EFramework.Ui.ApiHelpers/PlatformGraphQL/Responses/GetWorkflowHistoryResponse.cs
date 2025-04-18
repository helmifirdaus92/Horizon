// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using System.Collections.Generic;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Responses;

public class GetWorkflowHistoryResponse
{
    public Workflow workflow;

    public class Workflow
    {
        public History history;
    }

    public class History
    {
        public List<WorkflowEventConnection> nodes;
    }
}
