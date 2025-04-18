// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.IO;
using System.Web;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Collections;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared.Web;
using Sitecore.Sites;
using Sitecore.Web;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.ExternalProxy
{
    [Collection(TestCollections.HttpContext)]
    public class SitecoreContextWrapperTests
    {
        [Theory]
        [AutoNData]
        internal void Site_ShouldDelegateToContext(SitecoreContextWrapperFixture sut, SiteContext site)
        {
            // arrange
            Sitecore.Context.Site = site;

            // act
            SiteContext actual = sut.Site;

            // assert
            actual.Should().BeSameAs(site);
        }

        [Theory]
        [AutoNData]
        internal void HttpContext_ShouldDelegateToContext(SitecoreContextWrapperFixture sut)
        {
            // arrange
            HttpContext httpContext = new HttpContext(new HttpRequest(string.Empty, "http://url/", string.Empty), new HttpResponse(new StringWriter()));

            // act
            HttpContextBase actual;
            HttpContextBase expected;
            using (new HttpContextSwitcher(httpContext))
            {
                actual = sut.HttpContext;
                expected = Sitecore.Context.HttpContext;
            }

            // assert
            actual.Request.RawUrl.Should().Be(expected.Request.RawUrl);
        }

        [Theory]
        [AutoNData]
        internal void GetData_ShouldDelegateToContext(SitecoreContextWrapperFixture sut, string key, string value)
        {
            // arrange
            Sitecore.Context.Items.Clear();
            Sitecore.Context.Items[key] = value;

            // act
            object actual = sut.GetData(key);

            // assert
            actual.Should().BeSameAs(value);
        }

        [Theory]
        [AutoNData]
        internal void SetData_ShouldDelegateToContext(SitecoreContextWrapperFixture sut, string key, string value)
        {
            // arrange
            Sitecore.Context.Items.Clear();

            // act
            sut.SetData(key, value);

            // assert
            Sitecore.Context.Items[key].Should().BeSameAs(value);
        }

        [Theory]
        [AutoNData]
        internal void EnablePreviewUnpublishableItems_ShouldDelegateToContext(SitecoreContextWrapperFixture sut, SiteContext site)
        {
            // act
            sut.EnablePreviewForUnpublishableItems(site);

            // assert
            site.PreviewUnpublishableItems.Should().BeTrue();
        }

        internal class SitecoreContextWrapperFixture : SitecoreContextWrapper
        {
            public SitecoreContextWrapperFixture(BaseAuthenticationManager authenticationManager, BaseFactory baseFactory, IHeadlessContextWrapper headlessContextWrapper) : base(authenticationManager, baseFactory, headlessContextWrapper)
            {
            }

            public override string ToString()
            {
                // to stop xunit read the object properties
                return nameof(SitecoreContextWrapper);
            }
        }
    }
}
