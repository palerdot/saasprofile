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
        // create a debounced version of update saas list function
        // this is because semantic ui randomly triggers on change when dropdown is cleared
        // debouncing helps filtering individual remove/add and just takes the final value of the dropdown
        this.update_saas_list = _.debounce( this.update_saas_list_from_tags, 1 );
        // tracking the source of where a selection is made - saas-need/tags-list
        this.source = "";
    },

    init_DOM_events: function() {
        var self = this; // save reference
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


    },

    // updates saas list based on the tags
    update_saas_list_from_tags: function (tags) {
        console.log("Porumai! updating saas list based on tags - ", this.source, tags, this);

        // if the trigger is by tags list change the text of saas need to default
        if (this.source == "tags-list") {
            $("#saas-need-dropdown").dropdown("restore defaults");
            // $("#saas-need-dropdown").dropdown("restore default value");
        }

        // clear the source
        this.source = "";
    }

};

$(document).ready(function() {
    console.log("porumai! doc ready!");
    APP.init();
});
