var APP = {

    init: function() {

        var self = this; // save reference

        // fetch the dependencies
        // fetch tags data
        var $fetchTagsData = $.ajax({
            url: "/data/tags-info.json",
            method: "get",
            contentType: "application/json"
        });

        var $fetchNeedData = $.ajax({
            url: "/data/saas-need-list.json",
            method: "get",
            contentType: "application/json"
        });

        $.when($fetchTagsData, $fetchNeedData)
            .done(function(tData, nData) {
                self.tagsInfo = tData[0];
                self.needInfo = nData[0];
                // proceed with app initialization
                self.start();
            });
    },

    start: function() {
        console.log("starting app ", this.tagsInfo, this.needInfo);
        this.init_vues();
        // NOTE: init dom events after vues initialization to avoid 'semantic-ui dropdown' init bugs
        this.init_DOM_events();
    },

    init_DOM_events: function() {
        $("select, .ui.dropdown").dropdown();
    },

    // init vue components
    init_vues: function() {

        this.vue_message = new Vue({
            el: "#vue-message",
            data: {
                message: "Porumai! from Vue"
            }
        });

        this.tags_list_vue = new Vue({

            el: "#tags-list-vue",
            
            data: {
                tags: this.tagsInfo
            },

            methods: {
                "handleChange": function (e) {
                    var current_tags = _.map( e.target.value.split(","), function (id) {
                        // trim the id and return
                        return _.trim( id );
                    } );
                    console.log("Porumai! tag changed ", current_tags, e, e.target.value);
                }
            }
        });
    }

};

$(document).ready(function() {
    console.log("porumai! doc ready!");
    APP.init();
});
