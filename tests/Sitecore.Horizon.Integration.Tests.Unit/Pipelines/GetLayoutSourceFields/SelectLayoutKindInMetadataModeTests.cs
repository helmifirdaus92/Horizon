// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Specialized;
using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.GetLayoutSourceFields;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.LayoutService.Services;
using Sitecore.NSubstituteUtils;
using Sitecore.Pipelines.GetLayoutSourceFields;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.GetLayoutSourceFields
{
    public class SelectLayoutKindInMetadataModeTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldNotRemoveFinalLayoutFieldsWhenEditModeIsChromes(
            [Frozen] IEditModeResolver editModeResolver,
            [Frozen] ISitecoreContext context,
            GetLayoutSourceFieldsArgs args,
            SelectLayoutKindInMetadataMode sut)
        {
            // arrange
            editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Chromes);
            args.FieldValuesSource.Add(new FakeField(FieldIDs.FinalLayoutField));
            args.FieldValuesSource.Add(new FakeField(FieldIDs.LayoutField));

            // act
            sut.Process(args);

            // assert
            args.FieldValuesSource.Should().Contain(f => f.ID == FieldIDs.FinalLayoutField);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldNotRemoveFinalFieldIfLayoutParamInQueryIsFinal(
            [Frozen] IEditModeResolver editModeResolver,
            [Frozen] ISitecoreContext context,
            GetLayoutSourceFieldsArgs args,
            SelectLayoutKindInMetadataMode sut)
        {
            // arrange
            editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Metadata);
            args.FieldValuesSource.Add(new FakeField(FieldIDs.FinalLayoutField));
            args.FieldValuesSource.Add(new FakeField(FieldIDs.LayoutField));
            context.HttpContext.Request.QueryString.Add("sc_layoutKind", "final");

            // act
            sut.Process(args);

            // assert
            args.FieldValuesSource.Should().Contain(f => f.ID == FieldIDs.FinalLayoutField);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldNotRemoveFinalFieldIfLayoutParamInHeaderIsFinal(
            [Frozen] IEditModeResolver editModeResolver,
            [Frozen] ISitecoreContext context,
            GetLayoutSourceFieldsArgs args,
            SelectLayoutKindInMetadataMode sut)
        {
            // arrange
            editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Metadata);
            args.FieldValuesSource.Add(new FakeField(FieldIDs.FinalLayoutField));
            args.FieldValuesSource.Add(new FakeField(FieldIDs.LayoutField));
            context.HttpContext.Request.Headers.Returns(new NameValueCollection()
            {
                {
                    "sc_layoutKind", "final"
                }
            });

            // act
            sut.Process(args);

            // assert
            args.FieldValuesSource.Should().Contain(f => f.ID == FieldIDs.FinalLayoutField);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldRemoveFinalFieldIfLayoutParamInQueryIsShared(
            [Frozen] IEditModeResolver editModeResolver,
            [Frozen] ISitecoreContext context,
            GetLayoutSourceFieldsArgs args,
            SelectLayoutKindInMetadataMode sut)
        {
            // arrange
            editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Metadata);
            args.FieldValuesSource.Add(new FakeField(FieldIDs.FinalLayoutField));
            args.FieldValuesSource.Add(new FakeField(FieldIDs.LayoutField));
            context.HttpContext.Request.QueryString.Add("sc_layoutKind", "shared");

            // act
            sut.Process(args);

            // assert
            args.FieldValuesSource.Should().NotContain(f => f.ID == FieldIDs.FinalLayoutField);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldRemoveFinalFieldIfLayoutParamInHeaderIsShared(
            [Frozen] IEditModeResolver editModeResolver,
            [Frozen] ISitecoreContext context,
            GetLayoutSourceFieldsArgs args,
            SelectLayoutKindInMetadataMode sut)
        {
            // arrange
            editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Metadata);
            args.FieldValuesSource.Add(new FakeField(FieldIDs.FinalLayoutField));
            args.FieldValuesSource.Add(new FakeField(FieldIDs.LayoutField));
            context.HttpContext.Request.Headers.Returns(new NameValueCollection()
            {
                {
                    "sc_layoutKind", "shared"
                }
            });

            // act
            sut.Process(args);

            // assert
            args.FieldValuesSource.Should().NotContain(f => f.ID == FieldIDs.FinalLayoutField);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldRemoveFinalFieldIfLayoutKindIsPassedInDifferentCasing(
            [Frozen] IEditModeResolver editModeResolver,
            [Frozen] ISitecoreContext context,
            GetLayoutSourceFieldsArgs args,
            SelectLayoutKindInMetadataMode sut)
        {
            // arrange
            editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Metadata);
            args.FieldValuesSource.Add(new FakeField(FieldIDs.FinalLayoutField));
            args.FieldValuesSource.Add(new FakeField(FieldIDs.LayoutField));
            context.HttpContext.Request.Headers.Returns(new NameValueCollection()
            {
                {
                    "sc_layoutKind", "SHARED"
                }
            });

            // act
            sut.Process(args);

            // assert
            args.FieldValuesSource.Should().NotContain(f => f.ID == FieldIDs.FinalLayoutField);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldRemoveFinalFieldFromSharedSourceIfItemIsStandardValue(
            [Frozen] IEditModeResolver editModeResolver,
            [Frozen] ISitecoreContext context,
            GetLayoutSourceFieldsArgs args,
            SelectLayoutKindInMetadataMode sut)
        {
            // arrange
            editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Metadata);
            args.Field.Item.Name.Returns("__Standard Values");
            args.StandardValuesSource.Add(new FakeField(FieldIDs.FinalLayoutField));
            args.StandardValuesSource.Add(new FakeField(FieldIDs.LayoutField));
            context.HttpContext.Request.QueryString.Add("sc_layoutKind", "shared");

            // act
            sut.Process(args);

            // assert
            args.StandardValuesSource.Should().NotContain(f => f.ID == FieldIDs.FinalLayoutField);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldNotFailWhenHttpContextIsNotDefined(
            [Frozen] IEditModeResolver editModeResolver,
            [Frozen] ISitecoreContext context,
            GetLayoutSourceFieldsArgs args,
            SelectLayoutKindInMetadataMode sut)
        {
            // arrange
            editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Metadata);
            context.Configure().HttpContext.ReturnsNull();

            // assert
            sut.Invoking(x=>x.Process(args)).Should().NotThrow();
        }
    }
}
