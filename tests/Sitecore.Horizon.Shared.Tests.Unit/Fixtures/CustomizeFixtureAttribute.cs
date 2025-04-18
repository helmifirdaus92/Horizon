// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Shared.Tests.Unit.Fixtures
{
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
