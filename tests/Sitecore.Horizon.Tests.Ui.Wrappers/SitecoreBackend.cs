// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers
{
    public class SitecoreBackend
    {
        public SitecoreBackend(Horizon horizon)
        {
            Horizon = horizon;
        }

        private Horizon Horizon { get; }

        public Editor OpenHorizonApp()
        {
            new LaunchPad().Shortcuts["Horizon"].Click();
            Horizon.Editor.WaitForNewPageInCanvasLoaded();
            return Horizon.Editor;
        }
    }
}
