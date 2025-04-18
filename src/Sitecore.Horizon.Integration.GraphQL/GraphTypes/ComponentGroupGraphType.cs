// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Pipelines.GetComponents;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class ComponentGroupGraphType : ObjectGraphType<ComponentGroup>
    {
        public ComponentGroupGraphType()
        {
            Name = "ComponentGroup";

            Field<NonNullGraphType<StringGraphType>>(
                "title",
                resolve: ctx => ctx.Source.Name);

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<ComponentInfoGraphType>>>>(
                "components",
                resolve: ctx => ctx.Source.Components);
        }
    }
}
