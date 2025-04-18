// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections;
using System.Linq;
using FluentAssertions;
using FluentAssertions.Common;
using FluentAssertions.Execution;
using FluentAssertions.Primitives;
using FluentAssertions.Specialized;
using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture
{
    internal static class AssertionExtensions
    {
        public static GraphTypeAssertions Should(this IComplexGraphType actualValue) =>
            new GraphTypeAssertions(actualValue);

        public static void WithErrorCode<TCode>(this ExceptionAssertions<HorizonGqlError> @this, TCode code) where TCode : Enum
        {
            @this.Which.Code.Should().Be(code.ToString());
        }

        public static void WithErrorCode(this ExceptionAssertions<HorizonGqlError> @this, string code)
        {
            @this.Which.Code.Should().Be(code);
        }

        public class GraphTypeAssertions : ReferenceTypeAssertions<IComplexGraphType, GraphTypeAssertions>
        {
            public GraphTypeAssertions(IComplexGraphType subject)
            {
                Subject = subject;
            }

            protected override string Identifier => "graphType";

            [CustomAssertion]
            public AndWhichConstraint<GraphTypeAssertions, FieldType> HaveField(string name, Type type)
            {
                Execute.Assertion
                    .WithDefaultIdentifier(Identifier)
                    .ForCondition(Subject.HasField(name))
                    .FailWith("Expected {context}.HasField({0}) to return \"True\", but \"False\" was returned.", name);

                FieldType field = Subject.GetField(name);
                Execute.Assertion
                    .WithDefaultIdentifier(Identifier)
                    .ForCondition(field != null)
                    .FailWith("Expected {context} to have field {0}", name);

                Execute.Assertion
                    .ForCondition(field.Name.Equals(name, StringComparison.Ordinal))
                    .FailWith("Expected {context}.GetField({0}) to have {0} name, but actual name is {1}", name, field.Name);

                Execute.Assertion
                    .ForCondition(field.Type == type)
                    .FailWith("Expected {context}.GetField({0}) to have type {1}, but actual type is {2}", name, type, field.Type);

                return new AndWhichConstraint<GraphTypeAssertions, FieldType>(this, field);
            }

            [CustomAssertion]
            public void ResolveFieldValueTo(string fieldName, object expectedValue, Action<FieldResolveContext> contextConfig = null)
            {
                var actualValue = Subject.ResolveFieldValue(fieldName, contextConfig);
                Execute.Assertion
                    .ForCondition(actualValue.IsSameOrEqualTo(expectedValue))
                    .FailWith("Expected field {0} to have value {1}, but actual value is {2}", fieldName, expectedValue, actualValue);
            }


            public void ResolveListFieldValueTo(string fieldName, object expectedValue, Action<FieldResolveContext> contextConfig = null)
            {
                var actualValue = Subject.ResolveFieldValue(fieldName, contextConfig);

                if (expectedValue is IEnumerable expected && actualValue is IEnumerable actual)
                {
                    bool listsEqual = expected.Cast<object>().SequenceEqual(actual.Cast<object>());

                    if (listsEqual)
                    {
                        return; 
                    }
                }

                Execute.Assertion
                    .ForCondition(false)
                    .FailWith("Expected field {0} to have value {1}, but actual value is {2}", fieldName, expectedValue, actualValue);
            }
        }
    }
}
