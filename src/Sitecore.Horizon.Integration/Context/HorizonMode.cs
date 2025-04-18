// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Integration.Context
{
    [Obsolete("use HeadlessMode instead")]
    internal enum HorizonMode
    {
        Disabled = 0,
        Editor = 1,
        Preview = 2,
        Api = 3,
    }
}
