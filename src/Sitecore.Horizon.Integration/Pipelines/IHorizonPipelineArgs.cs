// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Pipelines
{
    internal interface IHorizonPipelineArgs
    {
        bool Aborted { get; set; }
    }
}
