// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

#pragma warning disable CA1064 // Exceptions should be public - Do not expose API publicly

namespace Sitecore.Horizon.Integration.Items.Workflow
{
    internal class WorkflowCommandException : Exception
    {
        internal WorkflowCommandException(string message) : base(message)
        {
        }

        private WorkflowCommandException()
        {
        }

        private WorkflowCommandException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
