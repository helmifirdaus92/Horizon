// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using Sitecore.Data.Items;
using Sitecore.Security.Accounts;

namespace Sitecore.Horizon.Integration.Items
{
    internal interface IItemPermissionChecker
    {
        bool CanWrite(Item item, User user);

        bool CanDelete(Item item, User user);

        bool CanRename(Item item, User user);

        bool CanCreate(Item item, User user);

        bool CanPublish(Item item, User user);

        bool CanUnlock(Item item, User user);

        bool CanWriteItemLanguage(Item item, User user);
    }
}
