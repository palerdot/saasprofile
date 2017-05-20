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
                self.tagsInfo = _.sortBy( tData[0], function (tags) { return -tags.weight; } );
                self.needInfo = _.sortBy( nData[0], function (n) { return -n.weight; } );
                self.saasInfo = _.sortBy( sData[0], function (saas) { return -saas.weight; } );
                // proceed with app initialization
                self.start();
            });
    },

    start: function() {
        console.log("starting app ", this.tagsInfo, this.needInfo);
        this.init_vues();
        // NOTE: init dom events after vues initialization to avoid 'semantic-ui dropdown' init bugs
        this.init_DOM_events();
        // create a debounced version of update saas list function
        // this is because semantic ui randomly triggers on change when dropdown is cleared
        // debouncing helps filtering individual remove/add and just takes the final value of the dropdown
        this.update_saas_list = _.debounce( this.update_saas_list_from_tags, 1 );
        // tracking the source of where a selection is made - saas-need/tags-list
        this.source = "";
    },

    init_DOM_events: function() {
        var self = this; // save reference

        // clear all filters
        $("#clear-filters").click( function () {
            console.log("porumai! clearing all filters ");
            $("#tag-list-dropdown").dropdown("set exactly", "");
        } );

        // initialize dropdown for saas need
        $("#saas-need-dropdown").dropdown({
            onChange: _.debounce ( function () {

                // set the source as "saas-need"
                self.source = "saas-need";

                var saas_need_value = $(this).dropdown("get value");

                console.log("saas need dropdown on change ", saas_need_value );

                if (!saas_need_value) {
                    console.log("SAAS need cleared !!");
                    // do not proceed to update the tags 
                    // as we are clearing the tags based on changes to the tag dropdown
                    return;
                }

                var selected_need = _.find( self.needInfo, function (need) {
                    return need.id == saas_need_value;
                } );
                
                // update the actual saas list
                // self.update_saas_list( selected_need.tags );

                // visually update the tags of selected need for the "tags-list-dropdown" semantic ui dropdown
                $("#tag-list-dropdown").dropdown("set exactly", _.map(selected_need.tags, function (t) { return t + ""; }) );
                
            }, 1 )
        });
        // initialize dropdown for tag list
        $("#tag-list-dropdown").dropdown({
            onChange: function () {
                // console.log("PORUMAI !! tag list dropdown change ");
            }
        });

        // init sticky rails
        $("#saas-count")
            .sticky({
                context: "#saas-grid"
            });
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
                selected_tags: "",
                tags: _.cloneDeep( this.tagsInfo )
            },

            methods: {
                // debouncing it for better handling of input change triggers
                "handleChange": _.debounce ( function (e) {
                    var current_tags = _.map( e.target.value.split(","), function (id) {
                        // trim the id and return
                        return _.trim( id );
                    } );

                    console.log("tag list dropdown handling change ", current_tags, self.source);

                    if (self.source == "saas-need") {
                        console.log("Porumai! trigger by SAAS NEED");
                    } else {
                        // make the source as tags list
                        self.source = "tags-list";
                    }

                    self.update_saas_list( current_tags );
                }, 1 )
            }
        });

        // main saas list vue!!
        this.saas_list_vue = new Vue({

            el: "#saas-list-vue",

            data: {
                saas_list: _.cloneDeep( this.saasInfo )
            },

            computed: {
                count: function () {
                    return _.size( this.saas_list );
                }
            },

            methods: {
                // for the given saas, construct tag html from tag ids
                "get_tags_for_saas_list": function (saas) {
                    
                    var tags = _.filter( self.tagsInfo, function (tag) {
                        return _.includes( saas.tags, tag.id );
                    } );

                    return tags;
                },

                "count_msg": function () {
                    return "Showing " + this.count + " " + (this.count > 1 ? "softwares" : "software");
                }
            }

        });


    },

    // updates saas list based on the tags
    update_saas_list_from_tags: function (tags) {

        var filtered_saas_list = [];

        var filtered_tags = _.map( _.compact(tags), function (t) {
            return parseInt( t, 10 );
        } );

        // if the trigger is by tags list change the text of saas need to default
        if (this.source == "tags-list") {
            $("#saas-need-dropdown").dropdown("restore defaults");
        }

        // clear the source
        this.source = "";
        
        if ( _.isEmpty( filtered_tags ) ) {
            // if tags is empty we need to show the whole saas list
            filtered_saas_list = _.cloneDeep( this.saasInfo );
        } else {
            filtered_saas_list = _( this.saasInfo )
                                    // start chaining
                                    .chain()
                                    // filter saas which has atleast one matching tag
                                    .filter( function (saas) {
                                        return _.size( _.intersection( filtered_tags, saas.tags ) ) > 0;
                                    } )
                                    // sort by saas which has most matching tags
                                    .sortBy( function (saas) {
                                        // sort by matching tags and order in descending order
                                        return -( _.size( _.intersection( filtered_tags, saas.tags ) ) );                            
                                    } )
                                    // get the value
                                    .value();
        }

        console.log("Porumai! updating saas list based on tags - ", this.source, tags, filtered_saas_list);

        // set the data for saas vue
        this.saas_list_vue.saas_list = filtered_saas_list;
    }

};

$(document).ready(function() {
    console.log("porumai! doc ready!");
    APP.init();
});