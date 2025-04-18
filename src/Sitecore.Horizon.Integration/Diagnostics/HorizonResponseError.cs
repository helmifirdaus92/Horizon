// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Diagnostics
{
    internal abstract class HorizonResponseError<T> where T : Enum
    {
        protected HorizonResponseError(T errorCode)
        {
            ErrorCode = errorCode;
        }

        protected HorizonResponseError(T errorCode, string message) : this(errorCode)
        {
            Assert.ArgumentNotNullOrEmpty(message, nameof(message));

            Message = message;
        }

        [JsonConverter(typeof(StringEnumConverter))]
        public T ErrorCode { get; }

        public string? Message { get; }
    }
}
