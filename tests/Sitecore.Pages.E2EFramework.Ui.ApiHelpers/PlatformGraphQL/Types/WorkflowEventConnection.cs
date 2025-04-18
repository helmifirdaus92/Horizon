// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;

public class WorkflowEventConnection
{
    public List<string> comments;
    public WorkflowState newState;
    public WorkflowState oldState;
    public string user;
    public class WorkflowState
    {
        public string displayName;
    }
}
