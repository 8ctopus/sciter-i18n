import i18next from "../vendor/i18next/i18next/src/index.js";

export class i18n
{
    static #init = false;

    static #i18next;
    static #defaultValue;

    static #logging;
    static #timer;
    static #translated;
    static #missing;

    /**
     * Initialize engine
     * @param string locale
     * @param string url - url or path to locale
     * @param object (optional) config - i18next config https://www.i18next.com/overview/configuration-options
     * @return bool true on success, false otherwise
     * @note use URL.toPath() for url
     */
    static init(locale, url, config)
    {
        this.#logging      = config.logging || false;
        this.#defaultValue = (config.defaultValue !== undefined) ? config.defaultValue : " (i18n)";

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
            console.error(`i18n init - FAILED - json - ${e.message} - ${e.stack}`);
            return false;
        }

        // init translation system
        this.#i18next = i18next;

        i18next.init({
            // i18next debugging
            debug: false,

            // wait for resources to be loaded before returning from call
            // but it does not apply in our case as the translation is already provided for
            initImmediate: false,

            // set language
            lng: locale,

            // set translation resource
            resources: {
                [locale]: json,
            },

            ...config,
        }, (error, t) => {
            // callback when initialization is complete
            if (!error)
                this.#init = true;
            else
                console.error(`i18n init - FAILED - ${error}`);
        });

        return this.#init;
    }

    /**
     * Translate element and children
     * @param element
     * @return void
     */
    static i18n(element)
    {
        try {
            // check that class was initialized
            if (!this.#init)
                return;

            if (this.#logging) {
                this.#timer      = new Date();
                this.#translated = 0;
                this.#missing    = [];
            }

            // get all children elements to translate
            let elements = element.$$("[data-i18n]");

            // add root element if it needs translation
            if (element.hasAttribute("data-i18n"))
                elements.push(element);

            elements.forEach(function(element) {
                switch (element.tag) {
                    case "a":
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
                    case "a":
                    case "span":
                    case "radio":
                    case "textarea":
                    case "th":
                    case "title":
                    case "td":
                        if (element.innerHTML.indexOf("<") === -1)
                            i18n.#innerText(element);
                        else
                            i18n.#innerHtml(element);

                        i18n.#arialabel(element);

                        break;

                    case "window-button":
                        i18n.#arialabel(element);
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

                    case "htmlarea":
                        i18n.#htmlarea(element);
                        break;

                    default:
                        console.warn(`i18n - unknown element - ${element.tag}`);
                        break;
                }
            });

            if (this.#logging) {
                this.#timer = new Date() - this.#timer;

                let total = this.#translated + this.#missing.length;

                let percentage = Math.round(this.#translated / total * 100, 1);

                console.log(`i18n translate - OK - ${this.#translated} / ${total} (${percentage}%) - ${this.#timer} ms`);

                this.#missing.forEach(function(key) {
                    console.log(`i18n missing - ${key}`);
                });
            }
        }
        catch (e) {
            console.error(`i18n exception - ${e.message} - ${e.stack}`);
        }
    }

    /**
     * Get message translation
     * @param string (optional) key
     * @param string text - default text
     * @return string translation or original text if the translation does not exist
     */
    static m()
    {
        // check that class was initialized
        if (!this.#init)
            return arguments.length === 1 ? arguments[0] : arguments[1];

        switch (arguments.length) {
            case 1:
                // only default text
                return this.#t("", arguments[0]);

            case 2:
                if (typeof arguments[1] === "string")
                    // first argument is key, second is default text
                    return this.#t(arguments[0], arguments[1]);
                else
                if (typeof arguments[1] === "object")
                    // first argument is key, second is interpolation
                    return this.#t(arguments[0], "", arguments[1]);
                else {
                    console.error(`i18n::m unknown second argument`);
                    return "";
                }

            default:
                console.error(`i18n::m expects 1 or 2 arguments`);
                return "";
        }
    }

    /**
     * Get translation
     * @param string data - data-i18n attribute value
     * @param string text - text to translate
     * @param object interpolation - interpolation
     * @return string - translated text
     */
    static #t(data, text, interpolation)
    {
        // do not translate numbers
        if (this.#isNumeric(text))
            return text;

        let options = {
            ...interpolation,
        };

        //if (typeof interpolation === "undefined")
        //    console.debug(JSON.stringify(options));

        let key;

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

        if (this.#logging) {
            if (!this.#i18next.exists(key, options))
                this.#missing.push(key);
            else
                this.#translated++;
        }

        // https://www.i18next.com/translation-function/essentials#essentials
        return this.#i18next.t(key, {
            defaultValue: text + this.#defaultValue,
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
        const str = element.innerText.trim();

        // do not translate empty and numeric strings if data-18n is not set
        if (!element.attributes["data-i18n"] && (str === "" || this.#isNumeric(str)))
            return;

        element.innerText = this.#t(element.attributes["data-i18n"] ?? "", str);
    }

    /**
     * Translate inner html
     * @param element
     * @return void
     */
    static #innerHtml(element)
    {
        // iterate over element child nodes
        for (let i = 0; i < element.childNodes.length; ++i) {
            const node = element.childNodes[i];

            // find text nodes
            if (node.nodeType === 3) {
                const value = node.nodeValue.trim();

                // skip whitespace
                if (value === "")
                    continue;

                //console.debug(`${element.tagName} - nodeValue - "${node.nodeValue}"`);

                node.nodeValue = this.#t(element.attributes["data-i18n"] ?? "", value);
                break;
            }
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

        element.attributes["placeholder"] = this.#t(key, element.attributes["placeholder"]);
    }

    /**
     * Translate aria-label
     * @param DOMElement element
     * @return void
     */
    static #arialabel(element)
    {
        if (!element.hasAttribute("aria-label"))
            return;

        const key = element.attributes["data-i18n"] ? element.attributes["data-i18n"] + "-aria-label" : "";

        element.attributes["aria-label"] = this.#t(key, element.attributes["aria-label"]);
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

        element.plaintext.content = this.#t(element.attributes["data-i18n"] ?? "", element.plaintext.content);
    }

    /**
     * Translate htmlarea
     * @param element
     * @return void
     */
    static #htmlarea(element)
    {
        const str = element.innerText.trim();

        // do not translate empty and numeric strings
        if (!element.attributes["data-i18n"] && (str === "" || this.#isNumeric(str)))
            return;

        element.innerHTML = this.#t(element.attributes["data-i18n"] ?? "", str);
    }
    /**
     * Check if string is a number
     * @param string str
     * @return true if number, false otherwise
     * @note https://stackoverflow.com/a/175787/10126479
     */
    static #isNumeric(str)
    {
        if (typeof str !== "string")
            return false;

        return !isNaN(str) && !isNaN(parseFloat(str))
    }
}
