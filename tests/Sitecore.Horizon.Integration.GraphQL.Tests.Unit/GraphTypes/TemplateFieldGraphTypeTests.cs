// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Pipelines.GetRootSourceItems;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class TemplateFieldGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveIdField(TemplateFieldGraphType sut, TemplateFieldItem templateField)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("id", templateField.ID, c => c.WithSource(templateField));
        }

        [Theory, AutoNData]
        internal void ResolveSources_ShouldResolveSourcesField([Frozen] BaseCorePipelineManager pipelineManager,
            TemplateFieldGraphType sut,
            TemplateFieldItem templateField,
            Item contextItem,
            Item source)
        {
            // arrange
            var queryContext = new HorizonQueryContext
            {
                ContextItem = contextItem
            };

            pipelineManager.Platform().GetRootSourceItems(Arg.Do<GetRootSourceItemsArgs>(x =>
            {
                x.Result.Add(source);
            }));

            // act & assert
            var result = sut.ResolveFieldValue("sources", c => c.WithSource(templateField).WithQueryContext(queryContext));
            result.Should().Equals(new[]
            {
                source.ID
            });
        }

        [Theory, AutoNData]
        internal void ResolveSources_ShouldThrowException_WhenRootSourceItemsNotResolved([Frozen] BaseCorePipelineManager pipelineManager,
            TemplateFieldGraphType sut,
            TemplateFieldItem templateField,
            Item contextItem)
        {
            // arrange
            var queryContext = new HorizonQueryContext
            {
                ContextItem = contextItem
            };

            pipelineManager.Platform().GetRootSourceItems(Arg.Do<GetRootSourceItemsArgs>(_ => { }));

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue("sources", c => c.WithSource(templateField).WithQueryContext(queryContext)))
                .Should().Throw<HorizonGqlError>().WithErrorCode(ItemErrorCode.InvalidTemplateSource);
        }

        [Theory, AutoNData]
        internal void ResolveSources_ShouldResolveSourcesFieldToEmptyArray_WhenTemplateFieldSourceIsEmpty(
            TemplateFieldGraphType sut,
            TemplateFieldItem templateField)
        {
            // arrange
            templateField.Source = "";

            // act & assert
            sut.Should().ResolveFieldValueTo("sources", Array.Empty<ID>(), c => c.WithSource(templateField));
        }
    }
}
