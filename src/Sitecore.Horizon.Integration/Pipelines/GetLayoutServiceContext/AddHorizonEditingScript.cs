// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Web;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Configuration;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.LayoutService.ItemRendering.Pipelines.GetLayoutServiceContext;
using Sitecore.LayoutService.Services;
using Sitecore.SecurityModel.Cryptography;

namespace Sitecore.Horizon.Integration.Pipelines.GetLayoutServiceContext;

[UsedInConfiguration]
internal class AddHorizonEditingScript : IGetLayoutServiceContextProcessor
{
    public const string ClientScriptsKey = "clientScripts";
    private string EditModeScriptPath { get; } = "/horizon/canvas/horizon.canvas.orchestrator.js";

    private readonly ISitecoreContext _context;
    private readonly IEditModeResolver _editModeResolver;
    private readonly IHashEncryption _hashEncryption;

    private readonly BaseSettings _settings;

    public AddHorizonEditingScript(ISitecoreContext context, IEditModeResolver editModeResolver,IHashEncryption hashEncryption, BaseSettings settings)
    {
        _context = context;
        _editModeResolver = editModeResolver;
        _hashEncryption = hashEncryption;
        _settings = settings;
    }

    public void Process(GetLayoutServiceContextArgs args)
    {
        EditMode editMode = _editModeResolver.ResolveEditMode(_context.HttpContext?.Request);

        if (editMode == EditMode.Chromes)
        {
            return;
        }

        var todayDateHash = _hashEncryption.Hash(DateTime.Today.ToString(CultureInfo.InvariantCulture));
        string horizonClientHost = _settings.Horizon().ClientHost;

        var fullScriptPath = $"{horizonClientHost}{EditModeScriptPath}?v={todayDateHash}";

        // Patch clientScripts if exists, otherwise add new key
        // This is to avoid adding SXA assembly reference
        if (args.ContextData.TryGetValue(ClientScriptsKey, out var existingScripts) && existingScripts is List<string> scripts)
        {
            scripts.Add(fullScriptPath);
        }
        else
        {
            args.ContextData.Add(ClientScriptsKey, new List<string> { fullScriptPath });
        }
    }
}
