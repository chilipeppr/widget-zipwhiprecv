/* global requirejs cprequire cpdefine chilipeppr THREE */
// Defining the globals above helps Cloud9 not show warnings for those variables

// ChiliPeppr Widget/Element Javascript

requirejs.config({
    /*
    Dependencies can be defined here. ChiliPeppr uses require.js so
    please refer to http://requirejs.org/docs/api.html for info.
    
    Most widgets will not need to define Javascript dependencies.
    
    Make sure all URLs are https and http accessible. Try to use URLs
    that start with // rather than http:// or https:// so they simply
    use whatever method the main page uses.
    
    Also, please make sure you are not loading dependencies from different
    URLs that other widgets may already load like jquery, bootstrap,
    three.js, etc.
    
    You may slingshot content through ChiliPeppr's proxy URL if you desire
    to enable SSL for non-SSL URL's. ChiliPeppr's SSL URL is
    https://i2dcui.appspot.com which is the SSL equivalent for
    http://chilipeppr.com
    */
    paths: {
        // Example of how to define the key (you make up the key) and the URL
        // Make sure you DO NOT put the .js at the end of the URL
        // SmoothieCharts: '//smoothiecharts.org/smoothie',
    },
    shim: {
        // See require.js docs for how to define dependencies that
        // should be loaded before your script/widget.
    }
});

// Test this element. This code is auto-removed by the chilipeppr.load()
cprequire_test(["inline:com-zipwhip-widget-recvtext"], function (zipwhip) {
    console.log("test running of " + zipwhip.id);
    
    // this makes it so we don't poll, so that we don't handle the response while the main workspace does
    zipwhip.noPollingWhileTesting = true;
    
    zipwhip.init();
    
    var testPubSub = function() {
        chilipeppr.publish("/com-chilipeppr-widget-gcode/done", "param1", "p2");
    }
    setTimeout(testPubSub, 10000);
        
} /*end_test*/ );

