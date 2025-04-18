// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Items.Saving;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class SaveItemDetailsGraphType : InputObjectGraphType<SaveItemDetails>
    {
        public SaveItemDetailsGraphType()
        {
            Name = "SaveItemDetails";

            Field<StringGraphType>("itemId", resolve: ctx => ctx.Source.ItemId);
            Field<IntGraphType>("itemVersion", resolve: ctx => ctx.Source.ItemVersion);
            Field<StringGraphType>("revision", resolve: ctx => ctx.Source.Revision);
            Field<ListGraphType<FieldValueGraphType>>("fields", resolve: ctx => ctx.Source.Fields);
            Field<PresentationDetailsGraphType>("presentationDetails", resolve: ctx => ctx.Source.PresentationDetails);
            Field<PresentationDetailsGraphType>("originalPresentationDetails", resolve: ctx => ctx.Source.OriginalPresentationDetails);
        }
    }
}
