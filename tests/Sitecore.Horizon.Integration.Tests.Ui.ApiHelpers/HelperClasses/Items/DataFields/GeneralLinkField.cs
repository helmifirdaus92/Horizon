// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Xml;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.DataFields
{
    public class GeneralLinkField
    {
        private readonly string _fieldName;
        private string _itemPath;
        private DatabaseType _database;
        private HelperService _helperService;


        public GeneralLinkField(string fieldName, string itemPath, DatabaseType database, HelperService helperService)
        {
            _fieldName = fieldName;
            _itemPath = itemPath;
            _database = database;
            _helperService = helperService;
        }

        public void AddLinkToLanguageVersionOfPage(string contextPageLanguage, int contextPageVersion, string linkedPageItemId, string linkedPageLanguage)
        {
            string generalLinkPattern = "<link text=\"link to other page\" anchor=\"11\" linktype=\"internal\" class=\"\" title=\"title\"  id=\"{2E5892C5-A529-4646-989B-1F15DE10453E}\" />";
            XmlDocument fieldValue = new XmlDocument();
            fieldValue.LoadXml(generalLinkPattern);
            XmlAttribute queryStringAttribute = fieldValue.CreateAttribute("querystring");
            fieldValue.SelectSingleNode("/link").Attributes.Append(queryStringAttribute);
            fieldValue.SelectSingleNode("/link/@querystring").Value = string.Format("sc_lang={0}&amp;sc_site=website", linkedPageLanguage);
            fieldValue.SelectSingleNode("/link/@id").Value = linkedPageItemId;
            _helperService.EditItemVersion(_itemPath, contextPageLanguage, contextPageVersion, _fieldName, fieldValue.InnerXml);
        }
    }
}
