// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using NSubstitute;
using Sitecore.Collections;
using Sitecore.Data;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Security.Accounts;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    internal class ItemMockHelper
    {
        public static Item MockItemWithFields(ID itemId, IEnumerable<KeyValuePair<ID, string>> fields, bool canWriteToField)
        {
            var item = Substitute.For<Item>(itemId, ItemData.Empty, Substitute.For<Database>());
            item.Paths.Returns(Substitute.For<ItemPath>(item));
            item.Language.Returns(Language.Invariant);
            item.Editing.Returns(Substitute.For<ItemEditing>(item));
            item.Fields.Returns(Substitute.For<FieldCollection>(item));
            foreach (var fieldPair in fields)
            {
                MockFieldForItem(item, fieldPair.Key, fieldPair.Value, canWriteToField);
            }

            return item;
        }

        public static Field MockFieldForItem(Item item, ID fieldId, string value, bool canWrite = true, string typeKey = "")
        {
            var field = Substitute.For<Field>(fieldId, item);
            field.Value.Returns(value);
            field.CanUserWrite(Arg.Any<User>()).Returns(canWrite);
            field.TypeKey.Returns(typeKey);
            item.Fields?[fieldId].Returns(field);

            return field;
        }
    }
}
