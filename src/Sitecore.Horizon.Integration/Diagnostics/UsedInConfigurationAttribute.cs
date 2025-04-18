// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics;

namespace Sitecore.Horizon.Integration.Diagnostics
{
    /// <summary>
    ///   Indicates that current class is referenced in config.
    ///   If you change type namespace or name, ensure to update configuration.
    /// </summary>
    [AttributeUsage(AttributeTargets.All)]
    [Conditional("DEBUG")]
    internal sealed class UsedInConfigurationAttribute : Attribute
    {
    }
}
