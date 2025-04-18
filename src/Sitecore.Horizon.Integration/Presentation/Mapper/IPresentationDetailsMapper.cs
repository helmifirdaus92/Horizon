// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Layouts;

namespace Sitecore.Horizon.Integration.Presentation.Mapper
{
    internal interface IPresentationDetailsMapper
    {
        LayoutDefinition MapPresentationDetails(PresentationDetails presentationDetails);
    }
}
