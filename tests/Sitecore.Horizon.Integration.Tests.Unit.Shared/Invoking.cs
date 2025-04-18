// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Tests.Unit.Shared
{
    public static class Invoking
    {
        /// <summary>
        /// Helper to write chain like Invoking.Action(...).Should()..
        /// </summary>
        public static Action Action(Action action)
        {
            return action;
        }
    }
}
