import i18next from "../../../i18next/i18next/src/index.js";
import * as sys from "@sys";
import {encode,decode} from "@sciter";

export class i18n
{
    static #i18next;

    /**
     * Initialize engine
     * @param string locale
     * @param string url locale url or file
     * @return bool true on success, false otherwise
     */
    static init(locale, url)
    {
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
    }

    /**
     * Get message translation
     * @param string(optional) key
     * @param string msg
     * @return string translation or original message if the translation does not exist
     */
    static m()
    {
        switch (arguments.length) {
            case 1:
                // message is key
                return i18n.t(arguments[0], arguments[0]);

            case 2:
                // first argument is key, second is default message
                return i18n.t(arguments[0], arguments[1]);

            default:
                console.error(`i18n m arguments expects 1 or 2 arguments`);
                return "";
        }
    }

    /**
     * Get key translation
     * @param string key
     * @param object options
     * @return string
     */
    static t(key, options = null)
    {
        return i18n.#i18next.t(key, options);
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

        element.innerHTML = i18n.t(key, element.innerText + " (i18n)");
    }

    /**
     * Translate inner html
     * @param element
     * @return void
     */
    static #innerHtml(element)
    {
        // get all html elements
        let content = element.innerHTML;

        let matches = Array.from(content.matchAll(/^([^<]*)<.*>([^<]*)$/gm));

        matches.forEach(function(match) {
            let key = match[1].trim();

            if (key.length !== 0) {
                //console.log(`full - ${match[0]} - key - "${key}"`);
                content = content.replace(key, i18n.t(key, key + " (i18n)"));
            }

            key = match[2].trim();

            if (key.length !== 0) {
                //console.log(`full - ${match[0]} - key - "${key}"`);
                content = content.replace(key, i18n.t(key, key + " (i18n)"));
            }
        });

        if (matches)
            element.innerHTML = content;
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

        element.attributes["placeholder"] = i18n.t(key, element.attributes["placeholder"] + " (i18n)");
    }
}
