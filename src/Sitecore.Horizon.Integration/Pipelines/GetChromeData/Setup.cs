// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Pipelines.GetChromeData;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.GetChromeData
{
    internal class Setup : Sitecore.Pipelines.GetChromeData.Setup
    {
        private readonly IHorizonInternalContext _horizonContext;

        public Setup(IHorizonInternalContext horizonContext, BaseClient client) : base(client)
        {
            _horizonContext = horizonContext;
        }


        public override void Process(GetChromeDataArgs args)
        {
            if (_horizonContext.GetHeadlessMode() == HeadlessMode.Edit)
            {
                return;
            }

            base.Process(args);
        }
    }
}
