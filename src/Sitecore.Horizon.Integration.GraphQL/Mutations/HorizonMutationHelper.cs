// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.SetLayoutKind;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Saving;
using Sitecore.Web.UI.HtmlControls;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations
{
    internal class HorizonMutationHelper : IHorizonMutationHelper
    {
        private IItemPermissionChecker _itemPermissionChecker;
        private ISitecoreContext _scContext;
        private BaseTemplateManager _templateManager;

        public HorizonMutationHelper(ISitecoreContext scContext, IItemPermissionChecker itemPermissionChecker, BaseTemplateManager templateManager)
        {
            _scContext = scContext;
            _itemPermissionChecker = itemPermissionChecker;
            _templateManager = templateManager;
        }

        public void VerifyCanEditField(Item candidate, ID fieldId, bool allowFallback = false)
        {
            if (candidate.Locking.IsLocked() && !_itemPermissionChecker.CanUnlock(candidate, _scContext.User))
            {
                throw new HorizonGqlError(ItemErrorCode.ItemIsLocked);
            }

            if (candidate.IsFallback && !allowFallback)
            {
                throw new HorizonGqlError(ItemErrorCode.ItemIsFallback);
            }

            // Appearance.ReadOnly checks IsFallback field inside but we want to check it separately
            if (candidate.Appearance.ReadOnly && !candidate.IsFallback)
            {
                throw new HorizonGqlError(ItemErrorCode.ItemIsReadOnly);
            }

            if (_scContext.User.IsAdministrator)
            {
                return;
            }

            if (!_templateManager.IsFieldPartOfTemplate(FieldIDs.DisplayName, candidate))
            {
                throw new HorizonGqlError(ItemErrorCode.FieldDoesNotExist);
            }

            if (!_itemPermissionChecker.CanWriteItemLanguage(candidate, _scContext.User))
            {
                throw new HorizonGqlError(ItemErrorCode.InsufficientLanguagePrivileges);
            }

            if (!_itemPermissionChecker.CanWrite(candidate, _scContext.User))
            {
                throw new HorizonGqlError(GenericErrorCodes.InsufficientPrivileges);
            }

            Field field = candidate.Fields[fieldId];

            if (!field.CanUserWrite(_scContext.User))
            {
                throw new HorizonGqlError(GenericErrorCodes.InsufficientPrivileges);
            }
        }

        public SetLayoutEditingKindResult SetLayoutEditingKind(LayoutKind kind)
        {
            var value = kind == LayoutKind.Shared ? ExperienceEditor.Constants.Registry.CheckboxTickedRegistryValue : ExperienceEditor.Constants.Registry.CheckboxUnTickedRegistryValue;
            Registry.SetString(ExperienceEditor.Constants.RegistryKeys.EditAllVersions, value);
            return new SetLayoutEditingKindResult();
        }
    }
}
