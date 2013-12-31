//PanelListWidget.prototype.draw = UserListWidget.prototype.draw;
//PanelListWidget.prototype.getData = UserListWidget.prototype.getData;
//PanelListWidget.prototype.getCount = UserListWidget.prototype.getCount;

function PanelListWidget(args) {
    var _this = this;

    console.log(args);
    this.data = [];

//    UserListWidget.prototype.constructor.call(this, args);
    this.counter = null;

    //set instantiation args, must be last
    _.extend(this, args);

    this.allData = [];
}
;


PanelListWidget.prototype = {
    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;


        this.btnNewPanel = this.id + "_btnNewPanel";
        this.btnImportSettings = this.id + "_btnImportSettings";
        this.btnClearSettings = this.id + "_btnNewSettings";
        this.btnSaveSettings = this.id + "_btnSaveSettings";

        this.projectFilterButton = Ext.create("Ext.button.Button", {
            id: this.btnActivePrjId,
            iconCls: 'icon-project-all',
            tooltip: 'Toggle jobs from all projects or active project',
            enableToggle: true,
            pressed: false,
            listeners: {
                toggle: function () {
                    _this.selectProjectData();
                    _this.render();
                }
            }
        });


        this.rendered = true;

//        this.grid.store.loadData(this.getData());
    },
    _createToolbar: function () {

        var _this = this;
        return  new Ext.create('Ext.toolbar.Toolbar', {
            id: this.id + "settingsBar",
            dock: 'top',
            items: [
                {
                    id: this.btnNewPanel,
                    text: 'New Panel',
                    tooltip: 'New Panel',
                    listeners: {
                        click: function () {
                            _this.settingsView.clearSettings();
                            _this.settingsView.show();
                        }
                    }

                },
                {
                    id: this.btnImportSettings,
                    text: 'Import Panels',
                    tooltip: 'Import Panels',
                    listeners: {
                        click: function () {
                            _this.settingsView.showImport();
                        }
                    }
                },
                {
                    href: 'none',
                    id: this.btnSaveSettings,
                    text: 'Save Panels',
                    tooltip: 'Save Panels',
                    listeners: {
                        click: function () {
                            //alert("Under construction!!");
                            var content = JSON.stringify(_this.data, null, '\t');
                            console.log(content);

                            this.getEl().set({
                                href: 'data:text/json,' + encodeURIComponent(content),
                                download: "settings" + ".json"
                            });

                        }
                    }
                },
                {
                    id: this.btnClearSettings,
                    text: 'Clear Panels',
                    tooltip: 'Clear Panels',
                    listeners: {
                        click: function () {
                            //alert("Under construction!!");
                            Ext.MessageBox.confirm('Confirm', 'Are you sure you want to clear the settings and remove all the panels?', function (e) {

                                if (e == "yes") {
                                    _this.grid.clear();
                                    delete localStorage.bioinfo_panels_user_settings;
                                }
                            });
                        }
                    }
                }
            ]
        });
    },
    _createUserPanelsGrid: function () {

        var _this = this;
        var newGrid = new Grid();

        newGrid.model = Ext.define('PanelSettingsModel', {
            extend: 'Ext.data.Model',
            fields: ['name']
        });

        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            sorters: [
                { property: 'date', direction: 'DESC'}
            ],
            autoLoad: false

        });

        newGrid.grid = Ext.create('Ext.grid.Panel', {
            title: 'User-defined',
            store: newGrid.store,
            columns: [
                {
                    header: 'name',
                    dataIndex: 'name',
                    flex: 1
                },
                {
                    xtype: 'actioncolumn',
                    width: 50,
                    items: [
                        {
                            icon: Utils.images.edit,
                            handler: function (grid, rowIndex, colIndex) {
                                var record = grid.getStore().getAt(rowIndex);
                                var panelName = record.get("name");

                                console.log(_this.data);
                                _this.settingsView.load(_this.data, panelName, true);

                            }


                        },
                        {
                            icon: Utils.images.del,
                            handler: function (grid, rowIndex, colIndex) {

                                Ext.MessageBox.confirm('Confirm', 'Are you sure you want to remove this panel?', function (e) {

                                    if (e == "yes") {
                                        var record = grid.getStore().getAt(rowIndex);
                                        var panelName = record.get("name");

                                        _this._removePanel(record);

                                        grid.getStore().remove(record);
                                    }
                                });


                            }
                        }
                    ]

                }
            ],
            border: 0
        });

        return newGrid;

    },
    _removePanel: function (record) {

        var enc = -1;
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].name == record.get("name")) {
                enc = i;
                break;
            }
        }
        if (enc >= 0) {
            this.data.splice(enc, 1);
            localStorage.bioinfo_panels_user_settings = JSON.stringify(this.data);
        }


    },
    _createExamplePanelsGrid: function () {

        var _this = this;
        var newGrid = new Grid();

        newGrid.model = Ext.define('PanelSettingsModel', {
            extend: 'Ext.data.Model',
            fields: ['name']
        });

        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            sorters: [
                { property: 'date', direction: 'DESC'}
            ],
            autoLoad: false
        });

        newGrid.grid = Ext.create('Ext.grid.Panel', {
            title: 'Examples',
            store: newGrid.store,
            columns: [
                {
                    header: 'name',
                    dataIndex: 'name',
                    flex: 1
                },
                {
                    xtype: 'actioncolumn',
                    width: 50,
                    items: [
                        {
                            icon: Utils.images.edit,
                            handler: function (grid, rowIndex, colIndex) {
                                var record = grid.getStore().getAt(rowIndex);
                                var panelName = record.get("name");


                                _this.settingsView.load(_this.examplePanels, panelName, false);

                            }

                        }
                    ]

                }
            ],
            border: 0
        });

        return newGrid;

    },
    _createPanel: function () {

        var _this = this;

        var searchField = Ext.create('Ext.form.field.Text', {
            id: this.id + "searchField",
            flex: 1,
            margin: "0 1 0 0",
            emptyText: 'enter search term',
            enableKeyEvents: true,
            listeners: {
                change: function () {
//                _this.setFilter(null);
                }
            }
        });

        this.pagBar = Ext.create('Ext.toolbar.Toolbar', {
            id: this.pagbarId,
            style: 'border: ' + this.border,
            items: [
//
//
                {
                    id: this.id + 'btnSort',
                    iconCls: 'icon-order-desc',
                    tooltip: 'Change order',
                    handler: function () {
                        if (_this.sort == "DESC") {
                            _this.sort = "ASC";
                            _this.store.sort('date', 'ASC');
                            this.setIconCls('icon-order-asc');
                        }
                        else {
                            _this.sort = "DESC";
                            _this.store.sort('date', 'DESC');
                            this.setIconCls('icon-order-desc');
                        }
                    }
                },
                searchField,
                {
                    id: this.id + 'btnClear',
//							    iconCls: 'icon-delete',
                    text: 'X',
                    margin: "0 2 0 0",
                    tooltip: 'Clear search box',
                    handler: function () {
                        searchField.reset();
                    }
                }

            ]
        });
        var tabPanel = Ext.create('Ext.tab.Panel', {
            id: _this.id + "_tabPanel",
            border: 0

        });
        tabPanel.add(this.grid.getPanel());
        tabPanel.add(this.exampleGrid.getPanel());

        if (this.data.length == 0) {
            tabPanel.setActiveTab(this.exampleGrid.getPanel());
        } else {
            tabPanel.setActiveTab(this.grid.getPanel());
        }

        var panel = Ext.create('Ext.panel.Panel', {
            id: this.panelId,
            target: this.targetId,
            title: "Settings",
            border: this.border,
            width: this.width,
            height: this.height,
            border: this.border,
//            tbar: this.pagBar,
//            bodyPadding: 5,
            items: tabPanel
        });
        panel.addDocked(this.bar);

        return panel;

    },
    _createNewView: function () {

    },
    add: function (panel) {
        this.data.push(panel);
        this.grid.add({name: panel.name});
        Ext.getCmp(this.id + "_tabPanel").setActiveTab(this.grid.getPanel());

        localStorage.bioinfo_panels_user_settings = JSON.stringify(this.data);

    }

};

