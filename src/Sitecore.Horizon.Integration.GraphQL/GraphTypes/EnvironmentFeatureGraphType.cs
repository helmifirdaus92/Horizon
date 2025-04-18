// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class EnvironmentFeatureGraphType: ObjectGraphType<KeyValuePair<string,bool>>
    {
        public EnvironmentFeatureGraphType()
        {
            Name = "EnvironmentFeature";

            Field<StringGraphType>("name", resolve: context => context.Source.Key);
            Field<BooleanGraphType>("enabled", resolve: context => context.Source.Value);
        }
    }
}
