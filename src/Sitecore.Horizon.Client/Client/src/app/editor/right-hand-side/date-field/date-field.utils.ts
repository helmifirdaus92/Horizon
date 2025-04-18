/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import moment from 'moment';

export const SITECORE_ISO_DATE_FORMAT = 'YYYYMMDDTHHmmss[Z]';
export const DATEPICKER_INPUT_DATE_FORMAT = 'YYYY-MM-DD';
export const DATEPICKER_INPUT_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm';

export function convertDateToSitecoreIsoFormat(date: string): string {
  return moment.utc(date).format(SITECORE_ISO_DATE_FORMAT);
}

export function formatDate(value: string, type: string): string {
  const valueType = type.toLowerCase();
  const formatString = valueType === 'date' ? DATEPICKER_INPUT_DATE_FORMAT : DATEPICKER_INPUT_DATE_TIME_FORMAT;

  if (value && (valueType === 'date' || valueType === 'datetime')) {
    const date = moment.utc(value, SITECORE_ISO_DATE_FORMAT);
    return moment(date).format(formatString);
  }

  return '';
}

export function convertDateToReadableFormat(date: string, type: string): string {
  const formatString = type.toLocaleLowerCase() === 'date' ? 'MMM Do YYYY' : 'MMMM Do YYYY, h:mm a';
  return moment(date).format(formatString);
}