cpdefine("inline:com-zipwhip-widget-recvtext", ["chilipeppr_ready"], function () {
    return {
        id: "com-zipwhip-widget-recvtext",
        url: "http://fiddle.jshell.net/zipwhip/75b9eha6/show/light/",
        fiddleurl: "http://jsfiddle.net/zipwhip/75b9eha6/",
        name: "Widget / Zipwhip Ice Luge",
        desc: "Let people send a text inbound to trigger the ice luge.",
        foreignSubscribe: {
            "/com-chilipeppr-widget-gcode/done" : "When we see this signal, we know we can queue up the next trigger.",
            "/com-chilipeppr-widget-gcode/onpause" : "When we see this signal, we know the operator is having a problem and is pausing.",
            "/com-chilipeppr-widget-gcode/onplay" : "When we see this signal, we know that the gcode is in play mode so we can reject incoming texts.",
            "/com-chilipeppr-widget-gcode/onstop" : "When we see this signal, we know the operator is having a problem and is stopping."
        },
        // http://landline.zipwhip.com/session/update?_dc=1436834301125&sessions=b80b572e-1f29-42ba-9a4e-a0a5b3bb6682%3A259476803
        // http://landline.zipwhip.com/session/update?_dc=1436834557815&sessions=7c5a05a9-924f-431a-ac5e-e9913f0b243d%3A259476803
        // Original Summer Party (same as photo booth)
        // (844) 564-6528
        //sessionkey: "7c5a05a9-924f-431a-ac5e-e9913f0b243d:259476803",
        // CTIA Party
        // (844) 947-4444
        sessionkey: "535752b5-0766-47d7-99ee-c59a2975cdce:301551902",
        vending: false,
        isTimerMode: true,
        timeOut: 25000,
        noPollingWhileTesting: false,
        init: function () {

            // this makes it so we don't poll, so that we don't handle the response while the main workspace does
            if (this.noPollingWhileTesting == false) 
                this.setupIntervalToShortPoll();
            
            this.setupBtns();
            this.loadIdentityCard();
            this.injectDiv();
            
            this.forkSetup();
            this.subscribeSetup();
            
            console.log(this.name + " done loading.");
        },
        injectDiv: function() {
            setTimeout(function() {
                console.log("injecting background for ice luge");
                var el = $('<div class="zwiceluge-bg">BG</div>');
                $('#com-chilipeppr-widget-3dviewer-renderArea').prepend(el);
                //$('#com-chilipeppr-serialport-log').addClass("hidden");
                //$('#com-chilipeppr-gcode-list').addClass("hidden");
                //$('#com-chilipeppr-widget-gcodeviewer').addClass("hidden");
                
                
            }, 10000);
            
        },
        subscribeSetup: function() {
            //chilipeppr.subscribe("/com-chilipeppr-widget-gcode/done", this, this.onDone);
            chilipeppr.subscribe("/com-chilipeppr-widget-gcode/onpause", this, this.onPause);
            chilipeppr.subscribe("/com-chilipeppr-widget-gcode/onplay", this, this.onPlay);
            chilipeppr.subscribe("/com-chilipeppr-widget-gcode/onstop", this, this.onStop);
        },
        setupIntervalToShortPoll: function() {
            // Setup an interval to query on
            setInterval(this.checkForInboundMsgs.bind(this), 3 * 1000);
        },
        setupBtns: function() {
            $('.zwiceluge-run').click(this.onStartVending.bind(this));
            $('#com-zipwhip-widget-recvtext .panel-footer').click(this.checkForInboundMsgs.bind(this));
            
        },
        loadContactCard: function() {
            // load contact card
            chilipeppr.load(
                "#zwiceluge-identity-instantiation",
                "http://fiddle.jshell.net/zipwhip/z85knmtj/show/light/",
                function() {
                    cprequire(["inline:com-zipwhip-contactcard"], function (ccard) {
                        console.log("test running of " + ccard.id);
                        
                        that.elemContactCard = ccard;
                        
                        var sessionkey = that.sessionkey;
                        if (sessionkey && sessionkey.length > 0) {
                            ccard.createViaSessionkey(sessionkey, function(el, obj) {
                                //$('.zwiceluge-identity').replaceWith(el);
                                el.find('.zw-contactcard-menu').addClass("hidden");
                                $('.zwiceluge-identity').append(el);
                                console.log("just appended real ID card with name/phone. obj:", obj);
                            });
                        }
                        
                        console.log("Loaded Identity Card.");
                    });
                }
            );

        },
        loadIdentityCard: function() {
            
            var that = this;

            // load an identity card using dashboard card
            chilipeppr.load(
                "#zwiceluge-identity-instantiation",
                "http://fiddle.jshell.net/zipwhip/xet57Lbr/show/light/",
                function() {
                    cprequire(["inline:com-zipwhip-dashboardcard"], function (dashboardcard) {
                        console.log("actual running of " + dashboardcard.id);
                        
                        that.elemDashboardCard = dashboardcard;
                        
                        dashboardcard.init(function() {
                            
                            console.log("got callback from dashboardcard init, so ready to go.");
                        
                            that.elemConversationCard = dashboardcard.conversationCard;
                            that.elemContactCard = dashboardcard.conversationCard.contactCard;

                            dashboardcard.create(
                                that.sessionkey,
                                function(d, sessionkey, phone, response) {
                                    console.log("got a dashboard card for a sessionkey. d:", d);
                                    d.find('.zw-contactcard-menu').remove();
                                    $(".zwiceluge-identity").append(d);
                                }
                            ); 
                        });
                        
                    });
                }
            );
            
        },
        checkForInboundMsgs: function() {
            console.log("checking for inbound msgs");
            
            var that = this;
            
            this.shortPoll(function(data) {
                console.log("got callback from short poll. data:", data);
                
                if (data && 'success' in data && data.success && 'sessions' in data && data.sessions.length > 0 && 'message' in data.sessions[0]) {
                    
                    // awesome. we have messages.
                    var msgs = data.sessions[0].message;
                    console.log("we have msgs:", msgs);
                    
                    // get our main msg
                    for (var indx in msgs) {
                    
                        var msg = msgs[indx];
                        
                        // clean up phone number
                        msg.srcAddr = msg.address.replace("ptn:/", "");
                        
                        console.log("msg we're working on:", msg);
                    
                        // see if we have an inbound msg
                        if (msg.type.match(/MO/i) && msg.isRead != true) {
                            
                            // check that it's our vend keyword
                            if (msg.body.match(/zipwhip|zip whip|zippwhip|zipwip/i)) {
                                
                                // see if we are vending
                                if (that.isVending()) {

                                    console.log("rejecting request for msg:", msg);

                                    // so we don't get into a loop
                                    //if (msg.srcAddr != "8445646528") {
                                    if (msg.srcAddr != "8449474444") {
                                        that.sendText(msg.srcAddr, "Sorry. The Zipwhip Ice Luge is busy handling somebody else's shot right now. Please wait a tiny bit and text back in.");
                                        that.onBusyMsg(msg);
                                    }

                                } else {

                                    // we are good to vend

                                    // so we don't get into a loop
                                    if (msg.srcAddr != "8449474444") {
                                        // send vending response back
                                        that.sendText(msg.srcAddr, "The Zipwhip Ice Luge is activating right now for you! Get your cup ready.");
                                        that.onStartVending(msg.srcAddr, msg);
                                    }
                                }

                            } else {
                                console.log("a keyword was texted in that we didn't understand, so just ignoring.");
                            }
                            
                        } else if (msg.type.match(/MO/i) && msg.isRead == true) {
                            console.log("got copy of marking MO msg as read, so ignore");
                        } else {
                             // this message is a copy of our outbound MT, so ignore 
                            console.log("got copy of MT outbound msg, so ignore");
                        }
                        
                    }
                } else {
                    //console.log("did short poll, but got nothing back");    
                }
            });
        },
        onBusyMsg: function(msg) {
            
            console.log("onBusyMsg");
            
            var phone = msg.sourceAddress;

            // show err msg
            var el = $('<div class="zwiceluge-vendingfor-item zwiceluge-busy">' + phone + '</div>');
            var ccardEl = this.elemContactCard.create({phone:this.formatPhone(phone)});
            el.empty().append(ccardEl);
            el.append('<div class="zwiceluge-vendingfor-msg">' + msg.body + ' (Sent a busy msg back)</div>');
            var now = new Date();
            el.append('<div class="zwiceluge-vendingfor-now">' + now.toLocaleString() + '<span class="zwiceluge-vendingfor-done"></span></div>');
            
            $('.zwiceluge-vendingfor').prepend(el);
        },
        onStartVending: function(phone, msg) {
            
            console.log("onStartVending");

            // check for run without phone
            if (phone == null || phone.length == 0 || typeof phone == "object") {
                console.log("being run manually");
                phone = "0000000000";
            }

            this.vending = true;
            this.vendingFor = phone;
            this.vendingForEl = null;
            
            chilipeppr.publish("/com-chilipeppr-widget-gcode/stop");
            chilipeppr.publish("/com-chilipeppr-widget-gcode/play");
            
            var body = "(No body of msg)";
            if (msg && 'body' in msg) body = msg.body;
            
            // show who we're vending for
            this.vendingForEl = $('<div class="zwiceluge-vendingfor-item zwiceluge-runnng">' + phone + '</div>');
            var ccardEl = this.elemContactCard.create({phone:this.formatPhone(phone)});
            this.vendingForEl.empty().append(ccardEl);
            this.vendingForEl.append('<div class="zwiceluge-vendingfor-msg">' + body + '</div>');
            var now = new Date();
            this.vendingForEl.append('<div class="zwiceluge-vendingfor-now">' + now.toLocaleString() + ' <span class="zwiceluge-vendingfor-done"></span></div>');
            
            $('.zwiceluge-vendingfor').prepend(this.vendingForEl);
            
            // make a clone and make it huge and absolute position
            var that = this;
            setTimeout(function() {
                var hugeEl = that.vendingForEl.clone();
                hugeEl.addClass("zwiceluge-huge");
                that.hugeEl = hugeEl;
                $('body').append(hugeEl);
            }, 2000);
            
            // show green state
            $('#com-zipwhip-widget-recvtext .panel-heading').addClass("zwiceluge-runnng");
            
            // disable run button
            $('.zwiceluge-run').prop('disabled', true);
            
            // for now do fake callback in about 7 seconds
            if (this.isTimerMode) setTimeout(this.onEndVending.bind(this), this.timeOut);
            
            $(window).trigger('resize');
        },
        isVending: function() {
            console.log("are we vending? this.vending:", this.vending);
            return this.vending;
        },
        onEndVending: function() {
            console.log("onEndVending");
            
            this.vending = false;

            if (this.hugeEl) {
                this.hugeEl.remove();
            }
            
            if (this.vendingForEl) {
                // mark vendingFor as complete
                this.vendingForEl.removeClass("zwiceluge-runnng").find('.zwiceluge-vendingfor-done').text('Done');
            }
            
            // put hdr back to normal
            $('#com-zipwhip-widget-recvtext .panel-heading').removeClass("zwiceluge-runnng");
            
            // enable run button
            $('.zwiceluge-run').prop('disabled', false);
            
        },
        shortPoll: function(callback) {
            
            var sessionkey = this.sessionkey;
            
            var url = "http://api.zipwhip.com/session/update?sessions=" + sessionkey;
            
            console.log("about to call url:", url);
            
            $.ajax({
                url: url,
                context: this,
            }).done(function(response) {
                //console.log("got back info from session update. response:", response);
                // we will get back json of success or error
                var obj = null;
                if (typeof response == 'object') {
                    // good to go
                    obj = response;
                    //console.log("jquery ajax gave data to us as real object:", obj);
                } else {
                    //console.log("we got data as text, so parse");
                    obj = $.parseJSON(response);
                    //console.log("parsed obj val:", obj);
                }
                
                var now = new Date();
                $('#com-zipwhip-widget-recvtext .panel-footer').text("Last query " + now.toLocaleString()).removeClass("alert-danger alert");
                
                if (callback) callback(obj);
                
                
            }).fail(function(response) {
                console.log("got err from format phone. response:", response);
                
                var now = new Date();
                $('#com-zipwhip-widget-recvtext .panel-footer').text("Last query " + now.toLocaleString() + " Error").addClass("alert-danger alert");

                var errmsg;
                if ('responseJSON' in response)
                    errmsg = response.responseJSON.error + " " + response.responseJSON.message;
                else
                    errmsg = "Error accessing the Zipwhip /session/update short polling API call.";
                
                if (callback) callback({success: false, error: errmsg});
            });
        },
        formatPhone: function(phone) {
            var cleanphone = phone.replace(/\D/g, "");
            var re = /(\d\d\d)(\d\d\d)(.*)/;
            re.exec(cleanphone);
            var fmt = "(" + RegExp.$1 + ") " + RegExp.$2 + "-" + RegExp.$3;
            
            return fmt;
        },
        sendText: function(destAddr, body) {
            // this method uses the Zipwhip api documented at zipwhip.com/api
            // we do GET methods into Zipwhip and proxy them thru ChiliPeppr so that
            // ChiliPeppr swaps in the sessionid for security
            // We get back direct ajax from Zipwhip but via ChiliPeppr proxy
            
            // format the phone number to ptn:/ format
            var pn = destAddr;
            pn = pn.replace(/\D/g, ""); // remove anything but digits
            pn = "ptn:/" + pn;
            var url = "http://api.zipwhip.com/message/send";
            var data = {
                //session: "-fill-from-server-session-",
                session: this.sessionkey,
                contacts: pn,
                body: body,
                //fromAddress:4
            };
            var urlget = url + "?" + $.param(data);
            console.log("going to use chilipeppr geturl. here's our getstr:", urlget);
            //urlget = encodeURIComponent(urlget);
            console.log("after encoding:", urlget);
            //console.log("sending test msg. data:", data);
            
            $.ajax({
                url: "http://chilipeppr.com/zipwhip",
                //url: "http://chilipeppr.com/geturl",
                //url: "http://localhost:8080/zipwhip",
                type: "GET",
                data: {url: urlget}
            })
            .done(function( data ) {
                console.log("data back", data);
                //chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "Zipwhip Text Message Sent", body);
            })
            .fail(function() {
                console.log( "error" );
                chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "Zipwhip Text Message Error", "An error occurred sending text.");
            });
        },
        onTest: function() {
            
            $('#com-chilipeppr-elem-zipwhip-testBtn').prop('disabled', true);
            this.sendText("Test message.\n\nTexts courtesy of Zipwhip.com landline texting. Hope ur enjoying ChiliPeppr.");
            $('#com-chilipeppr-elem-zipwhip-body .test-send-status').text('Test Sent');
            setTimeout(function() {
                $('#com-chilipeppr-elem-zipwhip-testBtn').prop('disabled', false);
                $('#com-chilipeppr-elem-zipwhip-body .test-send-status').text('');
            }, 5000);
        },
        onDone: function(msg) {
            console.log("got onDone signal. send text.");
            // see if they have a phone and that they want an alert
            $('#com-zipwhip-widget-recvtext .panel-title-status').text("onDone");
            this.onEndVending();
        },
        onPlay: function(param1, param2) {
            console.log("zipwhip texting. got onPlay signal. param1:", param1, "param2:", param2);
            $('#com-zipwhip-widget-recvtext .panel-title-status').text("onPlay");
        },
        onPause: function(param1, param2) {
            console.log("zipwhip texting. got onPause signal. param1:", param1, "param2:", param2);
            $('#com-zipwhip-widget-recvtext .panel-title-status').text("onPause");
        },
        onStop: function(param1, param2) {
            console.log("zipwhip texting. got onStop signal. param1:", param1, "param2:", param2);
            $('#com-zipwhip-widget-recvtext .panel-title-status').text("onStop");
        },
        forkSetup: function () {
            var topCssSelector = '#' + this.id; //com-chilipeppr-widget-tinyg';

            //$(topCssSelector + ' .fork').prop('href', this.fiddleurl);
            //$(topCssSelector + ' .standalone').prop('href', this.url);
            //$(topCssSelector + ' .fork-name').html(this.id);
            $(topCssSelector + ' .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 200,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });

            var that = this;
            chilipeppr.load("http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/", function () {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function (pubsubviewer) {
                    pubsubviewer.attachTo($(topCssSelector + ' .panel-heading .dropdown-menu'), that);
                });
            });

        },
    }
});