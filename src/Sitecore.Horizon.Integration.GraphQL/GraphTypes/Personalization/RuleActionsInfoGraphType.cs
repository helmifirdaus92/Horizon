// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes.Personalization
{
    internal record PersonalizationActionsInfo(string SetDatasourceActionId, string SetRenderingActionId, string HideRenderingActionId, string SetRenderingParametersActionId);

    internal class RuleActionsInfoGraphType : ObjectGraphType<PersonalizationActionsInfo>
    {
        public RuleActionsInfoGraphType()
        {
            Name = "RuleActionsInfo";

            Field<NonNullGraphType<StringGraphType>>(
                "setDatasourceActionId",
                resolve: ctx => ctx.Source.SetDatasourceActionId);

            Field<NonNullGraphType<StringGraphType>>(
                "setRenderingActionId",
                resolve: ctx => ctx.Source.SetRenderingActionId);

            Field<NonNullGraphType<StringGraphType>>(
                "setRenderingParametersActionId",
                resolve: ctx => ctx.Source.SetRenderingParametersActionId);

            Field<NonNullGraphType<StringGraphType>>(
                "hideRenderingActionId",
                resolve: ctx => ctx.Source.HideRenderingActionId);
        }
    }
}
