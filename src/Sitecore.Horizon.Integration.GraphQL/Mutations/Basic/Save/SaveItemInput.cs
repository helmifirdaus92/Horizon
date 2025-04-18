// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.Items.Saving;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Save
{
    internal class SaveItemInput : BaseItemInput
    {
        public SaveItemInput()
        {
            Name = "SaveItemInput";

            Field<ListGraphType<SaveItemDetailsGraphType>>("items");
        }

        public IReadOnlyCollection<SaveItemDetails>? Items { get; set; }
    }
}
