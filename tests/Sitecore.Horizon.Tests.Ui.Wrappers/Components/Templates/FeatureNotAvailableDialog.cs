// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates
{
    public class FeatureNotAvailableDialog : DialogBase
    {
        private static readonly string _expectedTextInFirstParagraph = "Templates, page designs, and partial designs are only available for headless SXA sites.";
        private static readonly string _expectedTextInSecondParagraph = "To use features like this and more, start creating headless SXA sites.";

        public FeatureNotAvailableDialog(WebElement container) : base(container)
        {
        }

        public void ClickDismissButton() { ClickActionButton("Dismiss"); }

        public Dictionary<string, string> GetParagraphs()
        {
            Dictionary<string, string> textsDictionary = new Dictionary<string, string>();

            var parentDiv = _dialog.FindElement("div.text");

            var paragraphElements = _dialog.FindElements("p");

            string firstParagraphText = paragraphElements[0].Text;
            textsDictionary.Add("firstParagraph", firstParagraphText);

            string secondParagraphText = paragraphElements[1].Text;
            textsDictionary.Add("secondParagraph", secondParagraphText);

            return textsDictionary;
        }

        public bool CheckTextInFirstParagraph()
        {
            var paragraphs = GetParagraphs();
            return paragraphs.TryGetValue("firstParagraph", out string firstParagraphText) && firstParagraphText.Contains(_expectedTextInFirstParagraph);
        }

        public bool CheckTextInSecondParagraph()
        {
            var paragraphs = GetParagraphs();
            return paragraphs.TryGetValue("secondParagraph", out string secondParagraphText) && secondParagraphText.Contains(_expectedTextInSecondParagraph);
        }
    }
}
