// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Pipelines;

namespace Sitecore.Horizon.Integration.Pipelines
{
    [PipelineProcessor]
    internal interface IPipelineProcessor<in T> where T : PipelineArgs
    {
        void Process(T args);
    }
}
