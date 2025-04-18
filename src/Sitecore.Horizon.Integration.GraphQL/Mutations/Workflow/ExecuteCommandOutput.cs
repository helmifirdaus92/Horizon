// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Globalization;
using GraphQL.Types;
using Newtonsoft.Json;
using Sitecore.ExperienceEditor.Utils;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes.Validation;
using Sitecore.Horizon.Integration.Items.Workflow;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Workflow
{
    internal class ExecuteCommandOutput : ObjectGraphType<WorkflowCommandResult>
    {
        public ExecuteCommandOutput()
        {
            Name = "ExecuteCommandOutput";

            Field<NonNullGraphType<ContentInterfaceGraphType>>("item", resolve: ctx => ctx.Source.Item);
            Field<NonNullGraphType<BooleanGraphType>>("completed", resolve: context => context.Source.Completed);
            Field<NonNullGraphType<StringGraphType>>("nextStateId", resolve: context => context.Source.NextStateId);
            Field<StringGraphType>("error", resolve: context => context.Source.Error);
            Field<ListGraphType<ExecuteCommandOutput>>("datasourcesCommandResult", resolve: context => context.Source.DatasourcesCommandResult);
            Field<ValidationResultGraphType>("pageWorkflowValidationResult", resolve: context => context.Source.ValidationResult);
        }
    }
}
