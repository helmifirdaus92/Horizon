// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.SetLayoutKind;

internal record SetLayoutEditingKindResult;

internal class SetLayoutEditingKindOutput : ObjectGraphType<SetLayoutEditingKindResult>
{
    public SetLayoutEditingKindOutput()
    {
        Name = "SetLayoutEditingKindOutput";

        Field<BooleanGraphType>("success", resolve: _ => true);
    }
}
