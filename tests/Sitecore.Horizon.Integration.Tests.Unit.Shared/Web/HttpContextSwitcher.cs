// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Threading;
using System.Web;

namespace Sitecore.Horizon.Tests.Unit.Shared.Web
{
    public class HttpContextSwitcher : IDisposable
    {
        private readonly HttpContext _httpContext;
        private int _disposed;

        public HttpContextSwitcher(HttpContext httpContext)
        {
            _httpContext = HttpContext.Current;
            HttpContext.Current = httpContext;
        }

        public void Dispose()
        {
            int disposed = Interlocked.CompareExchange(ref _disposed, 1, 0);

            if (disposed == 0)
            {
                HttpContext.Current = _httpContext;
            }
        }
    }
}
