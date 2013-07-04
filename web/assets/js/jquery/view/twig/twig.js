steal('jquery', 'jquery/view', 'jquery/view/twig/twig/twig.dev.js').then(function (jQuery) {
    "use strict";
    jQuery.View.register({
        j:jQuery,
        suffix:"twig",
        renderer:function (id, text) {
            return function (data) {
                return twig({data:text}).render(data)
            }
        },
        script:function (id, str) {

            var renderer = twig({data:str});
            return "function(data){return ("+renderer+").call($, $, {data: data}).join(''); }";

        }
    });
    jQuery.View.ext = "twig"
});