PanelListWidget.prototype.draw = function () {

    var _this = this;


    this.bar = _this._createToolbar();
    this.grid = _this._createUserPanelsGrid();
    this.exampleGrid = _this._createExamplePanelsGrid();
    this.panel = _this._createPanel();
    this.grid.loadData(this.getData());


    this.settingsView = new PanelSettingsView({
        autoRender: true,
        parent: this
    });
    this.settingsView.draw();

    this.newView = _this._createNewView();


    // Load example panels
    var names = [];
    for (var i = 0; i < this.examplePanels.length; i++) {
        names.push({
            name: this.examplePanels[i].name
        });
    }
    this.exampleGrid.loadData(names);

    this.show();
};


PanelListWidget.prototype.getJobCounter = function () {
    var finished = 0;
    var visited = 0;
    var running = 0;
    var queued = 0;
    for (var i = 0; i < this.getData().length; i++) {
        if (this.getData()[i].visites > 0) {
            visited++;
        } else {
            if (this.getData()[i].visites == 0) {
                finished++;
            }
            if (this.getData()[i].visites == -1) {
                running++;
            }
            if (this.getData()[i].visites == -2) {
                queued++;
            }
        }
    }
    return {"all": this.getData().length, "visited": visited, "finished": finished, "running": running, "queued": queued};
};
/**Filters**/
//var functionAssertion = function(item){return item.data.visites > 2;};

