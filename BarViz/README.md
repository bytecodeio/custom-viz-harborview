# Looker Custom Vis Template (with TypeScript)
A Looker custom visualization with bar charts and custom 'goals' This will report progress towards the targets and highlight each column with colors from a divergent 5-color scheme.

## Development:

Spin up a local development bundle with
`yarn install` and `yarn start`.

Then, visit the served site, which should be visible in the output from yarn start (ie. https://localhost:8080). Try visiting the dev-compiled js file at https://localhost:8080/bar_viz.js.  Trust the local self-signed certificate.

In Looker, this can be accessed in development mode by creating a visualization configuration in the admin -> visualization menu. Simply add the above address  


## Installation:

### Prerequisites:

- [Node](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/)

### Clone this repo and install with:

- ```yarn install```

### Build the project:

- ```yarn build```

### Open the viz

- ```npm start```

### From Looker, enter development mode and add a `visualization` parameter to your project's `manifest.lkml` file:

```
visualization: {
  id: "bar_viz"
  label: "Custom Bar"
  file: "bar_viz.js"
}
```

Copy the file generated during the build, `dist/bar_viz.js`, to the Looker project. Commit the changes to production then the new viz will be available in any explore.

Looker custom visualization references:
- https://github.com/looker/custom_visualizations_v2/blob/master/docs/getting_started.md
- https://github.com/looker/custom_visualizations_v2
- https://cloud.google.com/looker/docs/reference/param-manifest-visualization
