// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Threading.Tasks;
using GraphQL;

namespace Sitecore.Horizon.Integration.GraphQL.Schema
{
    internal interface IHorizonSchema
    {
        Task<ExecutionResult> RunQuery(string? operationName, string query, Inputs inputs);
    }
}
