// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Modes
{
    internal class HorizonModeHandlerResolver : IHorizonModeHandlerResolver
    {
        private readonly IEnumerable<IHorizonModeHandler> _handlers;

        public HorizonModeHandlerResolver(IEnumerable<IHorizonModeHandler> handlers)
        {
            _handlers = handlers;
        }

        public IHorizonModeHandler? ResolveHandler(HeadlessMode mode)
        {
            foreach (IHorizonModeHandler handler in _handlers)
            {
                if (handler.CanHandle(mode))
                {
                    return handler;
                }
            }

            return null;
        }
    }
}
