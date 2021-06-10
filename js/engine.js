import i18next from "i18next-20.3.1/src/index.js";

export class Engine
{
    static #i18next;

    /**
     * Initialize translation engine
     * @return bool true on success, false otherwise
     */
    static init()
    {
        const fr = {
            translation: {
                // first tab
                "i18n engine test": "test du moteur i18n",
                "h1": "h1 (fr)",
                "h2": "h2 (fr)",
                "h3": "h3 (fr)",
                "p": "p (fr)",
                "span": "span (fr)",
                "label": "label (fr)",
                "list item": "objet de la liste",

                // buttons
                "Default": "Défaut",
                "Do it!": "Fais-le!",
                "Disabled": "Désactivé",
                "Success": "Succès",
                "Warning": "Attention",
                "Danger": "Danger",

                // editboxes
                "input text here": "entrer le texte ici",
                "password": "mot de passe",
                "nullable": "peut être nul",
                "disabled": "désactivé",

                // numbers
                "number": "nombre",

                // radiobuttons
                "Yes": "Oui",
                "No": "Non",
                "Undefined": "Non-défini",
                "Disabled (Checked)": "Désactivé (Coché)",

                // checkboxes
                "Checked": "Coché",
                "Unchecked": "Non-coché",
                "Mixed": "Mixte",
                "checked state": "état coché",
                "unchecked state": "état non-coché",

                // toggle
                "no label": "sans étiquette",
                "group": "groupe",

                // switch
                "Left": "Gauche",
                "Center": "Centre",
                "Right": "Droite",

                // dialog buttons
                "info": "info",
                "error": "erreur",
                "warning": "avertissement",
                "question": "question",
                "select file": "sélectionner le fichier",
                "select folder": "sélectionner le dossier",

                // dialogs
                "Widget update successful.": "Succès de la mise-à-jour de widget.",
                //"Widget failed with error 18.": "Widget a généré une erreur 18.",
                "Widget could not be updated.": "Widget n'a pas pu être mis-à-jour.",
                "Do you want to update widget?": "Voulez-vous mettre à jour widget?",
            }
        };

        Engine.#i18next = i18next;

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
                console.error(`Init i18next - FAILED - ${error}`);
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

    /**
     * Get message translation
     * @param string msg
     * @return string translation or original message if the translation does not exist
     */
    static message(msg)
    {
        return Engine.t(msg, msg);
    }

    /**
     * Shorter variant of get message translation
     * @see message()
     */
    static m(str)
    {
        return Engine.message(str, { keySeparator: "|", nsSeparator: "#"});
    }

    /**
     * Get key translation
     * @param string key
     * @param object options
     * @return string
     */
    static t(key, options = null)
    {
        return Engine.#i18next.t(key, options);
    }

    /**
     * Translate inner html
     * @param element
     * @return void
     */
    static #innerHtml(element)
    {
        element.innerHTML = Engine.t(element.innerHTML, element.innerHTML + " (i18n)");
    }

    /**
     * Translate placeholder
     * @param element
     * @return void
     */
    static #placeholder(element)
    {
        if (element.hasAttribute("placeholder"))
            element.attributes["placeholder"] = Engine.t(element.attributes["placeholder"], element.attributes["placeholder"] + " (i18n)");
    }
}
