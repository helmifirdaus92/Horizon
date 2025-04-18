// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Items.Saving;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class PresentationDetailsGraphType : InputObjectGraphType<PresentationDetailsInfo>
    {
        public PresentationDetailsGraphType()
        {
            Name = "PresentationDetails";

            Field<NonNullGraphType<EnumerationGraphType<LayoutKind>>>("kind", resolve: ctx => ctx.Source.Kind);
            Field<NonNullGraphType<StringGraphType>>("body", resolve: ctx => ctx.Source.Body);
        }
    }
}
