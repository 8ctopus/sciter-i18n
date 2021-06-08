export class Engine
{
    static i18n()
    {
        // get all elements to translate
        document.$$("[data-i18n]").map(function(element) {
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

        console.log("i18n - OK");
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
