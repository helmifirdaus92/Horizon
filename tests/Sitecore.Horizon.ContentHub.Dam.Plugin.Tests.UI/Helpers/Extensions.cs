// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ContentHub;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.MediaDialogs.ImagesDialog;

namespace Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.Helpers
{
    public static class Extensions
    {
        public static ContentHubMediaProvider SwitchToContentHubProvider(this ImagesDialog mediaDialog)
        {
            var contentHubTab = mediaDialog.FindWebElement($"button[title='{Constants.MediaDialogProviders.ContentHub}']");
            contentHubTab.Click();
            contentHubTab.Driver.SwitchToFrame(Context.Horizon.Browser.FindElement("iframe.content-hub-dam-iframe"));
            return new ContentHubMediaProvider(contentHubTab.Driver.FindElement("div.main-content-wrapper"));
        }

        public static void SwitchToMediaLibraryProvider(this ImagesDialog mediaDialog)
        {
            var contentHubTab = mediaDialog.FindWebElement($"button[title='{Constants.MediaDialogProviders.MediaLibrary}']");
            contentHubTab.Click();
        }
    }
}
