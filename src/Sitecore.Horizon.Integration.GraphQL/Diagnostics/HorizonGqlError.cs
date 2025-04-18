// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using GraphQL;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem;

namespace Sitecore.Horizon.Integration.GraphQL.Diagnostics
{
    internal class HorizonGqlError : ExecutionError
    {
        public HorizonGqlError(GenericErrorCodes errCode, string? msg = null, Exception? innerException = null)
            : base(msg ?? errCode.ToString(), innerException)
        {
            Code = errCode.ToString();
        }

        public HorizonGqlError(ItemErrorCode errCode, string? msg = null, Exception? innerException = null)
            : base(msg ?? errCode.ToString(), innerException)
        {
            Code = errCode.ToString();
        }

        public HorizonGqlError(MediaErrorCode errCode, string? msg = null, Exception? innerException = null)
            : base(msg ?? errCode.ToString(), innerException)
        {
            Code = errCode.ToString();
        }

        public HorizonGqlError(MoveItemErrorCode errCode, string? msg = null, Exception? innerException = null)
            : base(msg ?? errCode.ToString(), innerException)
        {
            Code = errCode.ToString();
        }

        public HorizonGqlError(string errCode, string errMessage, Exception? innerException = null)
            : base(errMessage, innerException)
        {
            Code = errCode;
        }

        private HorizonGqlError() : this(GenericErrorCodes.UnknownError, "Unknown error")
        {
        }

        private HorizonGqlError(string message)
            : this(GenericErrorCodes.UnknownError, message)
        {
        }

        private HorizonGqlError(string message, Exception innerException)
            : this(GenericErrorCodes.UnknownError, message, innerException)
        {
        }
    }
}
