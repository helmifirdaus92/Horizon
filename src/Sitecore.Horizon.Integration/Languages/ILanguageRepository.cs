// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Collections;

namespace Sitecore.Horizon.Integration.Languages
{
    internal interface ILanguageRepository
    {
        LanguageCollection GetLanguages();
    }
}
