// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using FluentAssertions;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Layouts;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.GetItemLayoutDataSources
{
    public class ResolveRenderingsTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldNotRewriteAlreadySpecifiedRenderings(
            ResolveRenderings sut,
            GetItemLayoutDataSourcesArgs args,
            List<RenderingReference> renderings)
        {
            // arrange
            args.Renderings = renderings;

            // act
            sut.Process(ref args);

            // assert
            args.Renderings.Should().BeSameAs(renderings);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldInitializeRenderingsIfNotSpecified(
            TestResolveRenderings sut,
            FakeItem item,
            DeviceItem device)
        {
            // arrange
            item.WithField(FieldIDs.FinalLayoutField, LayoutField.EmptyValue);

            var args = GetItemLayoutDataSourcesArgs.Create(item, device);

            // act
            sut.Process(ref args);

            // assert
            sut.ReadRenderingsReceived.Should().BeTrue();
        }

        internal class TestResolveRenderings : ResolveRenderings
        {
            public bool ReadRenderingsReceived { get; private set; }

            protected override ICollection<RenderingReference> ReadRenderingsFromItem(Item item, DeviceItem device)
            {
                ReadRenderingsReceived = true;

                return base.ReadRenderingsFromItem(item, device);
            }
        }
    }
}
