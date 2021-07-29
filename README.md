# sciter i18n

A translation engine for [sciter.js](https://sciter.com/) on top of [i18next](https://www.i18next.com/).

![sciter i18n screenshot](screenshot.png)

## demo

- git clone the repository
- run `install.bat` to download the latest sciter binaries and the sciter package manager
- install packages `php spm.phar install`
- run `scapp.bat`
- to refresh the app after changes to the html/css click `F5`

## install

- add the `src` dir to your project or use the sciter package manager
- in `<script type="module">`

```js
import {i18n} from "src/i18n.js";

document.on("ready", function() {
    const locale  = "fr";
    const file    = URL.toPath(__DIR__ + `locales/${locale}.json`);
    const config = {
        // i18n logging
        logging: true,

        // debug i18next
        debug: true,
    };

    // initialize translation engine
    if (i18n.init(locale, file, config)) {
        console.log("i18n init - OK");

        // translate window
        i18n.i18n(document);
    }
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
let message = i18n.m("no-update", "Widget could not be updated.");

// with a single argument, it's both the key and the default value
let message = i18n.m("Widget could not be updated.");
```

## interpolation

The basics

```js
let message = i18n.m("Widget failed with error {{error_number}}.", { eror_number: 18 });
```

Interpolation can also be set at initialization to apply to all translations.

```js
const config = {
    interpolation = {
        defaultVariables: {
            name: "Yuri",
            country: "Russia",
        },
    },
};

i18n.init(locale, path, config);

let message = i18n.m("My name is {{name}} and I'm from {{country}}.");
```

## todo

- go through [nodes instead of innerHtml](https://sciter.com/forums/topic/menu-items-innerhtml-recursive-update/)
- i18next file system backend or fetch backend
- add missing ids to json
- how to deal with interface refresh?
