// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using NSubstitute;
using NSubstitute.Core;

namespace Sitecore.Horizon.Tests.Unit.Shared
{
    public static class CustomNSubstituteExtensions
    {
        public static ConfiguredCall ReturnsFalse(this bool value)
        {
            return value.Returns(false);
        }

        public static ConfiguredCall ReturnsTrue(this bool value)
        {
            return value.Returns(true);
        }
    }
}
