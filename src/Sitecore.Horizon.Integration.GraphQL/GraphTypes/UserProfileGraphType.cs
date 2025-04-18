// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using GraphQL.Types;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Security.Accounts;
using Sitecore.Web.UI;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class UserProfileGraphType : ObjectGraphType<User>
    {
        private readonly IThemeHelper _themeHelper;

        public UserProfileGraphType(IThemeHelper themeHelper)
        {
            _themeHelper = themeHelper ?? throw new ArgumentNullException(nameof(themeHelper));

            Name = "User";

            Field<NonNullGraphType<StringGraphType>>(
                "fqdn",
                resolve: ctx => ctx.Source.DisplayName);

            Field<NonNullGraphType<StringGraphType>>(
                "fullName",
                resolve: ctx => ctx.Source.Profile?.FullName ?? string.Empty);

            Field<StringGraphType>(
                "profileIconUrl",
                resolve: ctx => ResolvePortrait(ctx.Source));
        }

        private string? ResolvePortrait(User user)
        {
            var userProfile = user.Profile;
            if (userProfile != null && !string.IsNullOrEmpty(userProfile.Portrait))
            {
                return _themeHelper.MapTheme(userProfile.Portrait, ImageDimension.id32x32);
            }

            return null;
        }
    }
}
