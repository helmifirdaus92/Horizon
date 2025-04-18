// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Pipelines.GetChromeData;
using Sitecore.Pipelines.NormalizePlaceholderKey;

namespace Sitecore.Horizon.Integration.Pipelines.GetChromeData
{
    internal class FillHorizonPlaceholderChromeData : IPlatformPipelineProcessor<GetChromeDataArgs>
    {
        private readonly BaseCorePipelineManager _pipelineManager;

        public FillHorizonPlaceholderChromeData(BaseCorePipelineManager pipelineManager)
        {
            _pipelineManager = pipelineManager ?? throw new ArgumentNullException(nameof(pipelineManager));
        }

        public void Process(GetChromeDataArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            if (args.ChromeType != GetPlaceholderChromeData.ChromeType)
            {
                return;
            }

            var placeholderKey = args.CustomData[GetPlaceholderChromeData.PlaceholderKey] as string;
            if (placeholderKey == null)
            {
                return;
            }

            args.ChromeData.Custom["placeholderKey"] = placeholderKey;
            args.ChromeData.Custom["placeholderMetadataKeys"] = GetPlaceHolderMetadataKeys(placeholderKey);
            args.ChromeData.Custom["contextItem"] = new HorizonChromeDataItem(args.Item);
        }

        private string[] GetPlaceHolderMetadataKeys(string placeholderKey)
        {
            var args = new NormalizePlaceholderKeyArgs(placeholderKey);
            _pipelineManager.Platform().NormalizePlaceholderKey(args);

            string normalizePlaceholderKey = args.Handled ? args.Result : placeholderKey;

            var metadataKeys = new List<string>
            {
                normalizePlaceholderKey
            };

            string? placeholderLastChain = LastChain(normalizePlaceholderKey);
            if (placeholderLastChain != null)
            {
                metadataKeys.Add(placeholderLastChain);
            }

            return metadataKeys.ToArray();

            string? LastChain(string s)
            {
                return s.IndexOf('/') != -1 ? s.Split('/').Last() : null;
            }
        }
    }
}
