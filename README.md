![Atomico](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/h4.svg)![Atomico](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/h3.svg)

### Hi, I'm [@uppercod](https://twitter.com/uppercod), creator of Atomico and I want to thank you for starting with Atomico.

If you need help you can find it at:

[![twitter](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/twitter.svg)](https://twitter.com/atomicojs)
[![discord](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/discord.svg)](https://discord.gg/7z3rNhmkNE)
[![documentation](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/doc-1.svg)](https://atomico.gitbook.io/doc/)
[![discord](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/doc.svg)](https://webcomponents.dev/edit/collection/F7dm6YnMEDRtAl57RTXU/d6E4w07fsQbb0CelYQac)

Now what you have installed is a quick start kit based on Vite, which you can scale for your project, now to continue you must execute the following commands:

1. `npm install`
2. `npm start` : Initialize the development server
3. `npm build` : Optional, Generate a build of your project from the html file [index.html](index.html).

## Workspace

### Recommended structure

```bash
src
  |- my-component
  |  |- my-component.{js,jsx,ts,tsx}
  |  |- my-component.test.js
  |  |- my-component.css
  |  |- README.md
  |- components.js # import all components
```

### Add testing

The test environment is preconfigured for [vitest](https://vitest.dev/), you must complete the installation of the following devDependencies, installed the devDependencies you can execute the command `npm run test`:

```bash
npm i -D vitest happy-dom
```

You can learn more about the Atomico test api in the [test documentation](https://atomico.gitbook.io/doc/api/testing).

#### Test example

```tsx
import { describe, it, expect } from "vitest";
import { fixture } from "atomico/test-dom";
import { MyComponent } from "./my-component";

describe("MyComponent", () => {
  it("default properties", () => {
    const node = fixture(<MyComponent />);

    expect(node.myProp).toEqual("value");
  });

  it("Check DOM", async () => {
    const node = fixture(<MyComponent />);

    node.showInput = true;

    await node.updated; // or updated

    expect(node.shadowRoot.querySelector("input")).toBeInstanceOf(
      HTMLInputElement
    );
  });
});
```

> `@web/test-runner` supports asynchrony, coverage, [viewport and more](https://modern-web.dev/docs/test-runner/commands/).

### NPM export

Atomico owns the [@atomico/exports](https://atomico.gitbook.io/doc/atomico/atomico-exports) tool that simplifies the generation of builds, types and exports by distributing webcomponents in NPM, you must complete the installation of the following devDependencies, installed the devDependencies you can execute the command `npm run exports`:

```bash
npm install -D @atomico/exports
```

### Postcss

This configuration already depends on Postcss, you can more plugins through `package.json#postcss`, example:

```json
"postcss": {
  "plugins": {
    "postcss-import": {}
  }
}
```

> In case of build, Atomico will minify the CSS code.

### Github page

Add to `package.json#scripts.build`:

```bash
--outDir docs # modify the destination directory
--base my-repo # github page folder
```
