// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class ExtendedPropertiesGraphType : ObjectGraphType<KeyValuePair<string, string>>
    {
        public ExtendedPropertiesGraphType()
        {
            Name = "ExtendedProperties";

            Field<StringGraphType>("name", resolve: context => context.Source.Key);
            Field<StringGraphType>("value", resolve: context => context.Source.Value);
        }
    }
}
