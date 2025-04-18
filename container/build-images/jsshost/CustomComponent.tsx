import React from 'react';
import {
  Field,
  Text,
  DateField,
  RichText as JssRichText,
  ImageField,
  Link as JssLink,
  LinkField,
  Image as JssImage,
} from '@sitecore-jss/sitecore-jss-nextjs';

interface Fields {
  SingleLineText: Field<string>;
  Date: Field<string>;
  Number: Field<string>;
  Integer: Field<string>;
  RichText: Field<string>;
  MultiLineText: Field<string>;
  Datetime: Field<string>;
  GeneralLink: LinkField;
  Image: ImageField;
}

type CustomComponentProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: CustomComponentProps): JSX.Element => {
  return (
    <div className={`component customcomponent ${props.params.styles}`}>
      <div
        className="component-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '50px',
        }}
      >
        <div className="Datetime">
          <DateField field={props.fields.Datetime} />
        </div>
        <div className="Number">
          <Text field={props.fields.Number} />
        </div>
        <div className="Integer">
          <Text field={props.fields.Integer} />
        </div>
        <div className="SingleLineText">
          <Text field={props.fields.SingleLineText} />
        </div>
        <div className="MultiLineText">
          <Text field={props.fields.MultiLineText} />
        </div>
        <div className="RichText">
          <JssRichText field={props.fields.RichText} />
        </div>
        <div className="Image">
          <JssImage field={props.fields.Image} />
        </div>
        <div className="Date">
          <DateField field={props.fields.Date} />
        </div>
        <div className="GeneralLink">
          <JssLink field={props.fields.GeneralLink} />
        </div>
      </div>
    </div>
  );
};
