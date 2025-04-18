// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.GraphQL.Schema
{
    internal interface IHorizonSchemaExtender
    {
        void ExtendSchema(global::GraphQL.Types.Schema schema);
    }
}
