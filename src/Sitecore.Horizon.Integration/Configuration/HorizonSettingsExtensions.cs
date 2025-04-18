// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Diagnostics.CodeAnalysis;
using Sitecore.Abstractions;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Configuration
{
    internal static class HorizonSettingsExtensions
    {
        public const string GlobalTagsRepositoryDefaultId = "9E295C0E-FDBA-4E0D-836B-9F5973931C0C";

        public static HorizonSettings Horizon(this BaseSettings settings)
        {
            Assert.ArgumentNotNull(settings, nameof(settings));

            return new HorizonSettings(settings);
        }
    }

    [SuppressMessage("Microsoft.Performance", "CA1815:OverrideEqualsAndOperatorEqualsOnValueTypes", Justification = "Pipeline extension does not need equality operations.")]
    internal struct HorizonSettings
    {
        public const string ClientHostSettingName = "Horizon.ClientHost";
        public const string ClientHostStartPageSettingName = "Horizon.ClientHostStartPage";
        public const string ClientHostSecretSettingName = "Horizon.ClientHostSecret";
        public const string PlatformInstanceNameSettingName = "InstanceName";
        public const string JssEditingSecretSettingName = "JavaScriptServices.ViewEngine.Http.JssEditingSecret";
        public const string EnableCKEditorName = "Horizon.Enable.CKEditor";
        public const string PersonalizeScopeName = "Horizon.Personalize.Scope";
        public const string EnableComponentsTestingName = "Horizon.Enable.ComponentsTesting";
        public const string EnableOptimizeContentName = "Horizon.Enable.OptimizeContent";
        public const string GlobalTagsRepositoryName = "XA.Feature.Taxonomy.GlobalTagsRepository";


        private readonly BaseSettings _settings;

        public HorizonSettings(BaseSettings settings)
        {
            _settings = settings;
        }

        public string ClientHost => _settings.GetSetting(ClientHostSettingName, string.Empty);

        public string ClientHostStartPage => _settings.GetSetting(ClientHostStartPageSettingName, "/pages");

        public string ClientHostSecret => _settings.GetSetting(ClientHostSecretSettingName, string.Empty);

        public string PlatformInstanceName => _settings.GetSetting(PlatformInstanceNameSettingName, string.Empty);

        public string PlatformTenantName => _settings.GetSetting(BuildMetadataSettings.TenantNameSettingName, string.Empty);

        public string JssEditingSecret => _settings.GetSetting(JssEditingSecretSettingName, string.Empty);

        public bool EnableCKEditor => !string.IsNullOrEmpty(_settings.GetSetting(EnableCKEditorName, string.Empty));

        public string PersonalizeScope => _settings.GetSetting(PersonalizeScopeName, string.Empty);

        public bool EnableComponentsTesting => !string.IsNullOrEmpty(_settings.GetSetting(EnableComponentsTestingName, string.Empty));

        public bool EnableOptimizeContent => !string.IsNullOrEmpty(_settings.GetSetting(EnableOptimizeContentName, string.Empty));

        public string GlobalTagsRepository => _settings.GetSetting(GlobalTagsRepositoryName, HorizonSettingsExtensions.GlobalTagsRepositoryDefaultId);
    }
}
