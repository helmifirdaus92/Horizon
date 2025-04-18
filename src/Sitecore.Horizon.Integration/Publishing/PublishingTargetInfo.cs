// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;

namespace Sitecore.Horizon.Integration.Publishing
{
    internal class PublishingTargetInfo : IPublishingTargetInfo
    {
        private readonly BasePublishManager _publishManager;
        private readonly ISitecoreContext _sitecoreContext;
        private readonly BaseFactory _factory;

        public PublishingTargetInfo(BasePublishManager publishManager,
            ISitecoreContext sitecoreContext, BaseFactory factory
        )
        {
            _publishManager = publishManager ?? throw new ArgumentNullException(nameof(publishManager));
            _sitecoreContext = sitecoreContext ?? throw new ArgumentNullException(nameof(sitecoreContext));
            _factory = factory ?? throw new ArgumentNullException(nameof(factory));
        }

        public Database[] GetTargetDatabases()
        {
            var targetItems = _publishManager.GetPublishingTargets(_sitecoreContext.Database);
            var databases = new List<string>();

            foreach (Item target in targetItems)
            {
                string databaseName = target[FieldIDs.PublishingTargetDatabase];
                if (!string.IsNullOrEmpty(databaseName))
                {
                    databases.Add(databaseName);
                }
            }

            return databases.Select(_factory.GetDatabase).ToArray();
        }
    }
}
