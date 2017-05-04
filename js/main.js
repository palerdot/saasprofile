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

        var $fetchSassData = $.ajax({
            url: "/data/saas-list.json",
            method: "get",
            contentType: "application/json"
        });

        $.when($fetchTagsData, $fetchNeedData, $fetchSassData)
            .done(function(tData, nData, sData) {
                self.tagsInfo = tData[0];
                self.needInfo = nData[0];
                self.saasInfo = sData[0];
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
                saasNeed: _.cloneDeep( this.needInfo )
            },

            methods: {

                "handleChange": function (e) {
                    
                    var selected_need = _.find( self.needInfo, function (need) {
                        return need.id == e.target.value;
                    } );

                    console.log("Porumai! handling saas need change ", self.tags_list_vue, selected_need, e.target.value );
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
                tags: _.cloneDeep( this.tagsInfo )
            },

            methods: {
                "handleChange": function (e) {
                    var current_tags = _.map( e.target.value.split(","), function (id) {
                        // trim the id and return
                        return _.trim( id );
                    } );
                    console.log("Porumai! tag changed ", current_tags, e, e.target.value, this.selected_tags);
                }
            }
        });

        // main saas list vue!!
        this.saas_list_vue = new Vue({

            el: "#saas-list-vue",

            data: {
                saas_list: _.cloneDeep( this.saasInfo )
            },

            methods: {
                // for the given saas, construct tag html from tag ids
                "get_tags_for_saas_list": function (saas) {
                    
                    var tags = _.filter( self.tagsInfo, function (tag) {
                        return _.includes( saas.tags, tag.id );
                    } );

                    return tags;
                }
            }

        });


    }

};

$(document).ready(function() {
    console.log("porumai! doc ready!");
    APP.init();
});
