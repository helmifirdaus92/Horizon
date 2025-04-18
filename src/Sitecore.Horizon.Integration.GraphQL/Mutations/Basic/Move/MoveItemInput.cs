// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Move
{
    internal class MoveItemInput : InputObjectGraphType
    {
        public MoveItemInput()
        {
            Name = "MoveItemInput";

            Field<NonNullGraphType<StringGraphType>>("site");
            Field<NonNullGraphType<StringGraphType>>("itemToMoveId");
            Field<NonNullGraphType<StringGraphType>>("targetId");
            Field<NonNullGraphType<MovePositionGraphType>>("position");
        }

        public string Site { get; set; }
        public string ItemToMoveId { get; set; }
        public string TargetId { get; set; }
        public MovePosition Position { get; set; }
    }
}
