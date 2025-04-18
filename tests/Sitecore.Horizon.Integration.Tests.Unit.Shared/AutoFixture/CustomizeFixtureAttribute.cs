// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture
{
    /// <summary>
    ///     Specifies the Fixture customizations to for the xUnit theory test case.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class CustomizeFixtureAttribute : Attribute
    {
        public CustomizeFixtureAttribute(params Type[] customizations)
        {
            Customizations = customizations;
        }

        public Type[] Customizations { get; }
    }
}