PanelListWidget.prototype.filter = function (button) {
    switch (button.id) {
        case this.btnFinishedId:
            this.pagedListViewWidget.setFilter(function (item) {
                return item.data.visites == 0;
            });
            break;
        case this.btnVisitedId:
            this.pagedListViewWidget.setFilter(function (item) {
                return item.data.visites > 0;
            });
            break;
        case this.btnRunningId:
            this.pagedListViewWidget.setFilter(function (item) {
                return item.data.visites == -1;
            });
            break;
        case this.btnQueuedId:
            this.pagedListViewWidget.setFilter(function (item) {
                return item.data.visites == -2;
            });
            break;
        default:
            this.pagedListViewWidget.setFilter(function (item) {
                return true;
            });
            break;
    }
    this.pagedListViewWidget.draw(this.getData());
};
PanelListWidget.prototype.selectProjectData = function () {
    if (!this.projectFilterButton.pressed) {
        for (var i = 0; i < this.allData.length; i++) {
            if (this.allData[i].active) {
                this.data = this.allData[i].jobs;
                break;
            }
        }
    } else {
        var allJobs = new Array();
        for (var i = 0; i < this.allData.length; i++) {
            if (this.allData[i].jobs != null) {
                for (var j = 0; j < this.allData[i].jobs.length; j++) {

                    //TODO care with date order
                    allJobs.push(this.allData[i].jobs[j]);
                }
            }
        }
        this.data = allJobs;
    }
    if (this.data == null) {
        this.data = [];
    }
    this.pagedListViewWidget.draw(this.getData());
};
PanelListWidget.prototype.getData = function () {
    return this.data;
}
PanelListWidget.prototype.show = function () {
    if (!this.panel.rendered) {
        this.panel.render(this.targetId);
    }
    this.panel.show();
};
PanelListWidget.prototype.hide = function () {
    if (!this.panel.rendered) {
        this.panel.render(this.targetId);
    }
    this.panel.hide();
};
PanelListWidget.prototype.setAccountData = function (data) {

    this.data = data;
    this.render();
};
