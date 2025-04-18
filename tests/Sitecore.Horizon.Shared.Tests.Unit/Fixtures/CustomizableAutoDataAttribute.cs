// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Reflection;
using AutoFixture;
using AutoFixture.AutoNSubstitute;
using AutoFixture.Idioms;
using AutoFixture.Kernel;
using AutoFixture.Xunit2;
using Xunit.Sdk;

namespace Sitecore.Horizon.Shared.Tests.Unit.Fixtures
{
    [DataDiscoverer(typeName: "AutoFixture.Xunit2.NoPreDiscoveryDataDiscoverer", assemblyName: "AutoFixture.Xunit2")]
    [AttributeUsage(AttributeTargets.Method)]
    public abstract class CustomizableAutoDataAttribute : DataAttribute
    {
        private readonly Func<IFixture> _fixtureFactory;

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

                    // Put your common fixture customizations here.
                    fixture.Customize(new AutoNSubstituteCustomization
                    {
                        ConfigureMembers = true
                    });
                    fixture.Register((ISpecimenBuilder builder) => new GuardClauseAssertion(
                        builder,
                        new CompositeBehaviorExpectation(
                            new ExtendedNullReferenceBehaviorExpectation(),
                            new EmptyStringBehaviorExpectation())));

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
