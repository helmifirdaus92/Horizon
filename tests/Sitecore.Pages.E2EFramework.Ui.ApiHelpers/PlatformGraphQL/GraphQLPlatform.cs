// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Xml.Linq;
using GraphQL.Client;
using GraphQL.Common.Request;
using GraphQL.Common.Response;
using Newtonsoft.Json;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL
{
    public class GraphQLPlatform
    {
        private const string PlatformApiUrl = "/api/authoring/graphql/v1";
        const string securityFieldName = "__Security";
        const string finalLayoutFieldName = "__Final Renderings";
        const string sharedLayoutFieldName = "__Renderings";
        const string supportedLanguagesFieldName = "SupportedLanguages";
        private readonly GraphQLClient _client;
        private readonly string _baseUrl;

        public GraphQLPlatform(string baseUrl)
        {
            _baseUrl = baseUrl;
            _client = new GraphQLClient(_baseUrl + PlatformApiUrl);
        }

        public void Dispose()
        {
            _client.Dispose();
        }

        public Item CreateItem(string name, string parent, string templateId, string displayName = "", string database = "master", string language = "en")
        {
            GraphQLRequest request = new CreateItem(name, parent, templateId, displayName: displayName, database: database, language: language);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            var responseContent = response.Data.ToString();
            CreateItemResponse createItemResponse = JsonConvert.DeserializeObject<CreateItemResponse>(responseContent);
            var item = createItemResponse.createItem.item;
            if (item != null)
            {
                item.GraphQlPlatform = this;
            }

            return createItemResponse.createItem.item;
        }

        public TaskStatus CreateItemAsync(string name, string parent, string templateId, string database = "master", string language = "en")
        {
            GraphQLRequest request = new CreateItem(name: name, parent: parent, templateId: templateId, database: database, language: language);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request);
            return response.Status;
        }

        public Item CopyItem(string copyItemName, string itemId, string targetParentId)
        {
            GraphQLRequest request = new CopyItem(copyItemName, itemId, targetParentId);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            var responseContent = response.Data.ToString();
            CopyItemResponse copyItemResponse = JsonConvert.DeserializeObject<CopyItemResponse>(responseContent);
            var item = copyItemResponse.copyItem.item;
            if (item != null)
            {
                item.GraphQlPlatform = this;
            }

            return copyItemResponse.copyItem.item;
        }

        public bool ConfigurePageDesigns(string siteName, string templateId, string pageDesignId)
        {
            var request = new ConfigurePageDesigns(siteName, templateId, pageDesignId);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return (response.Errors != null);
        }

        public Item GetItem(string path, string language = "en")
        {
            GraphQLRequest request = new GetItem(path, language);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            var responseContent = response.Data.ToString();
            GetItemResponse getItemResponse = JsonConvert.DeserializeObject<GetItemResponse>(responseContent);
            var item = getItemResponse.item;
            if (item != null)
            {
                item.GraphQlPlatform = this;
            }

            return item;
        }

        public string GetChildIdByTemplateId(string path, string childTemplateId, string language = "en")
        {
            GraphQLRequest request = new GetChildItemByTemplateId(path, language, childTemplateId);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            var responseContent = response.Data.ToString();
            GetItemResponse getItemResponse = JsonConvert.DeserializeObject<GetItemResponse>(responseContent);

            return getItemResponse.item.children.nodes.FirstOrDefault().itemId;
        }

        public int SearchResultTotalCount(string searchInput, string itemPath)
        {
            var pathCriteria = new SearchCriteriaInput
            {
                field = "_path",
                criteriaType = "CONTAINS",
                value = GetItem(itemPath).itemId.Replace("-", "")
            };
            GraphQLRequest request = new Search(searchInput, new[]
            {
                pathCriteria
            });

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return 0;
            }

            return response.Data.search.totalCount;
        }

        public SearchResponse SearchItem(string searchInput, string itemId)
        {
            var pathCriteria = new SearchCriteriaInput
            {
                field = "_path",
                criteriaType = "CONTAINS",
                value = itemId.Replace("-", "")
            };
            GraphQLRequest request = new Search(searchInput, new[]
            {
                pathCriteria
            });

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            GraphQLResponse response = _client.PostAsync(request).GetAwaiter().GetResult();
            SearchResponse searchResponse = JsonConvert.DeserializeObject<SearchResponse>(response.Data.seatch.ToString());

            return searchResponse;
        }

        public CreateSiteResponse CreateSite(string siteName, string template = "{5AAE1EEA-EA24-40BF-96F1-1F43DA82C77B}")
        {
            var request = new CreateSite(siteName);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<CreateSiteResponse>(response.Data.ToString());
        }

        public void CreateSiteAsync(string siteName, string template = "{5AAE1EEA-EA24-40BF-96F1-1F43DA82C77B}")
        {
            var request = new CreateSite(siteName);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request);
        }

        public GetSitesAndJobsListResponse GetSitesAndJobsList(string jobName)
        {
            var request = new GetSitesAndJobsList(jobName);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<GetSitesAndJobsListResponse>(response.Data.ToString());
        }

        public List<TenantTemplate> GetTenantTemplates(string siteName)
        {
            var request = new GetTenantTemplates(siteName);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<List<TenantTemplate>>(response.Data.tenantTemplates.ToString());
        }

        public UpdateItemTemplateResponse UpdateItemTemplate(string templateId, List<string> baseTemplates)
        {
            var request = new UpdateItemTemplate(templateId, baseTemplates);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<UpdateItemTemplateResponse>(response.Data.ToString());
        }

        public CreateItemTemplateResponse CreateItemTemplate(string templateName, string parentId, List<string> baseTemplates)
        {
            var request = new CreateItemTemplate(templateName, parentId, baseTemplates);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<CreateItemTemplateResponse>(response.Data.ToString());
        }

        public List<PageDesign> GetPageDesigns(string siteName)
        {
            var request = new GetPageDesigns(siteName);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<List<PageDesign>>(response.Data.pageDesigns.ToString());
        }

        public GetPartialDesignsRootResponse GetPartialDesignsRoot(string siteName)
        {
            var request = new GetPartialDesignsRoot(siteName);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<GetPartialDesignsRootResponse>(response.Data.ToString());
        }

        public GraphQLResponse DeleteItem(string itemId, string path = null)
        {
            var request = new DeleteItem(itemId, path);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<GraphQLResponse>(response.Data.ToString());
        }

        public TaskStatus DeleteItemAsync(string itemId, string path = null)
        {
            var request = new DeleteItem(itemId, path);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request);
            return response.Status;
        }

        public ItemDisplayNameResponse UpdatePOSValueInSite(string path, string fieldName, string fieldValue)
        {
            var request = new UpdatePOSItemRequest(path, fieldName, fieldValue);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<ItemDisplayNameResponse>(response.Data.ToString());
        }

        public GraphQLResponse UpdateItemField(string itemId, string fieldName, string fieldValue, string language = "en", int version = 1)
        {
            var request = new UpdateItem(itemId, fieldName, fieldValue, language, version);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<GraphQLResponse>(response.Data.ToString());
        }

        public void UpdateLayoutId(string itemPath, string layoutId, bool isFinalLayout = true, string language = "en")
        {
            var currentXMLvalue = GetItemLayout(itemPath, language, false);
            currentXMLvalue.Descendants("d").FirstOrDefault().Attribute("l").Value = layoutId;

            UpdateItemLayout(GetItem(itemPath, language).itemId, currentXMLvalue.ToString(), isFinalLayout, language);
        }

        public List<WorkflowEventConnection> GetWorkflowEvents(string workflowId, string itemId)
        {
            var request = new GetWorkFlowHistory(workflowId, itemId);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            GetWorkflowHistoryResponse getWorkflowHistoryResponse = JsonConvert.DeserializeObject<GetWorkflowHistoryResponse>(response.Data.ToString());
            return getWorkflowHistoryResponse.workflow.history.nodes;
        }

        public void SetCRUDAccessToItemAndDescendants(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.CRUDWithInheritanceAndDescendants}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void DenyReadAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.DenyReadAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void DenyWriteAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.DenyWriteAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void AllowReadAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.AllowReadAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void DenyDeleteAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.DenyDeleteAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void DenyCreateAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.DenyCreateAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void DenyLanguageWriteAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.DenyLanguageWriteAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void AllowLanguageWriteAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.AllowLanguageWriteAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void DenyLanguageReadAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.DenyLanguageReadAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void AllowLanguageReadAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.AllowLanguageReadAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void DenyWorkflowCommandExecuteAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.DenyWorkflowCommandExecuteAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void AllowWorkflowCommandExecuteAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.AllowWorkflowCommandExecuteAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void DenyRenameAccess(string itemID, string userName)
        {
            string fieldValue = $"au|sitecore\\{userName}{Constants.DenyRenameAccess}";
            string currentString = GetItemFieldValue(path: GetItem(path: itemID).path, fieldName: securityFieldName);
            fieldValue = BuildSecurityString(currentString, fieldValue, userName);
            UpdateItemField(itemId: itemID,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public void UpdateSecurityForItem(string itemId, string user, string value)
        {
            string fieldValue = $"au|sitecore\\{user}|{value}";
            UpdateItemField(itemId: itemId,
                fieldName: securityFieldName,
                fieldValue: fieldValue);
        }

        public XDocument GetItemLayoutFinalRendering(string path, string language = "en")
        {
            GraphQLRequest request = new GetItemLayoutFinalRendering(path, language);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            var responseContent = response.Data.ToString();
            GetItemResponse getItemResponse = JsonConvert.DeserializeObject<GetItemResponse>(responseContent);
            string layoutValue = getItemResponse.item.layout.value;

            return layoutValue == "" ? null : XDocument.Parse(layoutValue);
        }

        public XDocument GetItemLayout(string path, string language = "en", bool isFinalLayout = true)
        {
            var layoutFieldName = isFinalLayout ? finalLayoutFieldName : sharedLayoutFieldName;
            GraphQLRequest request = new GetItemFieldValue(path, layoutFieldName, language);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            var responseContent = response.Data.ToString();
            GetItemResponse getItemResponse = JsonConvert.DeserializeObject<GetItemResponse>(responseContent);
            string layoutValue = getItemResponse.item.layout.value;

            return layoutValue == "" ? null : XDocument.Parse(layoutValue);
        }

        public void UpdateItemLayout(string id, string layout, bool isFinalLayout = true, string language = "en", int version = 1)
        {
            var layoutFieldName = isFinalLayout ? finalLayoutFieldName : sharedLayoutFieldName;
            GraphQLRequest request = new UpdateItem(id, layoutFieldName, layout, language, version);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
        }

        public string GetItemFieldValue(string path, string fieldName, string language = "en")
        {
            GraphQLRequest request = new GetItemFieldValue(path, fieldName, language);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            var responseContent = response.Data.ToString();
            GetItemResponse getItemResponse = JsonConvert.DeserializeObject<GetItemResponse>(responseContent);
            return getItemResponse.item.layout.value;
        }

        public Item AddItemVersion(string path, string language)
        {
            GraphQLRequest request = new AddItemVersion(path, language);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            GraphQLResponse response = _client.PostAsync(request).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            dynamic responseContent = response.Data.ToString();
            AddItemVersionResponse itemResponse = JsonConvert.DeserializeObject<AddItemVersionResponse>(responseContent);
            return itemResponse.addItemVersion.item;
        }

        public void AddLanguage(string languageCode, string regionCode = "")
        {
            var request = new AddLanguage(languageCode, regionCode);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
        }

        public void AddSupportedLanguagesToSiteSettings(Item siteSettingsItem, string languageItemId)
        {
            var currentValue = GetItemFieldValue(siteSettingsItem.path, supportedLanguagesFieldName);
            languageItemId = IdStringToGuidStringToSave(languageItemId);
            string newValue = "";
            List<string> languages = currentValue.Split('|').ToList();
            if (languages.Count >= 1)
            {
                if (languages.Contains(languageItemId))
                {
                    Console.Write("Language already in the list of supported languages");
                    return;
                }
                else
                {
                    languages.Add(languageItemId);
                }

                newValue = string.Join("|", languages);
            }
            else
            {
                newValue = languageItemId;
            }

            UpdateItemField(itemId: siteSettingsItem.itemId, fieldName: supportedLanguagesFieldName, fieldValue: newValue);
        }

        public void AddSupportedLanguagesToSiteSettings(Item siteSettingsItem, List<string> languagesItemId)
        {
            var currentValue = GetItemFieldValue(siteSettingsItem.path, supportedLanguagesFieldName);
            List<string> languages = currentValue.Split('|').ToList();
            string newValue = "";
            foreach (var languageItemId in languagesItemId)
            {
                string languageGuidString = IdStringToGuidStringToSave(languageItemId);
                if (languages.Contains(languageGuidString))
                {
                    Console.Write("Language already in the list of supported languages");
                    break;
                }

                languages.Add(languageGuidString);
            }

            newValue = string.Join("|", languages);

            UpdateItemField(itemId: siteSettingsItem.itemId, fieldName: supportedLanguagesFieldName, fieldValue: newValue);
        }

        public void RemoveSupportedLanguagesFromSiteSettings(Item siteSettingsItem, string languageItemId)
        {
            var currentValue = GetItemFieldValue(siteSettingsItem.path, supportedLanguagesFieldName);
            languageItemId = IdStringToGuidStringToSave(languageItemId);
            List<string> languages = currentValue.Split('|').ToList();
            if (languages.Count >= 1)
            {
                if (!languages.Contains(languageItemId))
                {
                    Console.Write("Language does not exist in the list of supported languages");
                    return;
                }
                else
                {
                    languages.Remove(languageItemId);
                }

                string newValue = string.Join("|", languages);
                UpdateItemField(itemId: siteSettingsItem.itemId, fieldName: supportedLanguagesFieldName, fieldValue: newValue);
            }
            else
            {
                Console.Write("Supported languages list is empty");
                return;
            }
        }

        public void RemoveSupportedLanguagesFromSiteSettings(Item siteSettingsItem, List<string> languagesItemId)
        {
            var currentValue = GetItemFieldValue(siteSettingsItem.path, supportedLanguagesFieldName);
            List<string> languages = currentValue.Split('|').ToList();
            if (languages.Count >= 1)
            {
                foreach (var languageItemId in languagesItemId)
                {
                    string languageGuidString = IdStringToGuidStringToSave(languageItemId);
                    if (!languages.Contains(languageGuidString))
                    {
                        Console.Write("Language does not exist in the list of supported languages");
                        break;
                    }

                    languages.Remove(languageGuidString);
                }

                string newValue = string.Join("|", languages);
                UpdateItemField(itemId: siteSettingsItem.itemId, fieldName: supportedLanguagesFieldName, fieldValue: newValue);
            }
            else
            {
                Console.Write("Supported languages list is empty");
            }
        }

        public List<Site> GetSites(bool includeNonSxaSites = true)
        {
            var request = new GetSolutionSites(includeNonSxaSites);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<List<Site>>(response.Data.solutionSites.ToString());
        }

        public List<User> GetUsers()
        {
            GraphQLRequest request = new GetUsers();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            var responseContent = response.Data.ToString();
            GetUsersResponse getUsersResponse = JsonConvert.DeserializeObject<GetUsersResponse>(responseContent);

            return getUsersResponse.users.nodes;
        }

        public bool UpdateUser(string userName, List<string> roles)
        {
            var request = new UpdateUser(userName, roles);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();

            return (response.Errors != null);
        }

        public Item RenameItem(string itemId, string newName)
        {
            GraphQLRequest request = new RenameItem(itemId, newName);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            var responseContent = response.Data.ToString();
            RenameItemResponse renameItemResponse = JsonConvert.DeserializeObject<RenameItemResponse>(responseContent);
            var item = renameItemResponse.renameItem.item;
            if (item != null)
            {
                item.GraphQlPlatform = this;
            }

            return renameItemResponse.renameItem.item;
        }

        public Item MoveItem(string itemId, string targetParentPath)
        {
            GraphQLRequest request = new MoveItem(itemId, targetParentPath);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            var responseContent = response.Data.ToString();
            MoveItemResponse moveItemResponse = JsonConvert.DeserializeObject<MoveItemResponse>(responseContent);
            var item = moveItemResponse.moveItem.item;
            if (item != null)
            {
                item.GraphQlPlatform = this;
            }

            return moveItemResponse.moveItem.item;
        }

        public Item DeleteItemVersion(string itemId, int version)
        {
            GraphQLRequest request = new DeleteItemVersion(itemId, version);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            var responseContent = response.Data.ToString();
            DeleteItemVersionResponse deleteVersionItemResponse = JsonConvert.DeserializeObject<DeleteItemVersionResponse>(responseContent);
            var item = deleteVersionItemResponse.deleteItemVersion.item;
            if (item != null)
            {
                item.GraphQlPlatform = this;
            }

            return deleteVersionItemResponse.deleteItemVersion.item;
        }

        public RebuildIndexesResponse RebuildIndexes(List<string> indexNames)
        {
            GraphQLRequest request = new RebuildIndexes(indexNames);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

            if (response == null || response.Data == null)
            {
                return null;
            }

            var responseContent = response.Data.rebuildIndexes.ToString();

            RebuildIndexesResponse jobResponse = JsonConvert.DeserializeObject<RebuildIndexesResponse>(responseContent);

            return jobResponse;
        }

        public CreateItemTemplateResponse CreateTemplateWithAllFields(string templateName, string parentId, string[] baseTemplates)
        {
            var request = new CreateTemplateWithAllFields(templateName, parentId, baseTemplates);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<CreateItemTemplateResponse>(response.Data.ToString());
        }

        public bool ItemTemplateExists(string path)
        {
            var request = new GetItemTemplate(path);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
            var response = _client.PostAsync(request).GetAwaiter().GetResult();

            if (response == null || response.Data == null || response.Data.itemTemplate == null)
            {
                return false;
            }

            return true;
        }

        private static string BuildSecurityString(string currentValue, string newSubString, string username)
        {
            string finalString;
            if (!currentValue.Equals(string.Empty))
            {
                if (!currentValue.Contains(username))
                {
                    finalString = currentValue + newSubString;
                }
                else
                {
                    var startIndex = currentValue.IndexOf($"au|sitecore\\{username}");
                    var endIndex = currentValue.IndexOf("au|", startIndex + 3);
                    currentValue = endIndex == -1 ? currentValue.Remove(startIndex) : currentValue.Remove(startIndex, endIndex - startIndex);

                    finalString = currentValue + newSubString;
                }
            }
            else
            {
                return newSubString;
            }

            return finalString;
        }

        private static string IdStringToGuidStringToSave(string idAsString)
        {
            return "{" + new Guid(idAsString).ToString().ToUpper() + "}";
        }
    }
}
