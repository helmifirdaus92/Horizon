// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.ExternalProxy;

internal class HeadlessContextWrapper : IHeadlessContextWrapper
{
    public HeadlessMode GetMode() => Sitecore.Context.HeadlessContext.GetMode();

    public void SetMode(HeadlessModeParameters parameters) => Sitecore.Context.HeadlessContext.SetMode(parameters);

    public HeadlessRequestState GetStateFromQueryStringOrCookie() => Sitecore.Context.HeadlessContext.GetStateFromQueryStringOrCookie();
}
