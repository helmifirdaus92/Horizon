/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule } from '@angular/core';
import { ReversePipe } from './reverse-pipe/reverse.pipe';
import { SearchByPipe } from './search-pipe/search-by.pipe';
import { ShortNumberPipe } from './short-number-pipe/short-number.pipe';
import { SortPipe } from './sort-pipe/sort.pipe';

@NgModule({
  declarations: [ReversePipe, SearchByPipe, SortPipe, ShortNumberPipe],
  imports: [],
  exports: [ReversePipe, SearchByPipe, SortPipe, ShortNumberPipe],
})
export class PipesModule {}
