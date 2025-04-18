// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.ExternalProxy
{
    /// <summary>
    /// Use this interface ONLY for settings which could not be accessed through BaseSettings class
    /// </summary>
    internal interface ISitecoreLegacySettings
    {
        bool PublishingEnabled { get; }
    }
}
