// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using FluentAssertions;
using Sitecore.Horizon.Integration.Sites;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Sites;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Sites
{
    public class SiteFilteringSwitcherTests
    {
        [Theory]
        [InlineAutoNData(true, false)]
        [InlineAutoNData(false, true)]
        internal void ShouldSwitchFilteringWhenSiteIsNotNull(bool oldValue, bool disableFiltering, SiteContext site)
        {
            // arrange
            site.DisableFiltering = oldValue;

            // act
            bool actual;

            using (new SiteContextSwitcher(site))
            {
                using (new SiteFilteringSwitcher(disableFiltering))
                {
                    actual = Sitecore.Context.Site.DisableFiltering;
                }
            }

            // assert

            actual.Should().Be(disableFiltering);
            site.DisableFiltering.Should().Be(oldValue);
        }

        [Fact]
        internal void ShouldNotThrowWhenSiteIsNull()
        {
            // arrange
            Action action = () =>
            {
                Sitecore.Context.Site = null;
                using (new SiteFilteringSwitcher(disableFiltering: true))
                {
                }
            };


            // act
            // assert
            action.Should().NotThrow();
        }
    }
}
