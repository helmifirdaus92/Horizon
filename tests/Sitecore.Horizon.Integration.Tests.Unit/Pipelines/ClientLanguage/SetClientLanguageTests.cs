// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.AutoNSubstitute;
using AutoFixture.Xunit2;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Integration.Pipelines.ClientLanguage;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Pipelines.GetStartUrl;
using Sitecore.Security;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.ClientLanguage
{
    public class SetClientLanguageTests
    {
        [Theory]
        [InlineAutoNData("api")]
        [InlineAutoNData("edit")]
        [InlineAutoNData("preview")]
        internal void Process_ShouldSetClientLanguageIfRequestIsForHorizonMode(
            string horizonMode,
            [Frozen] IClientLanguageService clientLanguageService,
            SetClientLanguage sut,
            GetStartUrlArgs args,
            [Substitute] UserProfile user
        )
        {
            // arrange
            args.AppendClientLanguage = true;
            args.User.Configure().Profile.Returns(user);
            args.Site.IsBackend.Returns(true);
            args.Result = new Uri($"https://cmInstance?{SetClientLanguage.HeadlessModeKey}={horizonMode}");

            // act
            sut.Process(args);

            // assert
            clientLanguageService.Received().SetClientLanguage(user.ClientLanguage);
        }

        [Theory]
        [InlineAutoNData("https://cmInstance/sitecore/shell")]
        [InlineAutoNData("https://cmInstance/sitecore/shell?sc_horizon=abc")]
        [InlineAutoNData("https://cmInstance/sitecore/shell?sc_horizon=")]
        internal void Process_ShouldNotSetClientLanguageIfRequestIsNotForHorizonMode(
            string uri,
            [Frozen] IClientLanguageService clientLanguageService,
            SetClientLanguage sut,
            GetStartUrlArgs args)
        {
            // arrange
            args.Result = new Uri(uri);
            args.AppendClientLanguage = true;
            args.Site.Configure().IsBackend.Returns(true);

            // act
            sut.Process(args);

            // assert
            clientLanguageService.DidNotReceive().SetClientLanguage(Any.String);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldNotSetClientLanguageIfArgsResultIsNull([Frozen] IClientLanguageService clientLanguageService, SetClientLanguage sut, GetStartUrlArgs args)
        {
            // arrange
            args.Result = null;

            // act
            sut.Process(args);

            // assert
            clientLanguageService.DidNotReceive().SetClientLanguage(Any.String);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldNotSetClientLanguageIfArgsAppendClientLanguageIsFalse([Frozen] IClientLanguageService clientLanguageService, SetClientLanguage sut, GetStartUrlArgs args)
        {
            // arrange
            args.AppendClientLanguage = false;

            // act
            sut.Process(args);

            // assert
            clientLanguageService.DidNotReceive().ApplyClientLanguage();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldNotSetClientLanguageIfArgsSiteIsNotBackend([Frozen] IClientLanguageService clientLanguageService, SetClientLanguage sut, GetStartUrlArgs args)
        {
            // arrange
            args.AppendClientLanguage = true;
            args.Site.Configure().IsBackend.Returns(false);

            // act
            sut.Process(args);

            // assert
            clientLanguageService.DidNotReceive().SetClientLanguage(Any.String);
        }
    }
}
