// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Types;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal record RenderingDefinitionInfo(IEnumerable<Item> DatasourceRootItems, IEnumerable<TemplateItem> Templates);

    internal class RenderingDefinitionGraphType : ObjectGraphType<RenderingDefinitionInfo>
    {
        public RenderingDefinitionGraphType()
        {
            Name = "RenderingDefinition";

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<RawItemGraphType>>>>(
                "datasourceRootItems",
                resolve: ctx => ctx.Source.DatasourceRootItems);

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<TemplateGraphType>>>>(
                "templates",
                resolve: ctx => ctx.Source.Templates);
        }
    }
}
