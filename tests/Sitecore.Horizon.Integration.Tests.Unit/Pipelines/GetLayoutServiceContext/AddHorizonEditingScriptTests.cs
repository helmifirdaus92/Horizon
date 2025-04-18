// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Configuration;
using Sitecore.Horizon.Integration.Pipelines.GetLayoutServiceContext;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.LayoutService.ItemRendering.Pipelines.GetLayoutServiceContext;
using Sitecore.LayoutService.Services;
using Sitecore.SecurityModel.Cryptography;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.GetLayoutServiceContext;

public class AddHorizonEditingScriptTests
{
    [Theory]
    [AutoNData]
    internal void Process_ShouldAddCanvasEditingScriptWhenEditModeIsMetaData(
        [Frozen] IEditModeResolver editModeResolver,
        [Frozen] IHashEncryption hashEncryption,
        [Frozen] BaseSettings settings,
        string dateHash,
        AddHorizonEditingScript sut)
    {
        // Arrange
        GetLayoutServiceContextArgs args = new()
        {
            ContextData =
            {
                new KeyValuePair<string, object>(AddHorizonEditingScript.ClientScriptsKey, new List<string>
                {
                    "existing-script"
                })
            }
        };

        string host = "https://host.com/";
        settings.Horizon().ClientHost.Returns(host);
        editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Metadata);
        hashEncryption.Hash(Arg.Any<string>()).Returns(dateHash);

        // Act
        sut.Process(args);

        // Assert
        string expectedScriptUrl = $"{host}/horizon/canvas/horizon.canvas.orchestrator.js?v={dateHash}";
        args.ContextData[AddHorizonEditingScript.ClientScriptsKey].Should().BeEquivalentTo(new List<string>
        {
            "existing-script",
            expectedScriptUrl
        });
    }

    [Theory]
    [AutoNData]
    internal void Process_ShouldNotAddScriptWhenEditModeIsChromes(
        [Frozen] IEditModeResolver editModeResolver,
        AddHorizonEditingScript sut)
    {
        // Arrange
        GetLayoutServiceContextArgs args = new();
        editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Chromes);

        // Act
        sut.Process(args);

        // Assert
        args.ContextData.ContainsKey(AddHorizonEditingScript.ClientScriptsKey).Should().BeFalse();
    }

    [Theory]
    [AutoNData]
    internal void Process_ShouldAddScriptWhenEditModeIsNotMetadata(
        [Frozen] IEditModeResolver editModeResolver,
        AddHorizonEditingScript sut)
    {
        // Arrange
        GetLayoutServiceContextArgs args = new();
        editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Chromes);

        // Act
        sut.Process(args);

        // Assert
        args.ContextData.Should().NotContainKey(AddHorizonEditingScript.ClientScriptsKey);
    }

    [Theory]
    [AutoNData]
    internal void Process_ShouldAppendScriptWhenClientScriptsKeyExists(
        [Frozen] IEditModeResolver editModeResolver,
        [Frozen] IHashEncryption hashEncryption,
        [Frozen] BaseSettings settings,
        string dateHash,
        AddHorizonEditingScript sut)
    {
        // Arrange
        GetLayoutServiceContextArgs args = new()
        {
            ContextData =
            {
                new KeyValuePair<string, object>(AddHorizonEditingScript.ClientScriptsKey, new List<string>
                {
                    "existing-script"
                })
            }
        };

        string host = "https://host.com/";
        settings.Horizon().ClientHost.Returns(host);
        editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Metadata);
        hashEncryption.Hash(Arg.Any<string>()).Returns(dateHash);

        // Act
        sut.Process(args);

        // Assert
        string expectedScriptUrl = $"{host}/horizon/canvas/horizon.canvas.orchestrator.js?v={dateHash}";
        args.ContextData[AddHorizonEditingScript.ClientScriptsKey].Should().BeEquivalentTo(new List<string>
        {
            "existing-script",
            expectedScriptUrl
        });
    }

    [Theory]
    [AutoNData]
    internal void Process_ShouldAddScriptWhenClientScriptsKeyDoesNotExist(
        [Frozen] IEditModeResolver editModeResolver,
        [Frozen] IHashEncryption hashEncryption,
        [Frozen] BaseSettings settings,
        string dateHash,
        AddHorizonEditingScript sut)
    {
        // Arrange
        GetLayoutServiceContextArgs args = new();
        string host = "https://host.com/";
        settings.Horizon().ClientHost.Returns(host);
        editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Metadata);
        hashEncryption.Hash(Arg.Any<string>()).Returns(dateHash);

        // Act
        sut.Process(args);

        // Assert
        string expectedScriptUrl = $"{host}/horizon/canvas/horizon.canvas.orchestrator.js?v={dateHash}";
        args.ContextData[AddHorizonEditingScript.ClientScriptsKey].Should().BeEquivalentTo(new List<string>
        {
            expectedScriptUrl
        });
    }
}
