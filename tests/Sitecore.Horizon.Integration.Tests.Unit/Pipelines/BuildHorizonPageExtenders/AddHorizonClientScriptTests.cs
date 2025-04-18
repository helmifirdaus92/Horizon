// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.SecurityModel.Cryptography;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.BuildHorizonPageExtenders
{
    public class AddHorizonClientScriptTests
    {
        [Theory, AutoNData]
        internal void Process_ShouldRenderValidScriptPathForEditMode(
            BuildHorizonPageExtendersArgs args,
            [Frozen] IHashEncryption hashEncryption,
            [Frozen] IHorizonInternalContext horizonContext,
            [NoAutoProperties] AddHorizonClientScript sut,
            string hashTodayDate)
        {
            // arrange
            string host = "http://abc";
            horizonContext.GetHorizonHost().Returns(host);
            hashEncryption.Hash(Arg.Any<string>()).Returns(hashTodayDate);
            horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);

            // act
            sut.Process(ref args);

            // assert
            string bodyContent = args.BodyContent.ToString();
            bodyContent.Should().Contain($"<script src='http://abc/horizon/canvas/horizon.canvas.js?v={hashTodayDate}'></script>");
        }

        [Theory, AutoNData]
        internal void Process_ShouldRenderValidScriptPathForPreviewMode(
            BuildHorizonPageExtendersArgs args,
            [Frozen] IHashEncryption hashEncryption,
            [Frozen] IHorizonInternalContext horizonContext,
            [NoAutoProperties] AddHorizonClientScript sut,
            string hashTodayDate)
        {
            // arrange
            string host = "http://abc";
            horizonContext.GetHorizonHost().Returns(host);
            hashEncryption.Hash(Arg.Any<string>()).Returns(hashTodayDate);
            horizonContext.GetHeadlessMode().Returns(HeadlessMode.Preview);

            // act
            sut.Process(ref args);

            // assert
            string bodyContent = args.BodyContent.ToString();
            bodyContent.Should().Contain($"<script src='http://abc/horizon/canvas/horizon.canvas.preview.js?v={hashTodayDate}'></script>");
        }

        [Theory]
        [InlineAutoNData(HeadlessMode.Disabled)]
        [InlineAutoNData(HeadlessMode.Api)]
        internal void Process_ShouldSkipWhenNotEditingMode(
            HeadlessMode mode,
            [Frozen] IHorizonInternalContext horizonContext,
            AddHorizonClientScript sut)
        {
            // arrange
            var args = BuildHorizonPageExtendersArgs.Create();
            horizonContext.GetHeadlessMode().Returns(mode);

            // act
            sut.Process(ref args);

            // assert
            args.BodyContent.Length.Should().Be(0);
        }
    }
}
