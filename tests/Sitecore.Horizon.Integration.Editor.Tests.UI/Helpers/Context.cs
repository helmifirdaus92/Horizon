// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Folder;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps.Templates;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.EdgeGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;

namespace Sitecore.Horizon.Integration.Editor.Tests.UI.Helpers
{
    public static class Context
    {
        public static Integration.Tests.Ui.Wrappers.Horizon Horizon;

        public static IHorizonApiHelper ApiHelper;

        public static Integration.Tests.Ui.Wrappers.Apps.Editor Editor;

        public static Preview Preview;

        public static User User;

        public static IPageItem Page;

        public static IPageItem ChildPage;

        public static IPageItem DatasourcePage;

        public static Dictionary<string, IPageItem> TestPages = new();
        public static Dictionary<string, IGenericItem> DsItems = new();

        public static IFolder Folder;

        public static IPageItem SiteStartItem;

        public static EdgeGraphQlClient EdgeGraphQlClient;

        public static GraphQlHorizon HorizonGraphQlClient;

        public static GraphQLPlatform PlatformGraphQlClient;

        public static PageTemplates PageTemplates;

        public static PageDesigns PageDesigns;

        public static PartialDesigns PartialDesigns;

        public static PartialDesignEditor PartialDesignEditor;

        public static PageDesignEditor PageDesignEditor;
        public static RenameDialog RenameDialog;
        public static CreateDialog CreateDialog;
        public static DeleteDialog DeleteDialog;
        public static void SetUserRoles(string emailAddress, List<string> roles)
        {
            var user = PlatformGraphQlClient.GetUsers().Find(u => u.profile.email.Equals(emailAddress));
            if (user != null)
            {
                PlatformGraphQlClient.UpdateUser(user.profile.userName, roles);
            }
        }
    }
}
