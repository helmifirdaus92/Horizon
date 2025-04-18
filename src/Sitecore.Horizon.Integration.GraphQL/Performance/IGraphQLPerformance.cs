// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Integration.GraphQL.Performance
{
    // This interface serves as an extension point for adding performance statistics for GraphQL queries.
    // It is implemented externally, typically within XMCloud assemblies, rather than Horizon assemblies.
    // Changes to the service setup should be carefully considered to avoid unintended exceptions.
    public interface IGraphQLPerformance
    {
        void AddQueryStats(string? operationName, string query, TimeSpan queryTime);
    }
}
