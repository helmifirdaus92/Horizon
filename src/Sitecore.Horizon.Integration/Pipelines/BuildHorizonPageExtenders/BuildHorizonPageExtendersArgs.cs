// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Text;

namespace Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders
{
    internal struct BuildHorizonPageExtendersArgs : IHorizonPipelineArgs
    {
        public bool Aborted { get; set; }

        public StringBuilder BodyContent { get; init; }

        public static BuildHorizonPageExtendersArgs Create()
        {
            return new()
            {
                BodyContent = new StringBuilder()
            };
        }
    }
}
