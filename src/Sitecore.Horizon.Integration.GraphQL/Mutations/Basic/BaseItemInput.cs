// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic
{
    internal abstract class BaseItemInput : InputObjectGraphType
    {
        protected BaseItemInput()
        {
            Name = "BaseItemInput";

            Field<NonNullGraphType<StringGraphType>>("language");
            Field<NonNullGraphType<StringGraphType>>("site");
        }

        public string Language { get; set; }

        public string Site { get; set; }
    }
}
