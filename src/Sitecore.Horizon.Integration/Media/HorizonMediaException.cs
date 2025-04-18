// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Horizon.Integration.Diagnostics;

namespace Sitecore.Horizon.Integration.Media
{
#pragma warning disable CA1064 // Exceptions should be public - we keep all our code internal
    internal class HorizonMediaException : Exception
    {
        public HorizonMediaException(MediaErrorCode errorCode)
        {
            ErrorCode = errorCode;
        }


        public HorizonMediaException(MediaErrorCode errorCode, Exception innerException) : base(errorCode.ToString(), innerException)
        {
            ErrorCode = errorCode;
        }
        private HorizonMediaException()
        {
        }

        private HorizonMediaException(string message) : base(message)
        {
        }


        public MediaErrorCode ErrorCode { get; }

        private HorizonMediaException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
