// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Items.Workflow;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class WorkflowStateGraphType : ObjectGraphType<ItemWorkflowInfo>
    {
        public WorkflowStateGraphType()
        {
            Name = "WorkflowState";

            Field<StringGraphType>(
                "id",
                resolve: context => context.Source.State.StateID
            );

            Field<StringGraphType>(
                "displayName",
                resolve: context => context.Source.State.DisplayName
            );

            Field<BooleanGraphType>(
                "finalState",
                resolve: context => context.Source.State.FinalState
            );

            Field<StringGraphType>(
                "icon",
                resolve: context => context.Source.State.Icon
            );

            Field<BooleanGraphType>(
                "canEdit",
                resolve: context => context.Source.CanEdit
            );

            Field<ListGraphType<WorkflowErrorGraphType>>(
                "warnings",
                resolve: context => context.Source.Warnings
            );

            Field<ListGraphType<WorkflowCommandGraphType>>(
                "commands",
                resolve: context => context.Source.Commands
            );
        }
    }
}
