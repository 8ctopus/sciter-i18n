import i18next from "../../../i18next/i18next/src/index.js";
import * as sys from "@sys";
import {encode,decode} from "@sciter";

export class i18n
{
    static #i18next;
    static #timer;
    static #debug;
    static #count;

    /**
     * Initialize engine
     * @param string locale
     * @param string url locale url or file
     * @param bool debug
     * @return bool true on success, false otherwise
     */
    static init(locale, url, debug)
    {
        if (debug)
            i18n.#debug = true;

        // get url content
        let result = fetch(url, {sync: true});

        if (!result.ok) {
            console.error(`i18n init - FAILED - fetch - ${result.status} - ${url}`);
            return false;
        }

        // convert to json
        let json;

        try {
            json = result.json();
        } catch (e) {
            console.error(`i18n init - FAILED - json - ${e.message} ${e.stack}`);
            return false;
        }

        result = false;

        // init translation system
        i18n.#i18next = i18next;

        i18next.init({
            // i18next debugging
            debug: false,

            // wait for resources to be loaded before returning from call
            // but it does not apply in our case as the translation is already provided for
            initImmediate: false,

            // set language
            lng: locale,

            // set translation
            resources: {
                [locale]: json,
            }
        }, function(error, t) {
            // callback when initialization is complete
            if (!error)
                result = true;
            else
                console.error(`i18n init - ${error}`);
        });

        return result;
    }

    /**
     * Translate element
     * @param element
     * @return void
     */
    static i18n(element)
    {
        if (i18n.#debug) {
            i18n.#timer = new Date();
            i18n.#count = 0;
        }

        // get all elements to translate
        element.$$("[data-i18n]").map(function(element) {
            switch (element.tag) {
                case "button":
                case "caption":
                case "checkbox":
                case "div":
                case "h1":
                case "h2":
                case "h3":
                case "h4":
                case "h5":
                case "h6":
                case "label":
                case "li":
                case "option":
                case "p":
                case "plaintext":
                case "radio":
                case "span":
                    if (element.innerText === element.innerHTML)
                        i18n.#innerText(element);
                    else
                        i18n.#innerHtml(element);

                    break;

                case "editbox":
                case "input":
                    i18n.#placeholder(element);
                    break;

                case "select":
                    // get select caption
                    const child = element.$("caption");

                    if (child !== null)
                        i18n.#innerText(child);

                    break;

                default:
                    console.warn(`i18n - unknown element - ${element.tag}`);
                    break;
            }
        });

        i18n.#timer = new Date() - i18n.#timer;

        if (i18n.#debug)
            console.log(`i18n - ${i18n.#count} elements - ${i18n.#timer} ms`);
    }

    /**
     * Get message translation
     * @param string (optional) key
     * @param string msg
     * @return string translation or original message if the translation does not exist
     */
    static m()
    {
        switch (arguments.length) {
            case 1:
                // message is key
                return i18n.#t(arguments[0], arguments[0]);

            case 2:
                // first argument is key, second is default message
                return i18n.#t(arguments[0], arguments[1]);

            default:
                console.error(`i18n::m expects 1 or 2 arguments`);
                return "";
        }
    }

    /**
     * Get translation
     * @param string key
     * @param string value default value
     * @return string
     */
    static #t(key, value)
    {
        if (i18n.#debug) {
            if (!i18n.#i18next.exists(key))
                console.log("i18n - translation missing - " + key);
            else
                i18n.#count++;
        }

        // https://www.i18next.com/translation-function/essentials#essentials
        return i18n.#i18next.t(key, value);
    }

    /**
     * Translate inner text
     * @param element
     * @return void
     */
    static #innerText(element)
    {
        // use data-i18n key if it exists, otherwise element inner text as key
        const key = !!element.attributes["data-i18n"] ? element.attributes["data-i18n"] : element.innerText;

        element.innerHTML = i18n.#t(key, element.innerText + " (i18n)");
    }

    /**
     * Translate inner html
     * @param element
     * @return void
     */
    static #innerHtml(element)
    {
        // search
        let match = element.innerHTML.match(/^([^<]*)<.*>([^<]*)$/);

        // nothing to translate
        if (match === null)
            return;

        for (let i = 1; i <= 2; ++i) {
            if (!match[i])
                continue;

            // get text to translate
            let source = match[i].trim();

            if (source.length === 0)
                continue;

            // use data-i18n key if it exists, otherwise source as key
            let key = !!element.attributes["data-i18n"] ? element.attributes["data-i18n"] : source;

            if (key.length === 0)
                continue;

            //console.log(`source - ${source} - key - ${key} - ` + i18n.m(key, source + " (i18n)"));
            element.innerHTML = element.innerHTML.replace(source, i18n.#t(key, source + " (i18n)"));
        }
    }

    /**
     * Translate placeholder
     * @param element
     * @return void
     */
    static #placeholder(element)
    {
        if (!element.hasAttribute("placeholder"))
            return;

        // use data-i18n key if it exists, otherwise element inner html as key
        let key = !!element.attributes["data-i18n"] ? element.attributes["data-i18n"] + "placeholder" : element.attributes["placeholder"];

        element.attributes["placeholder"] = i18n.#t(key, element.attributes["placeholder"] + " (i18n)");
    }
}
