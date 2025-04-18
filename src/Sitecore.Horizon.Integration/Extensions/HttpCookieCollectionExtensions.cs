// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using System.Web;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Extensions
{
    /// <summary>
    /// The http cookie collection extensions.
    /// </summary>
    internal static class HttpCookieCollectionExtensions
    {
        /// <summary>
        /// Gets a cookie from the collection if one exists.
        /// Default response cookies getter create a new cookie if does not exist.
        /// </summary>
        /// <param name="collection">The cookie collection.</param>
        /// <param name="cookieName">The cookie name.</param>
        /// <returns>The cookie if there is one, null otherwise.</returns>
        public static HttpCookie? GetSafely(this HttpCookieCollection collection, string cookieName)
        {
            Assert.ArgumentNotNull(collection, nameof(collection));
            Assert.ArgumentNotNullOrEmpty(cookieName, nameof(cookieName));

            if (collection.AllKeys.Contains(cookieName))
            {
                return collection[cookieName];
            }

            return null;
        }
    }
}
