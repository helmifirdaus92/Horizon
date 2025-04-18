// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public interface IInsertOptionsSection
    {
        void AssignInsertOptions(string[] insertOptions);

        ICollection<string> GetInsertOptions();
    }
}
