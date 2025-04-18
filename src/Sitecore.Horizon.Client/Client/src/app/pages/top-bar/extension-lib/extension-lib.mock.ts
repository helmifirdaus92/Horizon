/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MarketplaceAppsLocalStorageKey, MkpApplicationConfig } from './extension-lib.component';

export const registerMockedPlugins = () => {
  const extensions: MkpApplicationConfig[] = [
    {
      application: {
        id: '000',
        name: 'Demo App',
        type: 'extension',
        url: 'https://sitecore-mkp-demo.vercel.app?origin=https://localhost:5001',
        iconUrl:
          'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5RUMBCgoKDQwNGg8PGjclHyU3Nzc3NzcwNzc3Nzc3LTc3Nzc3Nzc3Ljc3Nzc3Nzg3Nzc3Nzc3Nzc3NzcrNzU3NzItLf/AABEIABwAHAMBEQACEQEDEQH/xAAZAAACAwEAAAAAAAAAAAAAAAAEBgECBwP/xAAvEAACAQMCBAQDCQAAAAAAAAABAgMEBREAEgYhMVETImGBQVKxBxQVI0JxgpGh/8QAGwEAAgIDAQAAAAAAAAAAAAAABQYDBAECBwD/xAAoEQABAwIFAwQDAAAAAAAAAAABAAIDBBESEyEx8AVxwVFhkdEiQbH/2gAMAwEAAhEDEQA/ADrZa626zGKhhMhXG9icKme59jpilmZELuKf6iqhpm4pTbyqX2gFprPubVCzTogMuweVGPPaO/LBzy669TzZgxWsFDDUGojzALA7e/uulRwrcKm1w3K04raeRMlE5SIehGPjg5HI+2p462Jkhjl/Ej4Qx9cxshjk0I+EmtUAnro0I1kv1WlcCXKK3Q3qqnPkigjfHzEFsAepJA99JlWcZaFP1mndO6GNu5JH8QfDVok4mmutVVuNxjYK56eO/MH9h29RrY1GVhDeBb9SqG0TY42caPtE/Zxe2pZq60VRKEq00St+l1HnX+hn+LatV8AlY2ZvY9jtzshfVoAbSt56c7LJGdgRjtpzDRZbOOqZjVyJFJErkRy7d4+bHMf7rnT5E25YLg4jUeU7cPcF2O+2qGq/E55Jig8ZImT8tviuCuR76iEzgdEArusVdLMYzGAP1e+o9d7JR4jp6SxX4JYriahIkB8TIJR+YZcgYPL640e6fNmtwyBZGbUwY5mYSeXSw8WG5DTO1+ipubqjZnPfXNHuKcWhRBNIm/ZI6b1KNtYjcp6g+mogdVKWtda42VdGKJ5uqdS0EKCAdNkLiWJclADl/9k=',
        resources: [
          {
            myopt: 'myopt',
          },
        ],
      },
    },
    {
      application: {
        id: '001',
        name: 'Birds Eye View',
        type: 'extension',
        url: 'https://xmc-mp-dashboard.vercel.app?origin=https://localhost:5001',
        iconUrl:
          'data:image/png;base64,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',
      },
    },
    {
      application: {
        id: '111',
        name: 'stackoverflow',
        type: 'extension',
        url: 'http://localhost:4200/ext/?appurl=stackoverflow.com',
        iconUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACJUlEQVRYhe2VPWgUQRTHf3t3JoGMoCaIIFgNpEjhEYjaxCNyVwVtLGxEtLCxiaIWsfH1gh8JFjZp0hgQgggSuHCeKYKGGEwhfjCKNoofaDOHkfsYi5s0h+Z277bcPzyGN/vm/37MzuxCokSJYpAVPWdFv+hkbSomhmFgxIqeirow6LSjFQ3Qr8RUfF4FMkBWidkI69PNDpSBn1b0Pp8f9uPzKCbdAKwDPcAXKzqnxKwD14FeK7oc1qTjVwBgRZ8EHvj0ohJzx4peBUaBy0rMzdgBrOgrwCMl5q3Ph4DX3mtOiTljRdeANDCqxKzFBmBF7wW++nQFuKTErFrRAfAROACsAVPAVWBCianFBuAhxoFbwEE/9Q6YVGIWreiHwAlgWomZDOPXzTUcBm4DeT/1AzgP7Fdi7ob1yURouBuYAR4Dy0rMK6BgRe8EpoGzwAIwFNYTIuyAFX0KuN8y/QwoAYvAe+C4EnMvCsB/d2CpWNwBnAY+5QuFEjAPvAGO+hgDjvi4BoCrX/BrzwEf8oXC044BgH5gluZpLykxABs+ZraKrOish5lI17+VF1ZeDlD5Pgs8AY51A9Dw46ZvdMMbVltq6kAN6Alc5U/gnPPPfrdr3g6gVYeAke0KXGpgsJrp+xXBMxRAA0CJyYUxLOY+74obYHCpWBxzQaqvXWHgnMM19sQFsHVFs8By4BrblP5Tvd0CbNL85IY6TC1K0/xBJUqUqK3+At+SrEfd+SwmAAAAAElFTkSuQmCC',
      },
    },
  ] as MkpApplicationConfig[];
  localStorage.setItem(MarketplaceAppsLocalStorageKey, JSON.stringify(extensions));
};
