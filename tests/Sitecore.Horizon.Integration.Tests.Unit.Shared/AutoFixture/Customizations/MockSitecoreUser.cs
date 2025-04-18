// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture;
using AutoFixture.Kernel;
using Sitecore.Security.Accounts;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class MockSitecoreUser : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Customizations.Add(new TypeRelay(typeof(User), typeof(UserProxy)));
        }

        public abstract class UserProxy : User
        {
            protected UserProxy(string userName, bool isAuthenticated) : base(userName, isAuthenticated)
            {
            }
        }
    }
}
