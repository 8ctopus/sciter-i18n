import i18next from "i18next-20.3.1/src/index.js";

export class Engine
{
    static #i18next;

    static init()
    {
        const fr = {
            translation: {
                "description": "Test de traduction basée sur i18next",
                "hello": "bonjour",
                "howareyou": "Comment allez-vous aujourd'hui?",
                "button": "changer la langue",
            }
        };

        Engine.i18next = i18next;

        // init translation system
        return i18next.init({
            debug: true,

            initImmediate: false,

            lng: "fr",

            resources: {
                fr: fr,
            }
        }, function(error, t) {
            if (!error)
                console.log("Init i18n - OK");
            else
                console.error("Init i18n - FAILED - ${error}");
        });
    }

    static i18n(element)
    {
        // get all elements to translate
        element.$$("[data-i18n]").map(function(element) {
            //console.log(element.tag);

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
                    Engine.#innerHtml(element);
                    break;

                case "editbox":
                case "input":
                    Engine.#placeholder(element);
                    break;

                case "select":
                    // get select caption
                    const child = element.$("caption");

                    if (child != null)
                        Engine.#innerHtml(child);

                    break;

                default:
            }
        });
    }

    static message(str)
    {
        return str + " (i18n)";
    }

    static m(str)
    {
        return Engine.message(str);
    }

    static #innerHtml(element)
    {
        element.innerHTML = element.innerHTML + " (i18n)";
    }

    static #placeholder(element)
    {
        if (element.hasAttribute("placeholder"))
            element.attributes["placeholder"] += " (i18n)";
    }
}
