// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Abstractions;
using Sitecore.ContentSearch.Utilities;
using Sitecore.Data;
using Sitecore.Data.Templates;
using Sitecore.Diagnostics;
using Sitecore.Mvc.Extensions;

namespace Sitecore.Horizon.Integration.Media
{
    internal class MediaTemplateDiscoverer : IMediaTemplateDiscoverer
    {
        private readonly BaseTemplateManager _templateManager;

        public MediaTemplateDiscoverer(BaseTemplateManager templateManager)
        {
            Assert.ArgumentNotNull(templateManager, nameof(templateManager));

            _templateManager = templateManager;
        }

        public IEnumerable<ID> WithDescendantTemplates(string[] baseTemplateIds, Database database)
        {
            Assert.ArgumentNotNull(database, nameof(database));
            Assert.ArgumentNotNull(baseTemplateIds, nameof(baseTemplateIds));

            List<ID> templates = new List<ID>();
            foreach (var templateId in baseTemplateIds)
            {
                Template templateItem = _templateManager.GetTemplate(new ID(templateId), database);
                Assert.IsNotNull(templateItem, $"Unable to find template with id: {templateId}.");

                templates.Add(templateItem.ID);
                templates.AddRange(templateItem.GetDescendants().Select(x => x.ID));
            }
            return templates;
        }

        public IEnumerable<ID> GetVersionedMediaTemplates(Database database)
        {
            Assert.ArgumentNotNull(database, nameof(database));

            Template versionedBaseTemplate = _templateManager.GetTemplate(TemplateIDs.VersionedImage, database);
            Assert.IsNotNull(versionedBaseTemplate, "Unable to find versioned image template.");

            return versionedBaseTemplate.GetDescendants().Select(x => x.ID).Concat(versionedBaseTemplate.ID);
        }

        public IEnumerable<ID> GetUnversionedMediaTemplates(Database database)
        {
            Assert.ArgumentNotNull(database, nameof(database));

            Template unversionedBaseTemplate = _templateManager.GetTemplate(TemplateIDs.UnversionedImage, database);
            Assert.IsNotNull(unversionedBaseTemplate, "Unable to find unversioned image template.");

            return unversionedBaseTemplate.GetDescendants().Select(x => x.ID).Concat(unversionedBaseTemplate.ID);
        }
    }
}
