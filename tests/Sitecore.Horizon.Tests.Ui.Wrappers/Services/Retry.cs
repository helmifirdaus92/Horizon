// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Threading;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services
{
    public static class Retry
    {
        public static void Perform(
            Func<bool> actAndReturnResult,
            int maxAttemptCount = 3,
            int retryIntervalMs = 100)
        {
            int attempted = 0;
            while (attempted < maxAttemptCount)
            {
                if (actAndReturnResult()) { return; }

                Thread.Sleep(retryIntervalMs);
                Logger.WriteLineWithTimestamp("The validation failed. Action non successful. Trying again...");
                attempted++;
            }

            throw new Exception($"Action failed after {maxAttemptCount} attempts");
        }
    }
}
