var APP = {

    start: function () {
        console.log("starting app");
        this.init_DOM_events();
        this.init_vues();
    },

    init_DOM_events: function () {
        $("select, .ui.dropdown").dropdown();   
    },

    // init vue components
    init_vues: function () {
        this.vue_message = new Vue({
            el: "#vue-message",
            data: {
                message: "Porumai! from Vue"
            }
        });
    }

};

$(document).ready( function () {
    console.log("porumai! doc ready!");
    APP.start();
} );