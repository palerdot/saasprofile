var APP = {

    init: function() {

        var self = this; // save reference

        // init the progress bar and timer to update the progress
        this.initProgressBar();

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
                // for initial saas sort by weight, and interesting
                self.saasInfo = _.orderBy( sData[0], ["interesting", "weight"], ["asc", "desc"] );
                // proceed with app initialization
                self.start();
            })
            // show error message if failed to get dependencies
            .fail( function () {
                console.log("fetching dependencies failed");
                // set error to show error message
                self.sp_error_vue.error = true;
                self.sp_error_vue.error_msg = "Fetching SaaS list failed. Please <a href=''>refresh</a>!"
            } )
            .always( function () {
                // set loading status as false to hide the loading
                self.sp_error_vue.loading = false;
                // set percent to hundred before clearing the timer
                $("#progress-bar").progress("set percent", 100);
                // hide the dimmer
                $("#saas-grid").dimmer("hide");
                // clear the progress timer
                window.clearInterval( self.progressTimer );
                // hide the progress bar after a delay
                _.delay( function () {
                    $("#progress-bar").hide();
                }, 777 )
            } );
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

    // subscribe event handler
    subscribeUser: function (details) {

        console.log("subscribing user ", details);

        // ref: https://stackoverflow.com/questions/8425701/ajax-mailchimp-signup-form-integration

        var $subscribeUser = $.ajax({
            url: "http://saasprofile.us16.list-manage.com/subscribe/post-json?u=8dbadfb6930326e14b50326c6&amp;id=1e3956bc84&c=?",
            type: "GET",
            data: details,
            cache: false,
            dataType: 'json',
            contentType: "application/json; charset=utf-8"
        });

        $.when( $subscribeUser )
            .done( function () {
                console.log("subscription mail sent");
                // show the noty success alert message
                new Noty({
                    type: "success",
                    text: "Thank you! Please confirm your email for updates.",
                    theme: 'sunset'
                }).show();
            } )
            .fail( function () {
                // show the noty alert message
                new Noty({
                    type: "error",
                    text: "Sorry! some problem in sending the confirmation mail. If possible please try again. Thank you!",
                    timeout: 3000
                }).show();
            } )
            .always( function () {
                // close the modal anyway
                $("#main-subscribe-form-modal").modal("hide");
            } );

    },

    // init the progress bar
    // also set up interval to update progress while we fetch the dependencies
    initProgressBar: function () {
        // init the progress bar
        $("#progress-bar").progress();
        // also init the dimmer
        $("#saas-grid").dimmer("show");

        var PROGRESS = 33; // seed with initial progress percent
        // set up the timer
        this.progressTimer = window.setInterval( function () {
            var UPDATED_PROGRESS = Math.floor( PROGRESS + (100 - PROGRESS) * 0.33 );
            // set the updated progress percent
            $("#progress-bar")
                .progress("set percent", UPDATED_PROGRESS);
            // update the progress with updated value
            PROGRESS = UPDATED_PROGRESS;
        }, 750 );
    },

    init_DOM_events: function() {

        var self = this; // save reference

        // clear all filters
        $("#clear-filters").click( function () {
            console.log("porumai! clearing all filters and tag search");
            $("#tag-list-dropdown").dropdown("set exactly", "");
            // also manually clear the tag search to fix the 'semantic-ui' bug which shows previosly filtered tags
            $("#tags-search")
                .val("")
                .trigger("input");
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

        // init popup for interesting
        $(".interesting").popup();

        // scroll to feedback
        $("#go-to-feedback").click( function (e) {

            e.preventDefault();

            $('html, body').animate({
                scrollTop: $("#footer").offset().top
            }, 333);

        } );

        $(".go-to-top").click( function (e) {

            e.preventDefault();

            $('html, body').animate({
                scrollTop: $("body").offset().top
            }, 333);

        } );

        // form validating rules
        $('#main-subscribe-form')
            .form(
                {
                    on: 'blur',
                    inline: true,
                    fields: {
                      empty: {
                        identifier  : 'empty',
                        rules: [
                          {
                            type   : 'empty',
                            prompt : 'Please enter a valid email address'
                          }
                        ]
                    }
                }}
            );

        // init the modals
        $("#main-subscribe-form-modal")
            .modal({

                "onApprove": function ($el) {

                    var $form = $(this).find("form"),
                        data = $form.serialize(),
                        data_json = deparam(data);

                    if (!$.trim( data_json.EMAIL )) {
                        console.log('stopping at validation ', data_json);
                        // show error message
                        return false;
                    }

                    console.log("subscriber data ", data, deparam(data), this);        
                    // make a subscribe user request
                    self.subscribeUser( data );
                    // prevent modal from closing
                    return false;

                    function deparam(query) {
                        var pairs, i, keyValuePair, key, value, map = {};
                        // remove leading question mark if its there
                        if (query.slice(0, 1) === '?') {
                            query = query.slice(1);
                        }
                        if (query !== '') {
                            pairs = query.split('&');
                            for (i = 0; i < pairs.length; i += 1) {
                                keyValuePair = pairs[i].split('=');
                                key = decodeURIComponent(keyValuePair[0]);
                                value = (keyValuePair.length > 1) ? decodeURIComponent(keyValuePair[1]) : undefined;
                                map[key] = value;
                            }
                        }
                        return map;
                    }

                }
            });

        console.log('about to show main subscribe form');


        $("#footer-subscribe-form").on("click", function (e) {
            console.log("showing main subscribe form ");

            var email = $("#footer-subscriber-email").val().trim();

            if (!email) {
                // show error alert
                new Noty({
                    type: "error",
                    text: "Please enter an email address for getting updates",
                    timeout: 3000,
                    theme: "sunset"
                }).show();
                // do not proceed
                return;
            }

            // we have all the details set the data
            self.subscribe_modal_vue.info_msg = "Please Subscribe to get updates on SaaS Profile";
            self.subscribe_modal_vue.action_btn_text = "Subscribe";
            self.subscribe_modal_vue.action = "subscribe";
            // set the mail in the form for us to serialize
            // self.subscribe_modal_vue.email = email;
            $("#subscriber-email").val( email );

            var $form = $("#main-subscribe-form"),
                data = $form.serialize();
            // make a subscribe user request
            self.subscribeUser( data );
            // prevent modal from closing
            return false;
        });

        $("#my-saas-subscribe").on("click", function (e) {
            console.log("showing main subscribe form ");

            // set the data
            self.subscribe_modal_vue.info_msg = "'My SaaS' feature helps you to bookmark, track your spending of SaaS. This feature will be released in near future for beta audience. If you are interested please let me know!";
            self.subscribe_modal_vue.action_btn_text = "Notify me!";
            self.subscribe_modal_vue.action = "mysaas";

            // and show the modal
            $("#main-subscribe-form-modal").modal("show");
            return false;
        });

        // subscription for select by geography feature
        $("#geography-subscribe").on("click", function (e) {
            console.log("showing geography subscribe form ");

            // set the data
            self.subscribe_modal_vue.info_msg = "This feature will be released in near future for beta audience. If you are interested please let me know!";
            self.subscribe_modal_vue.action_btn_text = "Notify me!";
            self.subscribe_modal_vue.action = "geography";

            // and show the modal
            $("#main-subscribe-form-modal").modal("show");
            return false;
        });

    },

    // helper function for constructing the tag icons
    get_tag_icons: function (tag) {
        var DEFAULT_ICON_SUFFIX = "icon"; 
            DEFAULT_ICON_CLASS = "tag";
        // if there is no icon class, return the default icon class
        if ( !tag.icon_class ) {
            return DEFAULT_ICON_CLASS + " " + DEFAULT_ICON_SUFFIX;
        }
        // else we have a icon class; let us return with the suffix
        return tag.icon_class + " " + DEFAULT_ICON_SUFFIX;
    },

    // init vue components
    init_vues: function() {

        var self = this; // save reference

        // error vue to show errors (in case of 400/500 errors from cloudflare! github)
        this.sp_error_vue = new Vue({

            el: "#sp-error-vue",

            data: {
                error: false,
                error_msg: ""
            }

        });

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
                },

                "get_tag_icons": self.get_tag_icons

            }

        });

        // tags list vue
        this.tags_list_vue = new Vue({

            el: "#tags-list-vue",
            
            data: {
                selected_tags: "",
                tags: _.cloneDeep( this.tagsInfo )
            },

            computed: {
                count: function () {
                    return _.isEmpty(this.selected_tags) ? _.size( this.tags ) : _.size( this.selected_tags );
                }
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
                }, 1 ),

                "get_tag_icons": self.get_tag_icons,

                // displays the current active tag count
                "count_msg": function () {
                    return "Showing " + this.count + " " + (this.count > 1 ? "tags" : "tag");
                }
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

                    tags = _.sortBy( tags, function (t) {
                        return !(_.includes( self.tags_list_vue.selected_tags, t.id ));
                    } );

                    return tags;
                },

                // if the tag is among the current selected tag, mark it
                "get_tag_class": function (tag) {
                    var DEFAULT_CLASS = "ui sp-red label";
                    var is_tag_selected = _.includes( self.tags_list_vue.selected_tags, tag.id );
                    return is_tag_selected ? (DEFAULT_CLASS + " selected") : DEFAULT_CLASS;
                },

                "count_msg": function () {
                    return "Showing " + this.count + " " + (this.count > 1 ? "softwares" : "software");
                },

                // for the given saas, construct the logo url
                get_saas_logo: function (saas) {
                    var LOGO_PATH = "/logos/",
                        DEFAULT_LOGO = "no-image.png";

                    return LOGO_PATH + (saas.logo || DEFAULT_LOGO);
                },

                "get_tag_icons": self.get_tag_icons
            }

        });

        // subscription modal vue
        this.subscribe_modal_vue = new Vue({

            el: "#main-subscribe-form",

            data: {
                info_msg: "Please Subscribe to get updates on SaaS Profile",
                action_btn_text: "Subscribe",
                action: "subscribe"
            }

        });

    },

    // updates saas list based on the tags
    update_saas_list_from_tags: function (tags) {

        var filtered_saas_list = [];

        var filtered_tags = _.map( _.compact(tags), function (t) {
            return parseInt( t, 10 );
        } );

        // set the filtered tags as selected tags
        this.tags_list_vue.selected_tags = filtered_tags;

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
                                    // order by intersting and weight
                                    .orderBy( ["interesting", "weight"], ["asc", "desc"] )
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
