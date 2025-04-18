// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Reflection;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions.Formatting;
using Xunit.Sdk;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture
{
    [AttributeUsage(AttributeTargets.Method)]
    public abstract class CustomizableAutoDataAttribute : DataAttribute
    {
        private readonly Func<IFixture> _fixtureFactory;

        static CustomizableAutoDataAttribute()
        {
            Formatter.AddFormatter(new CastleProxyFormatter());
        }

        public CustomizableAutoDataAttribute(Func<IFixture> fixtureFactory)
        {
            _fixtureFactory = fixtureFactory ?? throw new ArgumentNullException(nameof(fixtureFactory));
        }

        public override IEnumerable<object[]> GetData(MethodInfo testMethod)
        {
            var customizationsSource = testMethod.GetCustomAttribute<CustomizeFixtureAttribute>();
            var innerGenerator = new CustomizedAutoDataAttribute(_fixtureFactory, customizationsSource?.Customizations);

            return innerGenerator.GetData(testMethod);
        }

        private class CustomizedAutoDataAttribute : AutoDataAttribute
        {
            public CustomizedAutoDataAttribute(Func<IFixture> fixtureFactory, Type[] customizations)
                : base(() =>
                {
                    IFixture fixture = fixtureFactory();

                    if (customizations != null)
                    {
                        foreach (Type customization in customizations)
                        {
                            var instance = (ICustomization)Activator.CreateInstance(customization);
                            instance.Customize(fixture);
                        }
                    }

                    return fixture;
                })
            {
            }
        }
    }
}
