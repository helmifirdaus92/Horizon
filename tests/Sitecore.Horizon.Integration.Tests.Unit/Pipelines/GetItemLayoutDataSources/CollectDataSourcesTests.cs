// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using AutoFixture;
using FluentAssertions;
using Sitecore.Abstractions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Layouts;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.GetItemLayoutDataSources
{
    public class CollectDataSourcesTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldThrowWhenRenderingsAreNotInitialized(
            CollectDataSources sut,
            GetItemLayoutDataSourcesArgs args)
        {
            // arrange
            args.Renderings = null;

            // act
            // assert
            sut.Invoking(x => x.Process(ref args)).Should().Throw<ArgumentNullException>();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldAggregateDataSourcesFromAllRenderings(
            TestCollectDataSources sut,
            GetItemLayoutDataSourcesArgs args,
            List<RenderingReference> renderings)
        {
            // arrange
            args.Renderings = renderings;
            args.DataSourceItems.Clear();

            // act
            sut.Process(ref args);

            // assert
            args.DataSourceItems.Should().HaveCount(args.Renderings.Count);
        }

        internal class TestCollectDataSources : CollectDataSources
        {
            private readonly IFixture _fixture;

            public TestCollectDataSources(BaseCorePipelineManager pipelineManager, IFixture fixture) : base(pipelineManager)
            {
                _fixture = fixture;
            }

            protected override ICollection<Item> ParseRenderingDataSources(Item item, string dataSource)
            {
                base.ParseRenderingDataSources(item, dataSource);

                return new[]
                {
                    _fixture.Create<Item>()
                };
            }
        }
    }
}
