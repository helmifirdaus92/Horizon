// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Pipelines
{
    internal interface IHorizonPipelineProcessor<T> where T : IHorizonPipelineArgs
    {
        public void Process(ref T args);
    }
}
