// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Pipelines
{
    internal interface IHorizonPipeline<T> where T : struct, IHorizonPipelineArgs
    {
        IHorizonPipelineProcessor<T>[] Processors { get; }
    }
}
