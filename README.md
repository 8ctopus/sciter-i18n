# sciter i18n

This is an attempt to create a translation engine for [sciter.js](https://sciter.com/) on top of [i18next](https://www.i18next.com/).

## demo

- git clone the repository
- run `install.bat` to download the latest sciter binaries, library and the sciter package manager
- install packages `php spm.phar install`
- start `scapp.exe`
- to refresh the app after changes to the html/css click `F5`

## install

- add the `src` dir to your project
- then in the html code add attribute `data-i18n` to all elements you want translated. If `data-i18n` value is set then it will be used as the translation key.

```html
<h1 data-i18n="key1">i18n engine test</h1>
```

- otherwise the element's `innerHTML` will be the key

```html
<h1 data-i18n>h1</h1>
```

- translate in code

```js
// with 2 arguments, first serves as key, second as default value (better option)
let message = i18n.m("no-update", "Widget could not be updated.");

// with a single argument, it's both the key and the default value
let message = i18n.m("Widget could not be updated.");
```
