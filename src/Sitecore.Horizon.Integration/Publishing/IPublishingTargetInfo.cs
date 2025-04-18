// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data;

namespace Sitecore.Horizon.Integration.Publishing
{
    internal interface IPublishingTargetInfo
    {
        Database[] GetTargetDatabases();
    }
}
