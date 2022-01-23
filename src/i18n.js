// import path does not allow to import from app root dir
//import i18next from "/node_modules/i18next/dist/esm/i18next.bundled.js";

export default class I18n {
    static #init = false;

    static #i18next;
    static #defaultValue;

    static #logging;
    static #timer;
    static #translated;
    static #missing;

    /**
     * Initialize engine
     * @param {string} locale
     * @param {string} url - url or path to locale
     * @param {object} config - (optional) i18next config https://www.i18next.com/overview/configuration-options
     * @returns {boolean} true on success, false otherwise
     * @note use URL.toPath() for url
     */
    static async init(locale, url, config) {
        this.#logging = config.logging || false;
        this.#defaultValue = (config.defaultValue !== undefined) ? config.defaultValue : " (i18n)";

        // get url content
        const result = fetch(url, {sync: true});

        if (!result.ok) {
            console.error(`i18n init - FAILED - fetch - ${result.status} - ${url}`);
            return false;
        }

        // convert to json
        let json;

        try {
            json = result.json();
        }
        catch (error) {
            console.error(`i18n init - FAILED - json - ${error.message} - ${error.stack}`);
            return false;
        }

        // init translation system
        if (__DIR__.includes("node_modules"))
            this.#i18next = await import("../../i18next/dist/esm/i18next.bundled.js");
        else
            this.#i18next = await import("../node_modules/i18next/dist/esm/i18next.bundled.js");

        this.#i18next.init({
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
        }, (error, _t) => {
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
     * @param {Element} element
     */
    static i18n(element) {
        try {
            // check that class was initialized
            if (!this.#init)
                return;

            if (this.#logging) {
                this.#timer = new Date();
                this.#translated = 0;
                this.#missing = [];
            }

            // get all children elements to translate
            const elements = element.$$("[data-i18n]");

            // add root element if it needs translation
            if (element.hasAttribute("data-i18n"))
                elements.push(element);

            for (const element of elements) {
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
                    case "radio":
                    case "span":
                    case "textarea":
                    case "th":
                    case "title":
                    case "td":
                        if (!element.innerHTML.includes("<"))
                            I18n.#innerText(element);
                        else
                            I18n.#innerHtml(element);

                        I18n.#arialabel(element);

                        break;

                    case "window-button":
                        I18n.#arialabel(element);
                        break;

                    case "editbox":
                    case "input":
                        I18n.#placeholder(element);
                        break;

                    case "select": {
                        // get select caption
                        const child = element.$("caption");

                        if (child !== null)
                            I18n.#innerText(child);

                        break;
                    }

                    case "plaintext":
                        I18n.#plaintext(element);
                        break;

                    case "htmlarea":
                        I18n.#htmlarea(element);
                        break;

                    default:
                        console.warn(`i18n - unknown element - ${element.tag}`);
                        break;
                }
            }

            if (this.#logging) {
                this.#timer = Date.now() - this.#timer;

                const total = this.#translated + this.#missing.length;

                const percentage = Math.round(this.#translated / total * 100, 1);

                console.log(`i18n translate - OK - ${this.#translated} / ${total} (${percentage}%) - ${this.#timer} ms`);

                for (const key of this.#missing)
                    console.log(`i18n missing - ${key}`);
            }
        }
        catch (error) {
            console.error(`i18n exception - ${error.message} - ${error.stack}`);
        }
    }

    /**
     * Get message translation
     * @param {string} key - (optional)
     * @param {string} text - default text
     * @returns {string} translation or original text if the translation does not exist
     */
    static m() {
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
                if (typeof arguments[1] === "object")
                    // first argument is key, second is interpolation
                    return this.#t(arguments[0], "", arguments[1]);

                console.error("i18n::m unknown second argument");
                return "";

            default:
                console.error("i18n::m expects 1 or 2 arguments");
                return "";
        }
    }

    /**
     * Get translation
     * @param {string} data - data-i18n attribute value
     * @param {string} text - text to translate
     * @param {object} interpolation - interpolation
     * @returns {string} - translated text
     */
    static #t(data, text, interpolation) {
        // do not translate numbers
        if (this.#isNumeric(text))
            return text;

        let options = {
            ...interpolation,
        };

        //if (typeof interpolation === "undefined")
        //    console.debug(JSON.stringify(options));

        let key;

        if (data.length > 0)
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
     * @param {Element} element
     */
    static #innerText(element) {
        const str = element.textContent.trim();

        // do not translate empty and numeric strings if data-18n is not set
        if (!element.attributes["data-i18n"] && (str === "" || this.#isNumeric(str)))
            return;

        element.textContent = this.#t(element.attributes["data-i18n"] ?? "", str);
    }

    /**
     * Translate inner html
     * @param {Element} element
     */
    static #innerHtml(element) {
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
     * @param {Element} element
     */
    static #placeholder(element) {
        if (!element.hasAttribute("placeholder"))
            return;

        const key = element.attributes["data-i18n"] ? element.attributes["data-i18n"] + "-placeholder" : "";

        element.attributes.placeholder = this.#t(key, element.attributes.placeholder);
    }

    /**
     * Translate aria-label
     * @param {Element} element
     */
    static #arialabel(element) {
        if (!element.hasAttribute("aria-label"))
            return;

        const key = element.attributes["data-i18n"] ? element.attributes["data-i18n"] + "-aria-label" : "";

        element.attributes["aria-label"] = this.#t(key, element.attributes["aria-label"]);
    }

    /**
     * Translate plaintext
     * @param {Element} element
     */
    static #plaintext(element) {
        // sometimes plaintext is undefined for some reason, this fixes it
        if (typeof element.plaintext === "undefined")
            return;

        element.plaintext.content = this.#t(element.attributes["data-i18n"] ?? "", element.plaintext.content);
    }

    /**
     * Translate htmlarea
     * @param {Element} element
     */
    static #htmlarea(element) {
        const str = element.textContent.trim();

        // do not translate empty and numeric strings
        if (!element.attributes["data-i18n"] && (str === "" || this.#isNumeric(str)))
            return;

        element.innerHTML = this.#t(element.attributes["data-i18n"] ?? "", str);
    }

    /**
     * Check if string is a number
     * @param {string} str
     * @returns {boolean} true if number, false otherwise
     * @note https://stackoverflow.com/a/175787/10126479
     */
    static #isNumeric(str) {
        if (typeof str !== "string")
            return false;

        return !Number.isNaN(str) && !Number.isNaN(Number.parseFloat(str));
    }
}
