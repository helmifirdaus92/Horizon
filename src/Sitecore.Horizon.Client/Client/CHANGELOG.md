# 2018 / 04

## Routes ID

- Id route parameter is added.
- Possible routes are: `/pages`, `/pages/id`, `/pages/insights`, `/pages/insights/id`.
- Changing the id part equals to navigating the main `<router-outlet>`. E.g. the EditorComponent would be destroyed and re-instantiated when navigating from `/pages/1` to `/pages/2`.

LHS and RHS outlets are not affected by the navigation, but it is possible to make them navigate as well by changing the Routes configuration.

Editor routes where only main outlet navigates (current behavior):
```ts
const editorRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: EditorComponent,
      },
      {
        path: ':id',
        component: EditorComponent,
      },
      {
        path: '',
        component: EditorLhsComponent,
        outlet: 'lhs',
      },
      {
        path: '',
        component: EditorRhsComponent,
        outlet: 'rhs',
      },
    ],
  },
];
```

Editor routes where all outlets navigate:
```ts
const editorRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: EditorComponent,
      },
      {
        path: '',
        component: EditorLhsComponent,
        outlet: 'lhs',
      },
      {
        path: '',
        component: EditorRhsComponent,
        outlet: 'rhs',
      },
    ],
  },
  {
    path: ':id',
    children: [
      {
        path: '',
        component: EditorComponent,
      },
      {
        path: '',
        component: EditorLhsComponent,
        outlet: 'lhs',
      },
      {
        path: '',
        component: EditorRhsComponent,
        outlet: 'rhs',
      },
    ],
  },
];
```

# 2018 / 02

## Canvas state
We considered the possibility to leave the canvas out of the routing so that it would not be removed upon navigation in the following way:

```html
<app-editor></app-editor>
<router-outlet></router-outlet>
```

The decision is to try to avoid that as it would be a workaround. We will be exploring other ways to preserve that state, for example as a feature of the canvas itself to recover the state where it was left.

## Feature Modules and Preloading
- Feature modules and routes are added to Pages, Editor, Insights and Simulator. 
- Each of these features now has a `{feature_name}.module` and a `{feature_name}-routing.module` files.
- App routing structure is set to `PreloadAllModules` so that feature areas will start loading as soon as active page has been loaded and rendered.

## Route animations
[Angular animations](https://angular.io/guide/animations) are used for the route animations. Angular animations make it possible to animate *entering* and *leaving* components at the same time. Without Angular animations, it would only be possible to sequentially animate the leaving components first and the entering ones after.

- There is a cross-fade animation between editor and insights
- There is an animation between pages and simulator that collapses/expands the LHS, RHS and header.

## Routing
- There are two root routes: `/pages` and `/simulator`
- Pages has two child routes: `''` (editor) and `/insights`
- The editor activates multiple outlets with the same path, following [this technique](https://angular.io/api/router/Routes#componentless-routes)

```ts
const editorRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: EditorComponent,
      },
      {
        path: '',
        component: EditorLhsComponent,
        outlet: 'lhs',
      },
      {
        path: '',
        component: EditorRhsComponent,
        outlet: 'rhs',
      },
    ],
  },
];
```

## Layout
The layout of the pages section uses the Page components from the library.

Thre are three content areas:
- LHS
- Main
- RHS

To dynamically load content in the different areas based on the **active route** the application uses 3 router outlets, one for each area.

Exceptionally the LHS always loads the item tree (`app-left-hand-side` component) in addition to any other component that the router may activate. This is because the item tree is shared between routes.

```html
<hrz-split-pane>
  <app-left-hand-side></app-left-hand-side>
  <router-outlet name="lhs"></router-outlet>
</hrz-split-pane>
```
