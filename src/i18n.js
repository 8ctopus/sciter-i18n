import i18next from "../../../i18next/i18next/src/index.js";
import * as sys from "@sys";
import {encode,decode} from "@sciter";

export class i18n
{
    static #i18next;

    static #debug;
    static #timer;
    static #translated;
    static #missing;

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
            i18n.#timer      = new Date();
            i18n.#translated = 0;
            i18n.#missing    = [];
        }

        // get all elements to translate
        element.$$("[data-i18n]").forEach(function(element) {
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
                case "radio":
                case "span":
                    if (element.innerHTML.indexOf("<") === -1)
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

                case "plaintext":
                    i18n.#plaintext(element);
                    break;

                default:
                    console.warn(`i18n - unknown element - ${element.tag}`);
                    break;
            }
        });

        i18n.#timer = new Date() - i18n.#timer;

        if (i18n.#debug) {
            let total = i18n.#translated + i18n.#missing.length;

            let percentage = Math.round(i18n.#translated / total * 100, 1);

            console.log(`i18n translate - OK - ${i18n.#translated} / ${total} (${percentage}%) - ${i18n.#timer} ms`);

            i18n.#missing.forEach(function(key) {
                console.log(`i18n missing - ${key}`);
            });
        }

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
            case 2:
                // first argument is key, second is default message
                return i18n.#t(
                    arguments.length === 2 ? arguments[0] : "",
                    arguments.length === 2 ? arguments[1] : arguments[0],
                );

            default:
                console.error(`i18n::m expects 1 or 2 arguments`);
                return "";
        }
    }

    /**
     * Get translation
     * @param string data - data-i18n attribute value
     * @param string text - text to translate
     * @return string translated text
     */
    static #t(data, text)
    {
        let key, options;

        if (data.length)
            key = data;
        else {
            key = text;

            // text may contain : and . which are used internally by i18next
            options = {
                nsSeparator: false,
                keySeparator: false,
            };
        }

        if (i18n.#debug) {
            if (!i18n.#i18next.exists(key, options))
                i18n.#missing.push(key);
            else
                i18n.#translated++;
        }

        // https://www.i18next.com/translation-function/essentials#essentials
        return i18n.#i18next.t(key, {
            defaultValue: text + " (i18n)",
            ...options,
        });
    }

    /**
     * Translate inner text
     * @param element
     * @return void
     */
    static #innerText(element)
    {
        element.innerText = i18n.#t(element.attributes["data-i18n"] ?? "", element.innerText);
    }

    /**
     * Translate inner html
     * @param element
     * @return void
     */
    static #innerHtml(element)
    {
        // search parts to translate
        const match = element.innerHTML.match(/^([^<]*)<.*>([^<]*)$/m);

        // nothing to translate
        if (match === null)
            return;

        // loop through matches
        for (let i = 1; i <= 2; ++i) {
            if (!match[i])
                continue;

            // get text to translate
            const source = match[i].trim();

            if (source.length === 0)
                continue;

            //console.log(`source "${source}"`);

            element.innerHTML = element.innerHTML.replace(source, i18n.#t(element.attributes["data-i18n"] ?? "", source));
            break;
        }
    }

    /**
     * Translate placeholder
     * @param DOMElement element
     * @return void
     */
    static #placeholder(element)
    {
        if (!element.hasAttribute("placeholder"))
            return;

        const key = element.attributes["data-i18n"] ? element.attributes["data-i18n"] + "-placeholder" : "";

        element.attributes["placeholder"] = i18n.#t(key, element.attributes["placeholder"]);
    }

    /**
     * Translate plaintext
     * @param DOMElement element
     * @return void
     */
    static #plaintext(element)
    {
        // sometimes plaintext is undefined for some reason, this fixes it
        if (typeof element.plaintext === "undefined")
            return;

        element.plaintext.content = i18n.#t(element.attributes["data-i18n"] ?? "", element.plaintext.content);
    }
}
