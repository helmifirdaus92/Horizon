// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.ExperienceEditor.Pipelines.CanShowEditor;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.CanShowEditor;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.CanShowEditor
{
    public class HandleHorizonModeTests
    {
        [Theory]
        [InlineAutoNData(HeadlessMode.Disabled, true)]
        [InlineAutoNData(HeadlessMode.Api, false)]
        [InlineAutoNData(HeadlessMode.Edit, false)]
        [InlineAutoNData(HeadlessMode.Preview, false)]
        internal void Process_ShouldHideEditorBasedOnMode(
            HeadlessMode mode,
            bool canShowEditor,
            [Frozen] IHorizonInternalContext horizonContext,
            HandleHorizonMode sut,
            CanShowEditorPipelineEventArgs args)
        {
            // arrange
            args.CanShow = true;
            horizonContext.GetHeadlessMode().Returns(mode);

            // act
            sut.Process(args);

            // assert
            args.CanShow.Should().Be(canShowEditor);
        }
    }
}
