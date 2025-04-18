// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class ContentItemPermissionsGraphType : ObjectGraphType<Item>
    {
        public ContentItemPermissionsGraphType(IItemPermissionChecker permissionChecker, ISitecoreContext scContext)
        {
            Assert.ArgumentNotNull(permissionChecker, nameof(permissionChecker));
            Assert.ArgumentNotNull(scContext, nameof(scContext));

            Name = "ContentItemPermissions";

            Field<NonNullGraphType<BooleanGraphType>>("canWrite", resolve: ctx => permissionChecker.CanWrite(ctx.Source, scContext.User));
            Field<NonNullGraphType<BooleanGraphType>>("canWriteLanguage", resolve: ctx => permissionChecker.CanWriteItemLanguage(ctx.Source, scContext.User));
            Field<NonNullGraphType<BooleanGraphType>>("canDelete", resolve: ctx => permissionChecker.CanDelete(ctx.Source, scContext.User));
            Field<NonNullGraphType<BooleanGraphType>>("canRename", resolve: ctx => permissionChecker.CanRename(ctx.Source, scContext.User));
            Field<NonNullGraphType<BooleanGraphType>>("canCreate", resolve: ctx => permissionChecker.CanCreate(ctx.Source, scContext.User));
            Field<NonNullGraphType<BooleanGraphType>>("canPublish", resolve: ctx => permissionChecker.CanPublish(ctx.Source, scContext.User));
        }
    }
}
