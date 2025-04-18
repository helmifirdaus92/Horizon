// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.BuildHorizonPageExtenders
{
    public class AddHorizonEditorExtendersTests
    {
        [Theory]
        [InlineAutoNData(HorizonMode.Disabled)]
        [InlineAutoNData(HorizonMode.Api)]
        [InlineAutoNData(HorizonMode.Preview)]
        internal void Process_ShouldSkipWhenNotEditingMode(
            HorizonMode mode,
            [Frozen] IHorizonInternalContext horizonContext,
            AddHorizonEditorExtenders sut)
        {
            // arrange
            var args = BuildHorizonPageExtendersArgs.Create();
            horizonContext.GetMode().Returns(mode);

            // act
            sut.Process(ref args);

            // assert
            args.BodyContent.Length.Should().Be(0);
        }
    }
}
