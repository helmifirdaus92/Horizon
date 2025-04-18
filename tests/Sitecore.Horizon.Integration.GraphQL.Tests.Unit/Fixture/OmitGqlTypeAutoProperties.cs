// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using System.Reflection;
using AutoFixture;
using AutoFixture.Kernel;
using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture
{
    internal class OmitGqlTypeAutoProperties : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Customizations.Insert(0, new Omitter(new IsGqlTypeSpecification()));
        }

        private class IsGqlTypeSpecification : IRequestSpecification
        {
            public bool IsSatisfiedBy(object request)
            {
                return request switch
                {
                    PropertyInfo {DeclaringType: var t} when IsGqlType(t) => true,
                    FieldInfo {DeclaringType: var t} when IsGqlType(t) => true,
                    _ => false
                };

                static bool IsGqlType(Type t) =>
                    t.GetInterfaces().Any(i => i == typeof(IGraphType));
            }
        }
    }
}
