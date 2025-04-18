// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using GraphQL.Types;
using Sitecore.Workflows;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class WorkflowCommandGraphType : ObjectGraphType<WorkflowCommand>
    {
        public WorkflowCommandGraphType()
        {
            Name = "WorkflowCommand";


            Field<StringGraphType>(
                "id",
                resolve: context => new Guid(context.Source.CommandID)
            );

            Field<StringGraphType>(
                "displayName",
                resolve: context => context.Source.DisplayName
            );

            Field<StringGraphType>(
                "icon",
                resolve: context => context.Source.Icon
            );

            Field<BooleanGraphType>(
                "suppressComment",
                resolve: context => context.Source.SuppressComment
            );

            Field<BooleanGraphType>(
                "hasUI",
                resolve: context => context.Source.HasUI
            );
        }
    }
}
