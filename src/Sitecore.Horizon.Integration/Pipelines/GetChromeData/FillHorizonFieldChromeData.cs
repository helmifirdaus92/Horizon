// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Data.Fields;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Pipelines.GetChromeData;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.GetChromeData
{
    internal class FillHorizonFieldChromeData : GetFieldChromeData
    {
        private readonly IHorizonInternalContext _horizonContext;

        public FillHorizonFieldChromeData(IHorizonInternalContext horizonContext, BaseFieldTypeManager fieldTypeManager, BaseClient client) : base(fieldTypeManager, client)
        {
            _horizonContext = horizonContext;
        }

        public override void Process(GetChromeDataArgs args)
        {
            if (_horizonContext.GetHeadlessMode() != HeadlessMode.Edit)
            {
                base.Process(args);
                return;
            }

            Assert.ArgumentNotNull(args, nameof(args));

            if (args.ChromeType != ChromeType)
            {
                return;
            }

            var field = args.CustomData[FieldKey] as Field;
            if (field == null)
            {
                return;
            }

            args.SetChromeDisplayName(field.DisplayName);

            args.ChromeData.Custom["fieldId"] = field.ID.Guid.ToString();
            args.ChromeData.Custom["fieldType"] = field.Type;
            args.ChromeData.Custom["contextItem"] = new HorizonChromeDataItem(args.Item);
            args.ChromeData.Custom["containsStandardValue"] = field.ContainsStandardValue;
        }
    }
}
