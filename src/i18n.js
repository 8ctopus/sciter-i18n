import i18next from "../vendor/i18next/i18next/src/index.js";
import * as sys from "@sys";
import {encode,decode} from "@sciter";

export class i18n
{
    static #i18next;

    /**
     * Initialize translation engine
     * @return bool true on success, false otherwise
     */
    static init()
    {
        let buffer = sys.fs.$readfile("locales/fr.json");
        buffer = decode(buffer);

        const fr = JSON.parse(buffer);

        i18n.#i18next = i18next;

        let result = false;

        // init translation system
        i18next.init({
            debug: true,

            initImmediate: false,

            lng: "fr",

            resources: {
                fr: fr,
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
                    i18n.#innerHtml(element);
                    break;

                case "editbox":
                case "input":
                    i18n.#placeholder(element);
                    break;

                case "select":
                    // get select caption
                    const child = element.$("caption");

                    if (child != null)
                        i18n.#innerHtml(child);

                    break;

                default:
                    console.warning(`i18n - unknown element - ${element.tag}`);
                    break;
            }
        });
    }

    /**
     * Get message translation
     * @param string msg
     * @return string translation or original message if the translation does not exist
     */
    static message(msg)
    {
        return i18n.t(msg, msg);
    }

    /**
     * Shorter variant of get message translation
     * @see message()
     */
    static m(str)
    {
        return i18n.message(str, { keySeparator: "|", nsSeparator: "#"});
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
     * Translate inner html
     * @param element
     * @return void
     */
    static #innerHtml(element)
    {
        element.innerHTML = i18n.t(element.innerHTML, element.innerHTML + " (i18n)");
    }

    /**
     * Translate placeholder
     * @param element
     * @return void
     */
    static #placeholder(element)
    {
        if (element.hasAttribute("placeholder"))
            element.attributes["placeholder"] = i18n.t(element.attributes["placeholder"], element.attributes["placeholder"] + " (i18n)");
    }
}