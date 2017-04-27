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

        var self = this; // save reference

        // saas need vue
        this.saas_need_vue = new Vue({

            el: "#saas-need-vue",

            data: {
                saasNeed: _.clone( this.needInfo )
            },

            methods: {
                "handleChange": function (e) {
                    console.log("Porumai! handling saas need change ", e, e.target.value);
                },

                // for the given need, construct tag html from tag ids
                "get_tags_for_need": function (need) {
                    
                    var need_tags = _.filter( self.tagsInfo, function (tag) {
                        return _.includes( need.tags, tag.id );
                    } );

                    return need_tags;
                }
            }

        });

        // tags list vue
        this.tags_list_vue = new Vue({

            el: "#tags-list-vue",
            
            data: {
                tags: _.clone( this.tagsInfo )
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
