// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;

namespace Sitecore.Horizon.Integration.Items.Saving
{
    internal interface ISaveArgsBuilder
    {
        HorizonSaveItemArgs BuildSaveArgs(IReadOnlyCollection<SaveItemDetails> saveEntries);
    }
}
