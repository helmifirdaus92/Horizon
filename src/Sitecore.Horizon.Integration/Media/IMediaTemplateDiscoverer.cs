// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Data;

namespace Sitecore.Horizon.Integration.Media
{
    internal interface IMediaTemplateDiscoverer
    {
        IEnumerable<ID> WithDescendantTemplates(string[] baseTemplateIds, Database database);

        IEnumerable<ID> GetVersionedMediaTemplates(Database database);

        IEnumerable<ID> GetUnversionedMediaTemplates(Database database);
    }
}
