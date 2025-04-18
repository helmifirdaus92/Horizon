// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using FluentAssertions;
using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.Schema;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture
{
    internal static class GqlExtensions
    {
        public static object ResolveFieldValue(this IComplexGraphType @this, string fieldName, Action<FieldResolveContext> contextConfig = null)
        {
            var field = @this.GetField(fieldName);
            field.Should().NotBeNull($"field '{fieldName}' should exist");

            var context = new FieldResolveContext();
            contextConfig?.Invoke(context);

            var ctx = new ResolveFieldContext
            {
                Source = context.Source,
                UserContext = context.QueryContext,
                Arguments = context.Arguments,
            };

            return field.Resolver.Resolve(ctx);
        }

        public static T ResolveFieldValue<T>(this IComplexGraphType @this, string fieldName, Action<FieldResolveContext> contextConfig = null)
        {
            var result = @this.ResolveFieldValue(fieldName, contextConfig);
            result.Should().BeAssignableTo<T>();
            return (T)result;
        }
    }

    internal record FieldResolveContext
    {
        public HorizonQueryContext QueryContext { get; set; } = new();
        public Dictionary<string, object> Arguments { get; } = new();
        public object Source { get; set; }

        public FieldResolveContext WithArg(string name, object value)
        {
            Arguments.Add(name, value);
            return this;
        }

        public FieldResolveContext WithArgs(params (string name, object value)[] args)
        {
            foreach (var (name, value) in args)
            {
                WithArg(name, value);
            }

            return this;
        }

        public FieldResolveContext WithLangAndSiteArgs(string language = "uk-UA", string site = "testSite")
        {
            return WithArg("language", language).WithArg("site", site);
        }

        public FieldResolveContext WithQueryContext(HorizonQueryContext queryContext)
        {
            QueryContext = queryContext;

            return this;
        }

        public FieldResolveContext WithSource(object source)
        {
            Source = source;

            return this;
        }
    }
}
