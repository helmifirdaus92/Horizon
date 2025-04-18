// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Modes
{
    internal interface IHorizonModeHandlerResolver
    {
        IHorizonModeHandler? ResolveHandler(HeadlessMode mode);
    }
}
