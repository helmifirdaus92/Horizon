// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Specialized;
using System.Web;
using AutoFixture;
using NSubstitute;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class WorkaroundForDotCoverFailWithHttpContextBase : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            //BUG: workaround for fail under DotCover session when HttpContextBase mocks are used
            fixture.Register(() =>
            {
                var context = Substitute.For<HttpContextBase>();
                context.Request.QueryString.Returns(new NameValueCollection());
                context.Request.Cookies.Returns(new HttpCookieCollection());

                context.Response.Cookies.Returns(new HttpCookieCollection());
                context.Response.Headers.Returns(new NameValueCollection());

                return context;
            });
        }
    }
}
