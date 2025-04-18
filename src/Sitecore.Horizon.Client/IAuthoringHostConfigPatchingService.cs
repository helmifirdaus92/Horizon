// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sitecore.Horizon.Client
{
    public interface IAuthoringHostConfigPatchingService
    {
        void PatchIndexFileWithConfigs(string path);
    }
}
