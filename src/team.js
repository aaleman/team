function Team(args) {
    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("Team");

    //set default args
    this.suiteId = 86;
    this.title = 'TEAM';
    this.description = '';
    this.version = '1.0.3';
    this.border = true;
    this.targetId;
    this.width;
    this.height;
    this.panels; //  = new Panel();


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

        console.log("Initializing Team");
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="panels" style="height:100%;position:relative;"></div>')[0];
        $(this.targetDiv).append(this.div);

        this.headerWidgetDiv = $('<div id="header-widget"></div>')[0];

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

        this.teamWidget = new TeamWidget({
            targetId: $(this.contentDiv).attr('id'),
            autoRender: true,
            sidePanelDiv: this.sidePanelDiv
        });

        this.teamWidget.draw();
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
                    tooltip: 'Panels',
                    text: '<span class="emph"> Show Panels</span>',
                    enableToggle: true,
                    pressed: false,
                    toggleHandler: function () {
                        if (this.pressed) {
                            this.setText('<span class="emph"> Hide Panels</span>');
                            _this.teamWidget.showPanels();
                        } else {
                            this.setText('<span class="emph"> Show Panels</span>');
                            _this.teamWidget.hidePanels();
                        }
                    }
                }
            ]
        });
        return toolbar;
    },
    _createHeaderWidget: function (targetId) {
        var headerWidget = new HeaderWidget({
            targetId: targetId,
            autoRender: true,
            appname: this.title,
            description: this.description,
            version: this.version,
            //suiteId: this.suiteId,
            suiteId: this.suiteId,
            accountData: this.accountData,
            allowLogin: false
        });
        headerWidget.draw();

        // Hide Sign in button
        $("#" + headerWidget.id + "btnSignin").hide();

        return headerWidget;
    }
};
