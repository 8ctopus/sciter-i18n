"use strict";

class Engine
{
    static i18n()
    {
        // get tabs to translate
        const tabs = document.$$("pagecontrol div#tab-1");

        //console.log("tabs count" + tabs.length);

        tabs.map(function(tab) {
            //console.log("tab " + tab);

            // get all tab elements
            tab.$$("[data-i18n]").map(function(element) {
                //console.log(element.tag);

                switch (element.tag) {
                    case "span":
                    case "p":
                    case "button":
                    case "checkbox":
                    case "radio":
                    case "caption":
                    case "option":
                        Engine.innerHtml(element);
                        break;

                    case "input":
                    case "editbox":
                        Engine.placeholder(element);
                        break;

                    default:
                }
            });
        });

        console.log("i18n - OK");
    }

    static innerHtml(element)
    {
        element.innerHTML = element.innerHTML + " (i18n)";
    }

    static placeholder(element)
    {
        if (element.hasAttribute("placeholder"))
            element.attributes["placeholder"] = element.attributes["placeholder"] + " (i18n)";
        else
            console.log("no placeholder");
    }
}
