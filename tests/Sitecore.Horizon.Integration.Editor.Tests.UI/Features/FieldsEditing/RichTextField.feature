@Smoke
@RichTextField
Feature: RichTextField
    In order to edit text in rich text fields
    As an Content Author
    I want to be able to set different text styles/formats
	And add links
  #TODO: Optimize tests with creating items only once. Get rid of 'Given Page with child page exists' steps


Scenario Outline: Formatting by means of HTML affects only selected text
  Given RTE field of test page has '<p>One two three four five</p>' raw value
	  And user goes to the page in sxa site
	  And User selects text 'two three four' in RTE field
	  And User applies <formatting> formatting
  Then Formatting <formatting> is applied on 'two three four' text

	Examples:
		| formatting    |
		| Bold          |
		| Italic        |
		| Underline     |
		| Strikethrough |

Scenario Outline: Formatting by means of HTML affects full line containing selected text
  Given RTE field of test page has '<p>One two three four five</p>' raw value
	  And user goes to the page in sxa site
	  And User selects text 'two three' in RTE field
	  And User applies <formatting> formatting
  Then Formatting <formatting> is applied on 'One two three four five' text

	Examples:
		| formatting   |
		| Normal       |
		| Header1      |
		| Header2      |
		| Header3      |
		| Header4      |
		| Header5      |
		| Header6      |
		| BulletList   |
		| NumberedList |

Scenario Outline: Allign formatting by means of adding custom class attribute
  Given RTE field of test page has '<p>One two three four five</p>' raw value
    And user goes to the page in sxa site
    And User selects text 'two three' in RTE field
    And User applies <formatting> formatting  
  Then Formatting <formatting> is applied on 'One two three four five' text with adding '<customClass>' class

	Examples:
		| formatting   | customClass       |
		| AllignLeft   |                   |
		| AllignCenter | rte-align-center  |
		| AllignRight  | rte-align-right   |
		| Justify      | rte-align-justify |

Scenario: Increase indent formatting by means of adding custom class attribute
  Given RTE field of test page has '<p>One two three four five</p>' raw value
    And user goes to the page in sxa site
    And User selects text 'two three' in RTE field
    And User applies indent 'IncreaseIndent' formatting '3' times
  Then Formatting IncreaseIndent is applied on 'One two three four five' text with adding 'rte-indent-3' class

Scenario: Decrease indent Formatting by means of adding custom class attribute
  Given RTE field of test page has '<p>One two three four five</p>' raw value
    And user goes to the page in sxa site
    And User selects text 'two three' in RTE field
    And User applies indent 'IncreaseIndent' formatting '3' times
    And User applies indent 'DecreaseIndent' formatting '1' times
  Then  Formatting IncreaseIndent is applied on 'One two three four five' text with adding 'rte-indent-2' class
  Given User applies indent 'DecreaseIndent' formatting '1' times
  Then  Formatting IncreaseIndent is applied on 'One two three four five' text with adding 'rte-indent-1' class

Scenario: Few types of formatting applied
  Given RTE field of test page has '<p>One two three four five</p>' raw value
    And user goes to the page in sxa site
    And User selects text 'two three' in RTE field
    And User applies Bold formatting
    And User applies AllignCenter formatting
    And User applies indent 'IncreaseIndent' formatting '3' times
  Then Formatting Bold is applied on 'two three' text
    And Formatting AllignCenter is applied on 'One two three four five' text with adding 'rte-align-center rte-indent-3' class
    And Formatting IncreaseIndent is applied on 'One two three four five' text with adding 'rte-align-center rte-indent-3' class

@Bug286745
Scenario: New formatting desn't overwrights previously applied
  Given RTE field of test page has '<p>one two three four</p>' raw value
    And user goes to the page in sxa site
    And User selects text 'two' in RTE field
    And User applies Bold formatting
    And User selects text 'three' in RTE field
    And User applies Italic formatting
    And User applies AllignCenter formatting
    And User applies indent 'IncreaseIndent' formatting '2' times
    And User selects text 'one two three four' in RTE field
    And User applies Underline formatting
  Then Formatting Underline is applied on 'one' text
    And Formatting Underline is applied on 'four' text
    And Formatting AllignCenter is applied on 'one two three four' text with adding 'rte-align-center' class
    And Formatting IncreaseIndent is applied on 'one two three four' text with adding 'rte-indent-2' class
  Given User selects text 'two' in RTE field
  Then Formatting Underline is applied on 'two' text
    And Formatting Bold is applied on 'two' text
  Given User selects text 'three' in RTE field
  Then Formatting Underline is applied on 'three' text
    And Formatting Italic is applied on 'three' text

