// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps;

namespace Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.Helpers
{
    public static class Context
    {
        public static Integration.Tests.Ui.Wrappers.Horizon Horizon;
        public static IHorizonApiHelper ApiHelper;
        public static Editor Editor;
        public static User User;
        public static ContentHub ContentHub;
    }
}
