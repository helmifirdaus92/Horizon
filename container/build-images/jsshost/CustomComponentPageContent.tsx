import React from 'react';
import {
  useSitecoreContext,
  Field,
  Text,
  DateField,
  RichTextField,
  RichText as JssRichText,
  ImageField,
  Link as JssLink,
  LinkField,
  Image as JssImage,
  FileField,
  File,
} from '@sitecore-jss/sitecore-jss-nextjs';

interface Fields {
  SingleLineText: Field<string>;
  Date: Field<string>;
  Number: Field<string>;
  Integer: Field<string>;
  RichText: RichTextField;
  MultiLineText: Field<string>;
  Datetime: Field<string>;
  GeneralLink: LinkField;
  Image: ImageField;
  File: FileField;
  CheckBox: Field<boolean>;
  Multilist: Field<string[]>;
  Droplink: LinkField;
  Checklist: Field<string[]>;
  Taglist: Field<string>;
  Droplist: Field<string>;
  MultirootTreelist: Field<string[]>;
  Treelist: Field<string>;
}

type CustomComponentProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: CustomComponentProps): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const dateTime = sitecoreContext?.route?.fields?.Datetime as Field<string>;
  const number = sitecoreContext?.route?.fields?.Number as Field<string>;
  const integer = sitecoreContext?.route?.fields?.Integer as Field<string>;
  const singleLineText = sitecoreContext?.route?.fields?.SingleLineText as Field<string>;
  const multiLineText = sitecoreContext?.route?.fields?.MultiLineText as Field<string>;
  const richText = sitecoreContext?.route?.fields?.RichText as RichTextField;
  const image = sitecoreContext?.route?.fields?.Image as ImageField;
  const date = sitecoreContext?.route?.fields?.Date as Field<string>;
  const generalLink = sitecoreContext?.route?.fields?.GeneralLink as LinkField;
  const file = sitecoreContext?.route?.fields?.File as FileField;
  const checkBox = sitecoreContext?.route?.fields?.Checkbox as Field<boolean>;
  const multilist = Array.isArray(sitecoreContext?.route?.fields?.Multilist)
    ? sitecoreContext?.route?.fields?.Multilist
    : [];
  const droplink = sitecoreContext?.route?.fields?.Droplink as LinkField;
  const checklist = Array.isArray(sitecoreContext?.route?.fields?.Checklist)
    ? sitecoreContext?.route?.fields?.Checklist
    : [];
  const taglist = sitecoreContext?.route?.fields?.Taglist as Field<string>;
  const droplist = sitecoreContext?.route?.fields?.Droplist as Field<string>;
  const multirootTreelist = Array.isArray(sitecoreContext?.route?.fields?.MultirootTreelist)
    ? sitecoreContext?.route?.fields?.MultirootTreelist
    : [];
  const treelist = Array.isArray(sitecoreContext?.route?.fields?.Treelist)
    ? sitecoreContext?.route?.fields?.Treelist
    : [];

  return (
    <div className={`component customcomponentpagecontent ${props.params.styles}`}>
      <div
        className="component-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '50px',
        }}
      >
        <div className="Datetime">
          <DateField field={dateTime} />
        </div>
        <div className="Number">
          <Text field={number} />
        </div>
        <div className="Integer">
          <Text field={integer} />
        </div>
        <div className="SingleLineText">
          <Text field={singleLineText} />
        </div>
        <div className="MultiLineText">
          <Text field={multiLineText} />
        </div>
        <div className="RichText">
          <JssRichText field={richText} />
        </div>
        <div className="Image">
          <JssImage
            field={image}
            emptyFieldEditingComponent={() => <p> This value is set in the component tsx file</p>}
          />
        </div>
        <div className="Date">
          <DateField field={date} />
        </div>
        <div className="GeneralLink">
          <JssLink field={generalLink} />
        </div>
        <div className="File">
          <File field={file} target="_blank" />
        </div>
        <div className="CheckBox">
          <input type="checkbox" id="scales" name="scales" checked={checkBox?.value} />
        </div>
        <ul className="Multilist">
          {multilist?.map((item, index) => (
            <li key={index} className="text-sm font-medium">
              {item.displayName}
            </li>
          ))}
        </ul>
        <div className="Droplink">
          <JssLink field={droplink} />
        </div>
        <ul className="Checklist">
          {checklist?.map((item, index) => (
            <li key={index} className="text-sm font-medium">
              {item.displayName}
            </li>
          ))}
        </ul>
        <div className="Taglist">
          <Text field={taglist} />
        </div>
        <div className="Droplist">
          <Text field={droplist} />
        </div>
        <ul className="MultirootTreelist">
          {multirootTreelist?.map((item, index) => (
            <li key={index} className="text-sm font-medium">
              {item.displayName}
            </li>
          ))}
        </ul>
        <ul className="Treelist">
          {treelist?.map((item, index) => (
            <li key={index} className="text-sm font-medium">
              {item.displayName}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