Scenario Outline: Remove formatting
  Given RTE field of test page has 'One two three four five' value formatted as '<formatting>' and has custom class attribute '<customClassAttributeValue>' value
    And user goes to the page in sxa site
    And User selects text 'One two three four five' in RTE field
    And User removes formatting
  Then RTE field of test page should have '<p>One two three four five</p>' raw value
    And UI of RTE shows that formatting '<formatting>' is not applied

	Examples:
		| formatting     | customClassAttributeValue |
		| Bold           |                           |
		| Italic         |                           |
		| Underline      |                           |
		| Strikethrough  |                           |
		| Header1        |                           |
		| Header2        |                           |
		| Header3        |                           |
		| Header4        |                           |
		| Header5        |                           |
		| Header6        |                           |
		| BulletList     |                           |
		| NumberedList   |                           |
		| AllignCenter   | rte-align-center          |
		| AllignRight    | rte-align-right           |
		| Justify        | rte-align-justify         |
		| IncreaseIndent | rte-indent-2              |
		| DecreaseIndent | rte-indent-2              |


## disable for render iframe through horizon endpoint as links are not supported
Scenario Outline: Add links with different targets
  Given Sxa page with child page exists
    And Page has value 'This is link to some awesome page' in RTE field
    And user goes to the page in sxa site
    And User selects text 'link to some awesome page' in RTE field
    And User opens Link details panel
    And User enters path of child page
    And User selects target '<target>'
    And user enters Alternative text 'Hover me!'
    And User selects other field to invoke autosave
    And User clicks on '<target>' link to child page
  Then Child page is opened in '<target>' target
  Given User reselects page in tree to ensure work with updated data
    And User clicks on '<target>' link to child page
  Then Child page is opened in '<target>' target
	Examples:
		| target  |
		| SameTab |
		#| NewTab  |  disable new tab tests until chrome error fix


## disable for render iframe through horizon endpoint as links are not supported
Scenario Outline: Edit links
  Given Sxa page with child page exists
    And RTE field has link with path 'OldValuePath' and text 'this is link' and alt text 'OldAltText' and target is new tab
    And user goes to the page in sxa site
    And User selects text 'this is link' in RTE field
    And User opens Link details panel
  Then Link details panel has path 'OldValuePath' and alt text 'OldAltText' and target 'NewTab'
  Given User enters path of child page
    And User selects target '<target>'
    And user enters Alternative text 'Hover me!'
    And User selects other field to invoke autosave
    And User reselects page in tree to ensure work with updated data
    And User clicks on '<target>' link to child page
  Then Child page is opened in '<target>' target
	Examples:
		| target  |
		| SameTab |
		#| NewTab  |  disable new tab tests until chrome error fix
#

## disable for render iframe through horizon endpoint as links are not supported
Scenario Outline: Edit link by clicking on it or partially selecting it
  Given Sxa page with child page exists
    And RTE field has link with path 'OldValuePath' and text 'child page opens here' and alt text '' and target is new tab
    And user goes to the page in sxa site
    And User puts caret 'after' text 'child page' in RTE field
    And User opens Link details panel
    And user enters value 'NewValuePath' to the path of link
    And User selects target 'NewTab'
    And user enters Alternative text 'HewValueAltText'
    And User selects other field to invoke autosave
  Then rte field has '1' link
    And rte field has link with 'NewValuePath' path and 'NewTab' target and 'HewValueAltText' alternative text
  Given User selects text 'child page' in RTE field
    And User opens Link details panel
    And User enters path of child page
    And User selects target 'SameTab'
    And User closes link details panel
  Then rte field has '1' link
    And rte field has link with path to child page and 'SameTab' target and 'HewValueAltText' alternative text
  Given User reselects page in tree to ensure work with updated data
  Then rte field has '1' link
    And rte field has link with path to child page and 'SameTab' target and 'HewValueAltText' alternative text
  Given User clicks on 'SameTab' link to child page
  Then Child page is opened in 'SameTab' target


## disable for render iframe through horizon endpoint as links are not supported
Scenario: Remove links
  Given Sxa page with child page exists
    And RTE field has link with path 'OldValuePath' and text 'this is link' and alt text 'OldAltText' and target is new tab
    And user goes to the page in sxa site
    And User selects text 'this is link' in RTE field
    And User opens Link details panel
  Then Link details panel has path 'OldValuePath' and alt text 'OldAltText' and target 'NewTab'
  Given User removes link
  Then Text 'this is link' remains selected in RTE field
  Given User opens Link details panel
  Then Link details panel has path '' and alt text '' and target 'SameTab'
  Given User reselects page in tree to ensure work with updated data
  Then RTE field does not contain values '<a, href, OldValuePath, OldAltText, title, target'

Scenario Outline: Test URL
 Given Sxa page with child page exists
    And Page has value 'This is link to some awesome page' in RTE field
    And user goes to the page in sxa site
    And User selects text 'link to some awesome page' in RTE field
    And User opens Link details panel
    And User enters path of child page
    And User selects target '<target>'
    And user enters Alternative text 'Hover me!'
    And User clicks to test url
  Then Child page is opened in 'NewTab' target

	Examples:
		| target  |
		| SameTab |
		#| NewTab  |  disable new tab tests until chrome error fix

