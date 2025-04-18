// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.SetLayoutKind;
using Sitecore.Horizon.Integration.Items.Saving;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations
{
    internal interface IHorizonMutationHelper
    {
        void VerifyCanEditField(Item candidate, ID fieldId, bool allowFallback = false);

        SetLayoutEditingKindResult SetLayoutEditingKind(LayoutKind kind);
    }
}
