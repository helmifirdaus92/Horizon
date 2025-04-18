// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Security.Accounts;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Context
{
    internal interface IHorizonInternalContext
    {
        HeadlessMode GetHeadlessMode();

        [Obsolete("Use GetMode directly from directly")]
        HorizonMode GetMode();
        
        void SetHeadlessMode(HeadlessModeParametersWithHorizonHost parameters);

        bool HasHorizonAccess(User contextUser);

        string GetHorizonHost();
    }
}
