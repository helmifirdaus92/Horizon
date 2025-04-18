// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.ExternalProxy;

// This wrapper is intended for unit testing purposes, providing a way to abstract dependencies
internal interface IHeadlessContextWrapper
{
    HeadlessMode GetMode();

    void SetMode(HeadlessModeParameters parameters);

    HeadlessRequestState GetStateFromQueryStringOrCookie();
}
