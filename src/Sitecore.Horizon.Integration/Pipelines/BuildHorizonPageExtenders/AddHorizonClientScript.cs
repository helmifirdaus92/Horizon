// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Globalization;
using Sitecore.Horizon.Integration.Context;
using Sitecore.SecurityModel.Cryptography;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders
{
    internal class AddHorizonClientScript : IHorizonPipelineProcessor<BuildHorizonPageExtendersArgs>
    {
        private readonly IHashEncryption _hashEncryption;
        private readonly IHorizonInternalContext _horizonContext;

        public AddHorizonClientScript(IHashEncryption hashEncryption, IHorizonInternalContext horizonContext)
        {
            _hashEncryption = hashEncryption;
            _horizonContext = horizonContext;
        }

        private string editModeBaseScriptPath { get; } = "/horizon/canvas/horizon.canvas.js";
        private string previewModeBaseScriptPath { get; } = "/horizon/canvas/horizon.canvas.preview.js";

        public void Process(ref BuildHorizonPageExtendersArgs args)
        {
            if (_horizonContext.GetHeadlessMode() is not HeadlessMode.Edit and not HeadlessMode.Preview)
            {
                return;
            }

            var todayDateHash = _hashEncryption.Hash(DateTime.Today.ToString(CultureInfo.InvariantCulture));
            var baseScriptPath = _horizonContext.GetHeadlessMode() is HeadlessMode.Edit ? editModeBaseScriptPath : previewModeBaseScriptPath;
            var scriptPath = $"{baseScriptPath}?v={todayDateHash}";

            args.BodyContent.AppendLine(BuildScriptPath(_horizonContext.GetHorizonHost(), scriptPath));
        }

        private static string BuildScriptPath(string? clientHost, string scriptPath)
        {
            clientHost ??= string.Empty;
            var uri = new Uri(new Uri(clientHost), scriptPath);
            return "<script src='" + uri + "'></script>";
        }
    }
}
