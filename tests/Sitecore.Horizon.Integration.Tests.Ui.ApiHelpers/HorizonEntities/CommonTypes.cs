// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities
{
    public enum DatabaseType
    {
        Web = Database.Web,
        Master = Database.Master,
        Core = Database.Core
    }

    public enum LayoutType
    {
        Mvc,
        Sample,
        SXA
    }

    public enum PageWorkflowState
    {
        Draft,
        AwaitingApproval,
        Approved,
        Undefined
    }

    public enum PageFieldType
    {
        Image,
        Number,
        Date,
        Datetime,
        Integer,
        MultiLineText,
        Password,
        RichText,
        SingleLineText,
        GeneralLink,
        GeneralLinkWithSearch,
        MessageText,
        Text,
        CheckBox,
        CheckList,
        DropLink,
        DropTree,
        DropList
    }

    public enum AnalyticsWorkflowState
    {
        Deployed,
        Draft
    }

    public class PageField
    {
        private string _fieldName;

        public PageField()
        {
        }

        public PageField(PageFieldType fieldType, string value = null, string fieldName = null, string fieldId = null)
        {
            FieldType = fieldType;
            Value = value;
            FieldName = fieldName;
            FieldId = fieldId;
        }

        public PageFieldType FieldType { get; set; }
        public string Value { get; set; }

        public string FieldName
        {
            get => _fieldName ?? FieldType.ToString();
            set => _fieldName = value;
        }

        public string FieldId { get; set; }
    }

    public class WorkflowHistoryRecord
    {
        public WorkflowHistoryRecord(WorkflowRecord record)
        {
            NewState = record.NewState;
            OldState = record.OldState;
            Date = record.Date;
            User = record.User;
            Comment = record.Comment;
        }

        public string NewState { get; set; }
        public string OldState { get; set; }
        public DateTime Date { get; set; }
        public string User { get; set; }
        public string Comment { get; set; }
    }
}
