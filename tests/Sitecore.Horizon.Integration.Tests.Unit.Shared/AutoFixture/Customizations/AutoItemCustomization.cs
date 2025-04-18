// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture;
using NSubstitute;
using Sitecore.Data;
using Sitecore.NSubstituteUtils;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class AutoItemCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Inject(FakeUtil.FakeDatabase());
            fixture.Register((ID id, Database db, string[] pathChunks) =>
            {
                var fakeItem = new FakeItem(id, db);
                fakeItem.WithPath(string.Join("/", pathChunks));

                // To later resolve FakeItem from Sitecore item
                fakeItem.ToSitecoreItem().SyncRoot.Returns(fakeItem);
                return fakeItem;
            });
            fixture.Register((FakeItem fake) => fake.ToSitecoreItem());
        }
    }
}
