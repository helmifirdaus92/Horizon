// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.Idioms;

namespace Sitecore.Horizon.Shared.Tests.Unit.TestingUtils
{
    public static class GuardClauseAssertionExtensions
    {
        public static void VerifyMethod(this GuardClauseAssertion assertion, Type type, string methodName)
        {
            var methodInfo = type.GetMethod(methodName) ?? throw new ArgumentException("Method not found", nameof(methodName));

            assertion.Verify(methodInfo);
        }
    }
}
