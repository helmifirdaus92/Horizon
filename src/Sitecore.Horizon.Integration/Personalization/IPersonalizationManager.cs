// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Personalization
{
    internal interface IPersonalizationManager
    {
        public void CleanupPersonalization(Item item, bool applyForSubitems);
        public void DeleteLayoutRules(Item item, string variantId);
    }
}
