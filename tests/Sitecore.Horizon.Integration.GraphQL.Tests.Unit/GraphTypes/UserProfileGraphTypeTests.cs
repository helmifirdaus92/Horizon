// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.AutoNSubstitute;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Security;
using Sitecore.Security.Accounts;
using Sitecore.Web.UI;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class UserProfileGraphTypeTests
    {
        [Fact]
        internal void ShouldThrowException_WhenThemeHelperIsNull()
        {
            // act & assert
            Invoking.Action(() => new UserProfileGraphType(null)).Should().Throw<ArgumentNullException>();
        }

        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(UserProfileGraphType sut, User user, [Substitute] UserProfile userProfile)
        {
            // arrange
            user.Configure().Profile.Returns(userProfile);

            // act & assert
            sut.Should().ResolveFieldValueTo("fqdn", user.DisplayName, c => c.WithSource(user));
            sut.Should().ResolveFieldValueTo("fullName", user.Profile.FullName, c => c.WithSource(user));
        }

        [Theory, AutoNData]
        internal void DisplayName_ShouldResolveToEmptyString_WhenProfileIsNull(UserProfileGraphType sut, User user)
        {
            // arrange
            user.Configure().Profile.ReturnsNull();

            // act & assert
            sut.Should().ResolveFieldValueTo("fullName", "", c => c.WithSource(user));
        }

        [Theory, AutoNData]
        internal void ResolvePortrait_ShouldResolveProfileIconUrlAndThemeInProperSize([Frozen] IThemeHelper themeHelper,
            UserProfileGraphType sut,
            User user,
            [Substitute] UserProfile profile,
            string portrait,
            string portraitUrl)
        {
            // arrange
            user.Configure().Profile.Returns(profile);
            profile.Configure().Portrait.Returns(portrait);
            themeHelper.MapTheme(portrait, ImageDimension.id32x32).Returns(portraitUrl);

            // act & assert
            sut.Should().ResolveFieldValueTo("profileIconUrl", portraitUrl, c => c.WithSource(user));
        }

        [Theory, AutoNData]
        internal void ResolvePortrait_ShouldResolveProfileIconUrlToNull_WhenProfileIsNull(UserProfileGraphType sut, User user)
        {
            // arrange
            user.Configure().Profile.ReturnsNull();

            // act & assert
            sut.Should().ResolveFieldValueTo("profileIconUrl", null, c => c.WithSource(user));
        }

        [Theory, AutoNData]
        internal void ResolvePortrait_ShouldResolveProfileIconUrlToNull_WhenPortraitIsEmpty(UserProfileGraphType sut, User user, [Substitute] UserProfile userProfile)
        {
            // arrange
            userProfile.Portrait.Returns("");
            user.Configure().Profile.Returns(userProfile);

            // act & assert
            sut.Should().ResolveFieldValueTo("profileIconUrl", null, c => c.WithSource(user));
        }
    }
}
