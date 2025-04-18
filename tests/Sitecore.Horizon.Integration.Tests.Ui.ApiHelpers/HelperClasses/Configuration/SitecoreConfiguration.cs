// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Net;
using System.Text;
using System.Threading;
using System.Xml.Linq;
using System.Xml.XPath;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Properties;
using UTF;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Configuration
{
    public class SitecoreConfiguration : ISitecoreConfiguration
    {
        private const string PatchConfigFolder = @"\App_Config\Include\HorizonPatches";
        private const string PatchPermanentConfigFolder = @"\App_Config\Include\HorizonPermanetPatchesForTests";
        private const string CombinedPatchName = "Combinded.patch.config";
        private readonly HelperService _helperService;
        private XElement combinedPatchConfig = null;

        public SitecoreConfiguration(HelperService helperService)
        {
            _helperService = helperService;
        }

        public void WarmUpInstance()
        {
            var request = (HttpWebRequest)WebRequest.Create(Context.Settings.HostLink + "/sitecore");
            request.WaitForCondition(r =>
            {
                var resp = (HttpWebResponse)r.GetResponse();
                return (int)resp.StatusCode >= 200 && (int)resp.StatusCode <= 299;
            },message:"CM instance warm up check failed");
        }

        public void WriteCombinedPatch()
        {
            _helperService.UploadFile(Encoding.ASCII.GetBytes(combinedPatchConfig.ToString()), CombinedPatchName, PatchConfigFolder);
            WarmUpInstance();
        }

        public ISitecoreSite AddSiteToCombinedPatch(string name, string startItemPath, string rootPath = "/Sitecore/content", string hostName = null, string targetHostName = null,
            string virtualFolder = "/", string physicalFolder = "/", string database = "web", string language = "en", string domain = "extranet", bool allowDebug = true,
            bool cacheHtml = true, string htmlCacheSize = "50MB", bool enablePreview = true, bool enableWebEdit = true, bool enableDebugger = true, bool disableClientData = false,
            bool enableItemLanguageFallback = false, bool enableFieldLanguageFallback = false, bool patchBeforeWebsite = false)
        {
            var additionalSitePatch = GetSiteConfigContent(name, startItemPath, rootPath, hostName, targetHostName, virtualFolder, physicalFolder,
                database, language, domain, allowDebug, cacheHtml, htmlCacheSize, enablePreview, enableWebEdit, enableDebugger, disableClientData,
                enableItemLanguageFallback, enableFieldLanguageFallback, patchBeforeWebsite);
            var sitesXpath = "/sitecore/sites";
            AppendPatch(additionalSitePatch, sitesXpath);
            string configPath = $@"{PatchConfigFolder}\{CombinedPatchName}";
            return new SitecoreSite(name, configPath, _helperService);
        }

        public ISitecoreSite AddSite(string name, string startItemPath, string rootPath = "/Sitecore/content", string hostName = null, string targetHostName = null,
            string virtualFolder = "/", string physicalFolder = "/", string database = "web", string language = "en", string domain = "extranet", bool allowDebug = true,
            bool cacheHtml = true, string htmlCacheSize = "50MB", bool enablePreview = true, bool enableWebEdit = true, bool enableDebugger = true, bool disableClientData = false,
            bool enableItemLanguageFallback = false, bool enableFieldLanguageFallback = false, bool patchBeforeWebsite = false)
        {
            string configName = $"{name}.site.patch.config";
            string configPath = $@"{PatchConfigFolder}\{configName}";

            var additionalSitePatch = GetSiteConfigContent(name, startItemPath, rootPath, hostName, targetHostName, virtualFolder, physicalFolder,
                database, language, domain, allowDebug, cacheHtml, htmlCacheSize, enablePreview, enableWebEdit, enableDebugger, disableClientData,
                enableItemLanguageFallback, enableFieldLanguageFallback, patchBeforeWebsite);

            _helperService.UploadFile(Encoding.ASCII.GetBytes(additionalSitePatch), configName, PatchConfigFolder);
            var site = new SitecoreSite(name, configPath, _helperService);
            WarmUpInstance();
            return site;
        }

        public void RestoreConfiguration()
        {
            _helperService.DeleteFilesAndFolders(PatchConfigFolder, "*");
            WarmUpInstance();
        }

        public void ClearSitecoreCache()
        {
            _helperService.ClearSitecoreCache();
        }

        public void DisableAntiCsrfTokens()
        {
            Patch(Encoding.ASCII.GetBytes(Resources.IgnoreAntiCSRFTokens), "IgnoreAntiCSRFTokens.patch.config");
        }

        public void DisableRobotDetection()
        {
            Patch(Encoding.ASCII.GetBytes(Resources.DisableRobotDetection), "DisableRobotDetection.patch.config");
        }

        public void DisableDeviceDetection()
        {
            Patch(Encoding.ASCII.GetBytes(Resources.DisableDeviceDetection), "DisableDeviceDetection.patch.config");
        }

        public void DisableHorizonAnalyticsCache()
        {
            string fileName = "DisableHorizonAnalyticsCache.patch.config";
            var fileAlreadyExists = _helperService.FileOrFolderExists(PatchPermanentConfigFolder + "\\" + fileName);
            if (fileAlreadyExists)
            {
                Logger.WriteLineWithTimestamp($"File {fileName} already exists in {PatchPermanentConfigFolder}. It will not be overwritten");
                return;
            }

            Patch(Encoding.ASCII.GetBytes(Resources.DisableHorizonAnalyticsCache), fileName, PatchPermanentConfigFolder);
        }

        public void DisableXdb()
        {
            Patch(Encoding.ASCII.GetBytes(Resources.DisableXdb), "DisableXdb.patch.config");
        }

        private void Patch(byte[] patchFileContent, string patchFileName, string patchPath = null)
        {
            Logger.WriteLineWithTimestamp($"Writing file '{patchFileName}' to the location '{patchPath}'");
            patchPath = patchPath ?? PatchConfigFolder;
            _helperService.UploadFile(patchFileContent, patchFileName, patchPath);
            WarmUpInstance();
        }

        private void AppendPatch(string patchToAdd, string ElementsToAddParentXPath)
        {
            XElement additionalPatch = XElement.Parse(patchToAdd);

            if (combinedPatchConfig != null)
            {
                var parentNodeDestination = combinedPatchConfig.XPathSelectElement(ElementsToAddParentXPath);
                var parentNodeSource = additionalPatch.XPathSelectElement(ElementsToAddParentXPath);
                foreach (var node in parentNodeSource.Nodes())
                {
                    parentNodeDestination.Add(node);
                }
            }
            else
            {
                combinedPatchConfig = additionalPatch;
            }
        }

        private string GetSiteConfigContent(string name, string startItemPath, string rootPath = "/Sitecore/content", string hostName = null, string targetHostName = null,
            string virtualFolder = "/", string physicalFolder = "/", string database = "web", string language = "en", string domain = "extranet", bool allowDebug = true,
            bool cacheHtml = true, string htmlCacheSize = "50MB", bool enablePreview = true, bool enableWebEdit = true, bool enableDebugger = true, bool disableClientData = false,
            bool enableItemLanguageFallback = false, bool enableFieldLanguageFallback = false, bool patchBeforeWebsite = false)
        {
            startItemPath = startItemPath.ToLower();
            rootPath = rootPath.ToLower();
            if (startItemPath.Contains(rootPath))
            {
                startItemPath = startItemPath.Replace(rootPath, "");
            }

            if (!startItemPath.StartsWith("/"))
            {
                startItemPath = $"/{startItemPath}";
            }

            string extendParametersHere = string.Empty;
            if (hostName != null)
            {
                extendParametersHere = $"hostName=\"{hostName}\" "; // do not forget space at the end
            }

            if (targetHostName != null)
            {
                extendParametersHere += $"targetHostName=\"{targetHostName}\" ";
            }

            var patch = patchBeforeWebsite ? "patch:before=\"site[@name = 'website']\"" : "";

            string additionalSitePatch = string.Format(Resources.SiteDefinitionPatternConfig, name, patch, virtualFolder, physicalFolder, rootPath, startItemPath, database,
                language, domain, allowDebug.ToString().ToLower(), cacheHtml.ToString().ToLower(), htmlCacheSize, enablePreview.ToString().ToLower(),
                enableWebEdit.ToString().ToLower(), enableDebugger.ToString().ToLower(), disableClientData.ToString().ToLower(), enableItemLanguageFallback.ToString().ToLower(),
                enableFieldLanguageFallback.ToString().ToLower(), extendParametersHere);
            return additionalSitePatch;
        }
    }
}
