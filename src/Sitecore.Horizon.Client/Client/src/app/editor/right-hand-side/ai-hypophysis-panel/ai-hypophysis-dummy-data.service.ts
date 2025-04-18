/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { SuggestionCategory } from './ai-hypophysis-panel.component';

@Injectable({ providedIn: 'root' })
export class AiHypophysisDummyDataService {
  getDummyComponentsData(): Observable<SuggestionCategory[]> {
    return of(randomItemsFromArray(componentItems)).pipe(delay(randomNumber(1, 10) * 200));
  }
  getDummyPageData(): Observable<SuggestionCategory[]> {
    return of([randomItemsFromArray(pageItems)[0]]).pipe(delay(randomNumber(1, 10) * 200));
  }
}

function randomItemsFromArray<T>(arr: T[]): T[] {
  const newArray = JSON.parse(JSON.stringify(arr));

  return newArray.filter(() => 2 > randomNumber(1, 3));
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

const pageItems: SuggestionCategory[] = [
  {
    name: 'Home page',
    tips: [
      {
        text: 'Adding a prominent call-to-action (CTA) button will increase user engagement.',
        tags: ['Increase user engagement and conversions'],
      },
      {
        text: 'Featuring customer testimonials will build trust and reduce bounce rates.',
        tags: ['Reduce bounce rates and increase time on site'],
      },
      {
        text: 'Personalizing content based on user location will improve relevance and engagement.',
        tags: ['Increase relevance and user satisfaction'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'About Us',
    tips: [],
    suggestions: [
      {
        text: 'Showcasing the company’s mission and values will build a stronger connection with users.',
        tags: ['Build connection'],
      },
      {
        text: 'Including team bios will humanize the brand.',
        tags: ['Humanize brand'],
      },
    ],
  },
  {
    name: 'Services',
    tips: [
      {
        text: 'Clearly listing all services offered will reduce user confusion.',
        tags: ['Reduce confusion'],
      },
      {
        text: 'Using icons for each service will improve readability.',
        tags: ['Improve readability'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Contact Us',
    tips: [],
    suggestions: [
      {
        text: 'Providing multiple contact methods will improve user satisfaction.',
        tags: ['Improve satisfaction'],
      },
    ],
  },
  {
    name: 'Blog',
    tips: [
      {
        text: 'Regularly updating blog content will increase SEO rankings.',
        tags: ['Increase SEO rankings'],
      },
      {
        text: 'Using attractive images in blog posts will increase reader engagement.',
        tags: ['Increase engagement'],
      },
      {
        text: 'Allowing comments on blog posts will create a sense of community.',
        tags: ['Create community'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Product Page',
    tips: [],
    suggestions: [
      {
        text: 'Including high-quality product images will increase purchase likelihood.',
        tags: ['Increase purchases'],
      },
      {
        text: 'Providing detailed product descriptions will reduce return rates.',
        tags: ['Reduce returns'],
      },
    ],
  },
  {
    name: 'Careers',
    tips: [
      {
        text: 'Highlighting company culture will attract better candidates.',
        tags: ['Attract candidates'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'FAQ',
    tips: [],
    suggestions: [
      {
        text: 'Grouping questions by topic will make it easier for users to find answers.',
        tags: ['Improve navigation'],
      },
      {
        text: 'Including a search bar in the FAQ will increase usability.',
        tags: ['Increase usability'],
      },
    ],
  },
  {
    name: 'Testimonials',
    tips: [
      {
        text: 'Featuring video testimonials will build more trust than text alone.',
        tags: ['Build trust'],
      },
      {
        text: 'Rotating testimonials automatically will keep the page dynamic.',
        tags: ['Enhance dynamics'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Portfolio',
    tips: [],
    suggestions: [
      {
        text: 'Displaying project case studies will provide deeper insights into your work.',
        tags: ['Provide insights'],
      },
      {
        text: 'Using a filter option will help users find relevant projects.',
        tags: ['Improve navigation'],
      },
    ],
  },
  {
    name: 'Privacy Policy',
    tips: [
      {
        text: 'Keeping the language simple and clear will improve user understanding.',
        tags: ['Improve understanding'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Terms of Service',
    tips: [],
    suggestions: [
      {
        text: 'Highlighting key points at the top will ensure users see important information first.',
        tags: ['Highlight key points'],
      },
    ],
  },
  {
    name: 'Help Center',
    tips: [
      {
        text: 'Providing video tutorials will assist users in understanding complex features.',
        tags: ['Assist understanding'],
      },
      {
        text: 'Including a live chat option will offer instant support.',
        tags: ['Offer support'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Pricing',
    tips: [],
    suggestions: [
      {
        text: 'Displaying prices clearly and upfront will reduce confusion.',
        tags: ['Reduce confusion'],
      },
      {
        text: 'Offering a comparison chart will help users choose the right plan.',
        tags: ['Aid decision making'],
      },
    ],
  },
  {
    name: 'E-commerce Homepage',
    tips: [
      {
        text: 'Featuring best-selling products will drive sales.',
        tags: ['Drive sales'],
      },
      {
        text: 'Offering personalized recommendations will increase average order value.',
        tags: ['Increase AOV'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Gallery',
    tips: [],
    suggestions: [
      {
        text: 'Using high-resolution images will enhance user experience.',
        tags: ['Enhance experience'],
      },
      {
        text: 'Organizing images by category will improve navigation.',
        tags: ['Improve navigation'],
      },
    ],
  },
  {
    name: 'User Dashboard',
    tips: [
      {
        text: 'Displaying user activity stats will increase engagement.',
        tags: ['Increase engagement'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Event Page',
    tips: [],
    suggestions: [
      {
        text: 'Highlighting upcoming events will encourage attendance.',
        tags: ['Encourage attendance'],
      },
      {
        text: 'Providing event registration directly on the page will improve convenience.',
        tags: ['Improve convenience'],
      },
    ],
  },
  {
    name: 'Testimonials Page',
    tips: [
      {
        text: 'Featuring client logos alongside testimonials will build credibility.',
        tags: ['Build credibility'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Sign Up Page',
    tips: [],
    suggestions: [
      {
        text: 'Simplifying the sign-up form will increase conversion rates.',
        tags: ['Increase conversions'],
      },
      {
        text: 'Offering social media sign-up options will reduce friction.',
        tags: ['Reduce friction'],
      },
    ],
  },
  {
    name: 'Login Page',
    tips: [
      {
        text: 'Including a “Remember Me” option will improve user convenience.',
        tags: ['Improve convenience'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Reset Password Page',
    tips: [],
    suggestions: [
      {
        text: 'Using a simple and secure password reset process will enhance user security.',
        tags: ['Enhance security'],
      },
    ],
  },
  {
    name: 'Subscription Page',
    tips: [
      {
        text: 'Highlighting the benefits of subscribing will increase conversions.',
        tags: ['Increase conversions'],
      },
      {
        text: 'Offering a free trial period will attract more subscribers.',
        tags: ['Attract subscribers'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Checkout Page',
    tips: [],
    suggestions: [
      {
        text: 'Including multiple payment options will increase sales.',
        tags: ['Increase sales'],
      },
      {
        text: 'Displaying a progress bar will reduce cart abandonment.',
        tags: ['Reduce abandonment'],
      },
    ],
  },
  {
    name: 'Shipping Information Page',
    tips: [
      {
        text: 'Providing detailed shipping options will reduce customer inquiries.',
        tags: ['Reduce inquiries'],
      },
      {
        text: 'Offering free shipping for orders over a certain amount will increase order value.',
        tags: ['Increase order value'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Order Confirmation Page',
    tips: [],
    suggestions: [
      {
        text: 'Thanking customers for their purchase will improve customer satisfaction.',
        tags: ['Improve satisfaction'],
      },
      {
        text: 'Providing order tracking information will enhance the post-purchase experience.',
        tags: ['Enhance experience'],
      },
    ],
  },
  {
    name: '404 Page',
    tips: [
      {
        text: 'Offering a search bar will help users find what they’re looking for.',
        tags: ['Improve navigation'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Maintenance Page',
    tips: [],
    suggestions: [
      {
        text: 'Providing an estimated time for maintenance completion will reduce user frustration.',
        tags: ['Reduce frustration'],
      },
      {
        text: 'Offering alternative contact information will help users during maintenance.',
        tags: ['Provide alternatives'],
      },
    ],
  },
  {
    name: 'Coming Soon Page',
    tips: [
      {
        text: 'Including an email sign-up form will keep users informed about the launch.',
        tags: ['Keep informed'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Landing Page',
    tips: [],
    suggestions: [
      {
        text: 'Using a compelling headline will grab attention.',
        tags: ['Grab attention'],
      },
      {
        text: 'Featuring a strong call to action will improve conversion rates.',
        tags: ['Improve conversions'],
      },
    ],
  },
  {
    name: 'Sitemap Page',
    tips: [
      {
        text: 'Organizing the sitemap logically will improve user experience.',
        tags: ['Improve experience'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Mobile Homepage',
    tips: [],
    suggestions: [
      {
        text: 'Ensuring fast load times will improve mobile user experience.',
        tags: ['Improve experience'],
      },
      {
        text: 'Using touch-friendly design elements will increase usability.',
        tags: ['Increase usability'],
      },
    ],
  },
  {
    name: 'Resources Page',
    tips: [
      {
        text: 'Providing downloadable resources will increase user engagement.',
        tags: ['Increase engagement'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Affiliate Page',
    tips: [],
    suggestions: [
      {
        text: 'Including testimonials from successful affiliates will attract new partners.',
        tags: ['Attract partners'],
      },
      {
        text: 'Providing clear commission details will improve transparency.',
        tags: ['Improve transparency'],
      },
    ],
  },
  {
    name: 'Press Page',
    tips: [
      {
        text: 'Featuring recent press releases will keep users informed.',
        tags: ['Keep informed'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Partners Page',
    tips: [],
    suggestions: [
      {
        text: 'Highlighting key partners will build credibility.',
        tags: ['Build credibility'],
      },
      {
        text: 'Providing partnership benefits will attract new partners.',
        tags: ['Attract partners'],
      },
    ],
  },
  {
    name: 'Case Studies Page',
    tips: [],
    suggestions: [
      {
        text: 'Using detailed case studies will demonstrate the effectiveness of your solutions.',
        tags: ['Demonstrate effectiveness'],
      },
    ],
  },
  {
    name: 'Community Page',
    tips: [
      {
        text: 'Featuring user-generated content will increase community engagement.',
        tags: ['Increase engagement'],
      },
    ],
    suggestions: [],
  },
];

const componentItems: SuggestionCategory[] = [
  {
    name: 'Footer',
    tips: [
      {
        text: 'Adding social media links will increase brand engagement.',
        tags: ['Increase engagement'],
      },
      {
        text: 'Simplifying footer layout improves accessibility.',
        tags: ['Enhance accessibility'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Contact Form',
    tips: [],
    suggestions: [
      {
        text: 'Including a CAPTCHA will reduce spam submissions.',
        tags: ['Reduce spam'],
      },
      {
        text: 'Offering a live chat option will improve customer support.',
        tags: ['Improve support'],
      },
    ],
  },
  {
    name: 'Header',
    tips: [
      {
        text: 'Making the logo clickable enhances navigation.',
        tags: ['Enhance navigation'],
      },
      {
        text: 'Keeping the header sticky improves user experience.',
        tags: ['Enhance user experience'],
      },
      {
        text: 'Reducing header height gives more space for content.',
        tags: ['Maximize content space'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Product Page',
    tips: [],
    suggestions: [
      {
        text: 'Using high-quality images will attract more customers.',
        tags: ['Increase attraction'],
      },
      {
        text: 'Adding customer reviews will build trust.',
        tags: ['Build trust'],
      },
    ],
  },
  {
    name: 'Checkout Process',
    tips: [
      {
        text: 'Simplifying checkout steps will reduce cart abandonment.',
        tags: ['Reduce abandonment'],
      },
      {
        text: 'Providing multiple payment options increases conversion.',
        tags: ['Increase conversion'],
      },
      {
        text: 'Highlighting security features reassures customers.',
        tags: ['Reassure customers'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Blog',
    tips: [],
    suggestions: [
      {
        text: 'Featuring popular posts on the sidebar increases engagement.',
        tags: ['Increase engagement'],
      },
      {
        text: 'Enabling comments encourages community interaction.',
        tags: ['Encourage interaction'],
      },
      {
        text: 'Adding related posts at the end retains readers longer.',
        tags: ['Retain readers'],
      },
    ],
  },
  {
    name: 'User Profile',
    tips: [
      {
        text: 'Allowing users to customize profiles enhances engagement.',
        tags: ['Enhance engagement'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Notifications',
    tips: [],
    suggestions: [
      {
        text: 'Offering customizable notification settings improves user satisfaction.',
        tags: ['Improve satisfaction'],
      },
    ],
  },
  {
    name: 'Sidebar',
    tips: [
      {
        text: 'Making the sidebar collapsible enhances user control.',
        tags: ['Enhance control'],
      },
      {
        text: 'Highlighting important links in the sidebar improves navigation.',
        tags: ['Improve navigation'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'FAQ Section',
    tips: [],
    suggestions: [
      {
        text: 'Grouping FAQs by category simplifies finding answers.',
        tags: ['Simplify navigation'],
      },
    ],
  },
  {
    name: 'Testimonials',
    tips: [
      {
        text: 'Featuring video testimonials builds stronger trust.',
        tags: ['Build trust'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Landing Page',
    tips: [],
    suggestions: [
      {
        text: 'Including a clear call to action improves conversions.',
        tags: ['Improve conversions'],
      },
      {
        text: 'Using a compelling headline grabs attention.',
        tags: ['Grab attention'],
      },
    ],
  },
  {
    name: 'About Us Page',
    tips: [
      {
        text: 'Telling a compelling story enhances connection with users.',
        tags: ['Enhance connection'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Help Center',
    tips: [],
    suggestions: [
      {
        text: 'Offering live support chat improves customer satisfaction.',
        tags: ['Improve satisfaction'],
      },
      {
        text: 'Including video tutorials aids in understanding.',
        tags: ['Aid understanding'],
      },
    ],
  },
  {
    name: 'Settings',
    tips: [
      {
        text: 'Providing a search function in settings simplifies navigation.',
        tags: ['Simplify navigation'],
      },
      {
        text: 'Grouping settings by category enhances usability.',
        tags: ['Enhance usability'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Events Page',
    tips: [],
    suggestions: [
      {
        text: 'Highlighting upcoming events attracts more attendees.',
        tags: ['Attract attendees'],
      },
    ],
  },
  {
    name: 'Pricing Page',
    tips: [
      {
        text: 'Displaying pricing tiers clearly aids in decision making.',
        tags: ['Aid decision making'],
      },
      {
        text: 'Including a FAQ section on pricing clarifies common questions.',
        tags: ['Clarify questions'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Sign Up Form',
    tips: [],
    suggestions: [
      {
        text: 'Keeping the form short increases completion rates.',
        tags: ['Increase completion'],
      },
    ],
  },
  {
    name: 'Dashboard',
    tips: [
      {
        text: 'Displaying key metrics upfront improves user efficiency.',
        tags: ['Improve efficiency'],
      },
      {
        text: 'Allowing dashboard customization enhances user experience.',
        tags: ['Enhance experience'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'News Section',
    tips: [],
    suggestions: [
      {
        text: 'Highlighting top stories keeps users informed.',
        tags: ['Keep informed'],
      },
    ],
  },
  {
    name: 'User Onboarding',
    tips: [
      {
        text: 'Using interactive tutorials improves onboarding experience.',
        tags: ['Improve experience'],
      },
      {
        text: 'Providing progress indicators helps users track their onboarding journey.',
        tags: ['Track progress'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Contact Us Page',
    tips: [],
    suggestions: [
      {
        text: 'Including a map helps users find physical locations easily.',
        tags: ['Improve navigation'],
      },
    ],
  },
  {
    name: 'Forum',
    tips: [
      {
        text: 'Enforcing guidelines maintains a healthy community.',
        tags: ['Maintain community'],
      },
      {
        text: 'Offering badges for participation encourages engagement.',
        tags: ['Encourage engagement'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Newsletter Signup',
    tips: [],
    suggestions: [
      {
        text: 'Providing a preview of newsletter content attracts more signups.',
        tags: ['Attract signups'],
      },
    ],
  },
  {
    name: 'Product Reviews',
    tips: [
      {
        text: 'Allowing users to filter reviews by rating improves usability.',
        tags: ['Improve usability'],
      },
      {
        text: 'Highlighting top reviews builds trust.',
        tags: ['Build trust'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Live Chat',
    tips: [],
    suggestions: [
      {
        text: 'Offering 24/7 live chat support increases user satisfaction.',
        tags: ['Increase satisfaction'],
      },
    ],
  },
  {
    name: 'Survey',
    tips: [
      {
        text: 'Keeping surveys short increases completion rates.',
        tags: ['Increase completion'],
      },
      {
        text: 'Offering incentives for survey completion boosts participation.',
        tags: ['Boost participation'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Media Player',
    tips: [],
    suggestions: [
      {
        text: 'Providing closed captions improves accessibility.',
        tags: ['Improve accessibility'],
      },
      {
        text: 'Allowing speed adjustments caters to user preferences.',
        tags: ['Cater preferences'],
      },
    ],
  },
  {
    name: 'Feedback Form',
    tips: [
      {
        text: 'Including an optional feedback field gathers more insights.',
        tags: ['Gather insights'],
      },
      {
        text: 'Making feedback anonymous encourages honesty.',
        tags: ['Encourage honesty'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Registration Page',
    tips: [],
    suggestions: [
      {
        text: 'Offering a social login option simplifies the registration process.',
        tags: ['Simplify registration'],
      },
      {
        text: 'Using a progress bar helps users see their registration progress.',
        tags: ['Track progress'],
      },
    ],
  },
  {
    name: 'Content Management System',
    tips: [
      {
        text: 'Providing a drag-and-drop interface simplifies content creation.',
        tags: ['Simplify creation'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Search Results Page',
    tips: [],
    suggestions: [
      {
        text: 'Displaying the number of results found helps users gauge search effectiveness.',
        tags: ['Gauge effectiveness'],
      },
      {
        text: 'Highlighting the search term in results improves readability.',
        tags: ['Improve readability'],
      },
    ],
  },
  {
    name: 'Subscription Plan',
    tips: [
      {
        text: 'Offering a free trial period increases conversions.',
        tags: ['Increase conversions'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'E-commerce Cart',
    tips: [],
    suggestions: [
      {
        text: 'Providing a cart summary improves transparency.',
        tags: ['Improve transparency'],
      },
      {
        text: 'Highlighting discounts and offers increases sales.',
        tags: ['Increase sales'],
      },
    ],
  },
  {
    name: 'Video Gallery',
    tips: [
      {
        text: 'Organizing videos by category enhances navigation.',
        tags: ['Enhance navigation'],
      },
    ],
    suggestions: [],
  },
  {
    name: 'Customer Service',
    tips: [],
    suggestions: [
      {
        text: 'Offering multiple contact options improves accessibility.',
        tags: ['Improve accessibility'],
      },
    ],
  },
  {
    name: 'Event Registration',
    tips: [
      {
        text: 'Providing early bird discounts increases registrations.',
        tags: ['Increase registrations'],
      },
    ],
    suggestions: [],
  },
];
