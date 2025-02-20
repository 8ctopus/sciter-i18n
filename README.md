# sciter i18n

![latest version](https://img.shields.io/npm/v/sciter-i18n.svg)
![downloads](https://img.shields.io/npm/dy/sciter-i18n.svg)

A translation engine for [sciter.js](https://sciter.com/) on top of [i18next](https://www.i18next.com/).

![sciter i18n screenshot](https://github.com/8ctopus/sciter-i18n/raw/master/screenshot.png)

_NOTE_: From 4.4.8.14, sciter.js offers [native translation support](https://github.com/c-smile/sciter-js-sdk/blob/main/docs/md/reactor/JSX-i18n.md).

## demo

- git clone the repository
- install packages `npm install`
- install latest sciter sdk `npm run install-sdk`
- start the demo `npm run scapp`

## demo requirements

- A recent version of Node.js `node` (tested with 22 LTS) and its package manager `npm`.
    - On Windows [download](https://nodejs.dev/download/) and run the installer
    - On Linux check the [installation guide](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04#option-2-%E2%80%94-installing-node-js-with-apt-using-a-nodesource-ppa)

## add to your project

### using npm

- install package `npm install sciter-i18n`

### copy source

- add the `src` dir to your project
- in `<script type="module">`

```js
// import from npm package (preferred)
import I18n from "node_modules/sciter-i18n/src/i18n.js";

// import from src dir (alternative)
import I18n from "src/i18n.js";

document.on("ready", async () => {
    const locale = "fr";
    const file = URL.toPath(__DIR__ + `locales/${locale}.json`);
    const config = {
        // i18n logging
        logging: true,

        // debug i18next
        debug: true,

        compatibilityJSON: 'v3',
    };

    // initialize translation engine
    await I18n.init(locale, file, config);

    // translate window
    I18n.i18n(document);
});
```

- create translation file `locales\fr.json`

```json
{
    "translation": {
        "key1": "test du moteur i18n"
    }
}
```

- then in the html code add attribute `data-i18n` to all elements you want translated. If the `data-i18n` attribute value is set then it will be used as the translation key.

```html
<h1 data-i18n="key1">i18n engine test</h1>
```

- otherwise the element's `innerText` will be the key

```html
<h1 data-i18n>h1</h1>
```

## translate text in code

```js
// with 2 arguments, first serves as key, second as default value (better option)
let message = I18n.m("no-update", "Widget could not be updated.");

// with a single argument, it's both the key and the default value
let message = I18n.m("Widget could not be updated.");
```

## interpolation

The basics

```js
let message = I18n.m("Widget failed with error {{error_number}}.", { eror_number: 18 });
```

Interpolation can also be set at initialization to apply to all translations.

```js
const config = {
    interpolation: {
        defaultVariables: {
            name: "Yuri",
            country: "Russia",
        },
    },
};

I18n.init(locale, path, config);

let message = I18n.m("My name is {{name}} and I'm from {{country}}.");
```

## todo

- i18next file system backend or fetch backend
- add missing ids to json
- how to deal with interface refresh?
- add hjson engine in order to be able to place comments in json
