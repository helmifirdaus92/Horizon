// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Presentation.Models;

namespace Sitecore.Horizon.Integration.Presentation
{
    internal interface IPresentationDetailsRepository
    {
        PresentationDetails GetItemPresentationDetails(Item item);

        PresentationDetails GetItemSharedPresentationDetails(Item item);
    }
}
