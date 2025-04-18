// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture;
using NSubstitute;
using Sitecore.Data;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.NSubstituteUtils;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class SitecoreFieldBuilder : ICustomization
    {
        public void Customize(IFixture fixture)
        {

            fixture.Register((ID fieldId, string value, string displayName, Item ownerItem) =>
            {
                var fakeField = new FakeField(fieldId,  value, ownerItem);
                fakeField.WithDisplayName(displayName);
                return fakeField;
            });

            fixture.Register((FakeField fakeField)=>fakeField.ToSitecoreField());
        }
    }
}
