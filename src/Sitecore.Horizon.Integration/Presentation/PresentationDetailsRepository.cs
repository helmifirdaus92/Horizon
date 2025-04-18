// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Presentation.Mapper;
using Sitecore.Horizon.Integration.Presentation.Models;

namespace Sitecore.Horizon.Integration.Presentation
{
    internal class PresentationDetailsRepository : IPresentationDetailsRepository
    {
        private readonly ILayoutDefinitionMapper _layoutDefinitionMapper;
        private readonly IHorizonItemUtil _itemUtil;

        public PresentationDetailsRepository(
            ILayoutDefinitionMapper layoutDefinitionMapper,
            IHorizonItemUtil itemUtil
        )
        {
            Assert.ArgumentNotNull(layoutDefinitionMapper, nameof(layoutDefinitionMapper));
            Assert.ArgumentNotNull(itemUtil, nameof(itemUtil));

            _layoutDefinitionMapper = layoutDefinitionMapper;
            _itemUtil = itemUtil;
        }

        public PresentationDetails GetItemPresentationDetails(Item item)
        {
            Assert.ArgumentNotNull(item, nameof(item));

            var layoutDefinition = _itemUtil.GetItemFinalLayout(item);
            return _layoutDefinitionMapper.MapLayoutDefinition(layoutDefinition);
        }

        public PresentationDetails GetItemSharedPresentationDetails(Item item)
        {
            Assert.ArgumentNotNull(item, nameof(item));

            var layoutDefinition = _itemUtil.GetItemSharedLayout(item);
            return _layoutDefinitionMapper.MapLayoutDefinition(layoutDefinition);
        }
    }
}
