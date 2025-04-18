// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Publishing
{
    internal class PublishItemInput : BaseItemInput
    {
        public PublishItemInput()
        {
            Name = "PublishItemInput";

            Field<NonNullGraphType<StringGraphType>>("itemId", "An ID of Item to Publish");
            Field<BooleanGraphType>("publishSubitems", "If set item publishes with sub items, otherwise only item publishes");
        }

        public string ItemId { get; set; }

        public bool PublishSubitems { get; set; } = false;
    }
}
