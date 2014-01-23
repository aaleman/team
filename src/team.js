function Team(args) {
    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("Team");

    //set default args
    this.suiteId = 86;
    this.title = 'TEAM';
    this.description = '';
    this.version = '1.0.0';
    this.border = true;
    this.targetId;
    this.width;
    this.height;


    //set instantiation args, must be last
    _.extend(this, args);

    this.accountData = null;

    this.resizing = true;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}


Team.prototype = {
    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        console.log("Initializing Panels");
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="panels" style="height:100%;position:relative;"></div>')[0];
        $(this.targetDiv).append(this.div);


        this.headerWidgetDiv = $('<div id="header-widget"></div>')[0];
        //this.headerWidgetDiv = $('<div id="header-widget" style="padding: 25px 0 20px 25px;"><div class="appName">' + this.title + '</div></div>')[0];

        $(this.div).append(this.headerWidgetDiv);
        this.menuDiv = $('<div id="menu"></div>')[0];
        $(this.div).append(this.menuDiv);
        this.wrapDiv = $('<div id="wrap" style="height:100%;position:relative;"><div><a href="http://bioinfo.cipf.es/apps-beta/panels/data/example_data.zip">Example Data</a></div></div>')[0];
        $(this.div).append(this.wrapDiv);


        this.sidePanelDiv = $('<div id="right-side-panel" style="position:absolute; z-index:50;right:0px;"></div>')[0];
        $(this.wrapDiv).append(this.sidePanelDiv);

        this.contentDiv = $('<div id="content" style="height: 100%;"></div>')[0];
        $(this.wrapDiv).append(this.contentDiv);

        this.width = ($(this.div).width());
        this.height = ($(this.div).height());


        if (this.border) {
            var border = (_.isString(this.border)) ? this.border : '1px solid lightgray';
            $(this.div).css({border: border});
        }

        $(window).resize(function (event) {
            if (event.target == window) {
                if (!_this.resizing) {//avoid multiple resize events
                    _this.resizing = true;
                    _this.setSize($(_this.div).width(), $(_this.div).height());
                    setTimeout(function () {
                        _this.resizing = false;
                    }, 400);
                }
            }
        });

        this.rendered = true;
    },
    draw: function () {
        var _this = this;
        if (!this.rendered) {
            console.info('Panels is not rendered yet');
            return;
        }


        /* Header Widget */
        this.headerWidget = this._createHeaderWidget($(this.headerWidgetDiv).attr('id'));

        /* Header Widget */
        this.menu = this._createMenu($(this.menuDiv).attr('id'));

        /* check height */
        var topOffset = 80 + $(this.menuDiv).height();
        $(this.wrapDiv).css({height: 'calc(100% - ' + topOffset + 'px)'});

        /* Wrap Panel */
        // this.panel = this._createPanel($(this.contentDiv).attr('id'));

        var user_panels = [];

        if (localStorage.bioinfo_panels_user_settings != null) {
            user_panels = JSON.parse(localStorage.bioinfo_panels_user_settings);
        }


        /* Job List Widget */
        this.panelsWidget = new PanelsWidget({
            targetId: $(this.contentDiv).attr('id'),
            autoRender: true
        });

        this.panelListWidget = this._createTeamPanelsListWidget($(this.sidePanelDiv).attr('id'), this.panelsWidget);


//        var auxPanels = [];
//
//        for (var i = 0; i < 10; i++) {
//            auxPanels.push({
//                name: "panel_" + i
//            })
//        }
//        this.panelListWidget.setAccountData(user_panels);
        this.panelListWidget.render();
        this.panelListWidget.draw();
        //this.panelListWidget.show();


        this.panelsWidget.draw();

    },
    _createMenu: function (targetId) {
        var _this = this;
        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            id: this.id + "navToolbar",
            renderTo: targetId,
            cls: 'gm-navigation-bar',
            region: "north",
            width: '100%',
            border: false,
            items: [
                '->'
                ,
                {
                    id: this.id + 'jobsButton',
                    tooltip: 'Settings',
                    text: '<span class="emph"> Show settings </span>',
                    enableToggle: true,
                    pressed: false,
                    toggleHandler: function () {
                        if (this.pressed) {
                            this.setText('<span class="emph"> Hide settings </span>');
                            _this.panelListWidget.show();
                        } else {
                            this.setText('<span class="emph"> Show settings </span>');
                            _this.panelListWidget.hide();
                        }
                    }
                }
            ]
        });
        return toolbar;
    },
    _createTeamPanelsListWidget: function (targetId, teamWidget) {
        var _this = this;

        var user_panels = [];

        if (localStorage.bioinfo_panels_user_settings != null) {
            user_panels = JSON.parse(localStorage.bioinfo_panels_user_settings);
        }

        var panelListWidget = new TeamPanelListWidget({
            'title': 'Settings',
            'pageSize': 7,
            'targetId': targetId,
            'order': 0,
            'width': 320,
            'height': 425,
            border: true,
            'mode': 'view',
            examplePanels: EXAMPLE_PANELS,
            userPanels: user_panels,
            parent: teamWidget,

        });

        /**Atach events i listen**/
//        panelListWidget.pagedListViewWidget.on('item:click', function (data) {
//            _this.jobItemClick(data.item);
//        });

        return panelListWidget;
    },
    _createHeaderWidget: function (targetId) {
        var _this = this;
        var headerWidget = new HeaderWidget({
            targetId: targetId,
            autoRender: true,
            appname: this.title,
            description: this.description,
            version: this.version,
            //suiteId: this.suiteId,
            suiteId: this.suiteId,
            accountData: this.accountData,
            allowLogin: false,
            //handlers: {
            //'login': function (event) {
            //Ext.example.msg('Welcome', 'You logged in');
            ////_this.sessionInitiated();
            //},
            //'logout': function (event) {
            //Ext.example.msg('Good bye', 'You logged out');
            ////_this.sessionFinished();

            //},
            //'account:change': function (event) {
            //_this.setAccountData(event.response);

            //}
            //}
        });
        headerWidget.draw();

        return headerWidget;
    },

};
