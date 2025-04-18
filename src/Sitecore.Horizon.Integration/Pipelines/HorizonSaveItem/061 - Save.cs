// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using Sitecore.Abstractions;
using Sitecore.Configuration;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;
using Sitecore.Web;
using static System.FormattableString;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Saves new field values into inner item.
    /// <para>Ensures that user can modify the field.</para>
    /// <para>Can remove scripts from RTE fields (based on <see cref="Settings.HtmlEditor.RemoveScripts"/>).</para>
    /// </summary>
    [SuppressMessage("Microsoft.Naming", "CA1724:TypeNamesShouldNotMatchNamespaces")]
    internal class Save : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="Save"/> class.
        /// </summary>
        public Save(BaseTranslate translate, BaseLog logger, ISitecoreContext context) : this(translate, logger, context, Settings.HtmlEditor.RemoveScripts)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Save"/> class.
        /// </summary>
        protected Save(BaseTranslate translate, BaseLog logger, ISitecoreContext context, bool removeAllScripts)
        {
            Assert.ArgumentNotNull(translate, nameof(translate));
            Assert.ArgumentNotNull(logger, nameof(logger));

            Translate = translate;
            Logger = logger;
            RemoveScripts = removeAllScripts;
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        /// <summary>
        /// Gets the translate.
        /// </summary>
        /// <value>
        /// The translate.
        /// </value>
        protected BaseTranslate Translate { get; private set; }

        /// <summary>
        /// Whether scripts should be removed from RTE fields.
        /// </summary>
        protected bool RemoveScripts { get; private set; }


        /// <summary>
        /// Gets the logger.
        /// </summary>
        /// <value>
        /// The logger.
        /// </value>
        protected BaseLog Logger { get; private set; }

        /// <summary>
        /// Runs the processor.
        /// </summary>
        /// <param name="args">
        /// The arguments.
        /// </param>
        public void Process(ref HorizonSaveItemArgs args)
        {
            foreach (HorizonArgsSaveItem saveItem in args.Items)
            {
                Item? item = _context.ContentDatabase?.GetItem(saveItem.ID, saveItem.Language, saveItem.Version);
                if (item == null)
                {
                    continue;
                }

                string blobValueMoniker = Translate.Text(Texts.BLOB_VALUE);

                item.Editing.BeginEdit();

                foreach (HorizonArgsSaveField saveField in saveItem.Fields)
                {
                    Field field = item.Fields[saveField.ID];

                    if (field == null ||
                        (field.IsBlobField
                            && (field.TypeKey == "attachment" || saveField.Value == blobValueMoniker)))
                    {
                        // TODO: Insert more proper logic
                        continue;
                    }

                    if (saveField.Reset)
                    {
                        saveField.OriginalValue = field.Value;
                        field.Reset();
                        saveField.Value = field.GetStandardValue();
                        continue;
                    }

                    saveField.OriginalValue = field.Value;
                    if (saveField.OriginalValue == saveField.Value)
                    {
                        continue;
                    }                   

                    if (!string.IsNullOrEmpty(saveField.Value))
                    {
                        if (field.TypeKey == "rich text" && RemoveScripts)
                        {
                            saveField.Value = RemoveAllScripts(saveField.Value);
                        }

                        if (NeedsHtmlTagEncode(saveField))
                        {
                            saveField.Value = saveField.Value.Replace("<", "&lt;").Replace(">", "&gt;");
                        }
                    }

                    field.Value = saveField.Value;
                }

                item.Editing.EndEdit();

                Logger.Audit(this, "Save item: {0}", FormatItem(item));

                args.SavedItems.Add(saveItem);
            }
        }


        /// <summary>
        /// Called when lack of write access rights detected.
        /// </summary>
        /// <param name="item">The item.</param>
        /// <param name="field">The field.</param>
        /// <param name="args">The arguments.</param>
        protected virtual void OnLackWriteAccessDetected(Item item, Field field, HorizonSaveItemArgs args)
        {
            Assert.ArgumentNotNull(item, nameof(item));
            Assert.ArgumentNotNull(field, nameof(field));
            Assert.ArgumentNotNull(args, nameof(args));

            Logger.Warn(Invariant($"An attempt to modify field without write access detected. Field value will not be saved. Item: {item.Uri}; Field: {field.Name}; User: {_context.User.Name}"), this);
        }

        /// <summary>
        /// Removes all JS from the specified string.
        /// </summary>
        /// <param name="text">String to process.</param>
        /// <returns></returns>
        protected virtual string RemoveAllScripts(string text)
        {
            return WebUtil.RemoveAllScripts(text);
        }


        /// <summary>
        /// Formats item for audit output.
        /// </summary>
        /// <param name="item">The item to be transformed into text representation.</param>
        /// <returns></returns>
        protected virtual string FormatItem(Item item)
        {
            return AuditFormatter.FormatItem(item);
        }

        /// <summary>
        /// Defines if the html tags in the field value should be encoded.
        /// </summary>
        /// <param name="field">The save field</param>
        /// <returns><c>true</c> if the value should be encoded and <c>false</c> otherwise.</returns>
        protected virtual bool NeedsHtmlTagEncode(HorizonArgsSaveField field)
        {
            Assert.ArgumentNotNull(field, nameof(field));
            return field.ID == FieldIDs.DisplayName;
        }
    }
}
