// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Runtime.Serialization;

namespace Sitecore.AuthoringHost.Configuration
{
    public class Auth0Configuration
    {
        public const string Key = "Auth0";
        public string Domain { get; set; } = default!;
        public string ClientId { get; set; } = default!;
        public string Audience { get; set; } = default!;

        [IgnoreDataMember]
        public string InternalAudience { get; set; } = default!;

        [IgnoreDataMember]
        public string WebAppAudience { get; set; } = default!;

        [IgnoreDataMember]
        public string PagesAudience { get; set; } = default!;
    }

    public class GenAiApiConfiguration
    {
        public const string Key = "GenAiApi";

#pragma warning disable CA1056 // Uri properties should not be strings
        public string? BaseUrl { get; set; }
#pragma warning restore CA1056 // Uri properties should not be strings
    }
}
