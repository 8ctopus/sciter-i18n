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
                    case "radio":
                        Engine.i18nInnerHtml(element);
                        break;

                    case "editbox":
                        Engine.i18nPlaceHolder(element);
                        break;

                    default:
                }
            });
        });

        console.log("i18n - OK");
    }

    static i18nInnerHtml(element)
    {
        element.innerHTML = element.innerHTML + " - TR";
    }

    static i18nPlaceHolder(element)
    {
        if (element.hasAttribute("placeholder"))
            element.attributes["placeholder"] = element.attributes["placeholder"] + " - TR";
    }
}
