// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Items.Saving;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class FieldValueGraphType : InputObjectGraphType<FieldValueInfo>
    {
        public FieldValueGraphType()
        {
            Name = "FieldValue";

            Field<StringGraphType>("id", resolve: ctx => ctx.Source.Id);
            Field<StringGraphType>("value", resolve: ctx => ctx.Source.Value);
            Field<StringGraphType>("originalValue", resolve: ctx => ctx.Source.OriginalValue);
            Field<BooleanGraphType>("reset", resolve: ctx => ctx.Source.Reset);
        }
    }
}