@Bug300098
Scenario: Api requests are not sent for navigaion or selection of rich text
  Given RTE field of test page has '<p>One two three four five</p>' raw value
    And user goes to the page in sxa site
  Then New Api requests are not sent after text 'One two' is selected

Scenario: Image manipulations in RTE field also using media dialog
  Given RTE field of test page has 'One Two Three' raw value
    And Media library has 'imageInRte.jpg' image under '/sitecore/media library' path
    And user goes to the page in sxa site
    And User puts caret 'before' text 'Two' in RTE field
    And user invokes image dialog from RTE
  When User selects 'imageInRte' image in '/sitecore/media library' path in image dialog
    And User press add selected button in media library
  Then Image '/sitecore/media library/imageInRte' is added between 'One' text and 'Two' text in RTE field
    And RTE field is selected upon clicking image or text 'One'
  Given User puts caret 'before' text 'Two' in RTE field
  And user press 'backspace' button in RTE field
    And text field of Rich Text rendering looses focus
  Then rte field doesn't contain image
  Given User undo changes
  Then Image '/sitecore/media library/imageInRte' is added between 'One' text and 'Two' text in RTE field
  Given User selects text 'One Two' in RTE field
    And user press 'delete' button in RTE field
    And text field of Rich Text rendering looses focus
  Then rte field doesn't contain image


  #bug577907
  #need to rewrite this test after the new Preview functionality will be implemented
#Scenario: Image as link to other page
#  Given Sxa page with child page exists
#    And Media library has 'imageLink.jpg' image under '/sitecore/media library' path
#    And Page has value 'one two three four five' in RTE field
#    And user goes to the page in sxa site
#    And User puts caret 'after' text 'two' in RTE field
#    And user invokes image dialog from RTE
#  When User selects 'imageLink' image in '/sitecore/media library' path in image dialog
#    And User press add selected button in media library
#  Given User selects text 'two three' in RTE field
#    And User opens Link details panel
#    And User enters path of child page
#    And User selects other field to invoke autosave
#  #here we need to add step where we opens page in preview mode to open the picture link
#  Then Child page is opened in 'SameTab' target

 Scenario: RTE field is clear
  Given RTE field of test page has 'this is rich text field' raw value
    And user goes to the page in sxa site
    And User enters text '' in RTE field
  Then RTE field 'Text' is clear

Scenario: Undo and redo changes in RTE field
  Given RTE field of test page has '<p>this is rich text field</p>' raw value
    And user goes to the page in sxa site
    And User enters text 'FirstValue' in RTE field
    And user press 'enter' button in RTE field
    And text field of Rich Text rendering looses focus
    And User enters text 'SecondValue' in RTE field
    And text field of Rich Text rendering looses focus
    And User enters text '' in RTE field
    And text field of Rich Text rendering looses focus
    And User enters text 'ThirdValue' in RTE field
    And text field of Rich Text rendering looses focus
  When User clicks Undo
  Then RTE field 'Text' is clear
  When User clicks Undo
  Then Value of RTE field 'Text' is saved to '<p>SecondValue</p>'
  When User clicks Undo
  Then Value of RTE field 'Text' is saved to '<p>FirstValue</p><p><br /></p>'
  When User clicks Undo
  Then Value of RTE field 'Text' is saved to '<p>this is rich text field</p>'
    And Undo control is not active
  When User clicks Redo
  Then Value of RTE field 'Text' is saved to '<p>FirstValue</p><p><br /></p>'
  When User clicks Redo
  Then Value of RTE field 'Text' is saved to '<p>SecondValue</p>'
  When User clicks Redo
  Then RTE field 'Text' is clear
  When User clicks Redo
  Then Value of RTE field 'Text' is saved to '<p>ThirdValue</p>'
    And Redo control is not active
  When User clicks Undo
  Then RTE field 'Text' is clear
  When User clicks Undo
  Then Value of RTE field 'Text' is saved to '<p>SecondValue</p>'
  When User clicks Undo
  Then Value of RTE field 'Text' is saved to '<p>FirstValue</p><p><br /></p>'
  When User clicks Undo
  Then Value of RTE field 'Text' is saved to '<p>this is rich text field</p>'
    And Undo control is not active

Scenario: Text with html is saved and rendered correctly
  Given RTE field of test page has '' raw value
    And user goes to the page in sxa site
    And User enters text '<script>alert('Hello there')</script>' in RTE field
    And text field of Rich Text rendering looses focus
  When user reloads this page
  Then Value of RTE field in canvas is an encoded equivalent of "<script>alert('Hello there')</script>"
