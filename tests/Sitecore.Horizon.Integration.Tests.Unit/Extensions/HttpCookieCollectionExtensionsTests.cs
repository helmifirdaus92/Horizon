// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using FluentAssertions;
using Sitecore.Horizon.Integration.Extensions;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Extensions
{
    public class HttpCookieCollectionExtensionsTests
    {
        [Theory]
        [AutoNData]
        internal void GetSafely_ShouldReturnCookieIfExists(
            HttpCookieCollection collection,
            string name,
            string value)
        {
            // arrange
            collection.Add(new HttpCookie(name, value));

            // act
            HttpCookie httpCookie = collection.GetSafely(name);

            // assert
            httpCookie.Should().NotBeNull();
            httpCookie.Value.Should().Be(value);
        }

        [Theory]
        [AutoNData]
        internal void GetSafely_ShouldReturnNullIfNotExists(
            HttpCookieCollection collection,
            string name,
            string value)
        {
            // arrange

            // act
            HttpCookie httpCookie = collection.GetSafely(name);

            // assert
            httpCookie.Should().BeNull();
        }
    }
}
