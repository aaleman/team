function TeamPanelListWidget(args) {
    var _this = this;

    console.log(args);
    this.counter = null;
    this.allData = [];
    this.examplePanels = [];
    this.userPanels = [];

    //set instantiation args, must be last
    _.extend(this, args);
};

TeamPanelListWidget.prototype = {
    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;


        this.btnNewPanel = this.id + "_btnNewPanel";
        this.btnImportSettings = this.id + "_btnImportSettings";
        this.btnClearSettings = this.id + "_btnNewSettings";
        this.btnSaveSettings = this.id + "_btnSaveSettings";

        this.rendered = true;
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
                            var content = JSON.stringify(_this.userPanels, null, '\t');
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

                                console.log(_this.userPanels);
                                _this.settingsView.load(_this.userPanels, panelName, true);
                            }
                        },
                        {
                            icon: Utils.images.del,
                            handler: function (grid, rowIndex, colIndex) {

                                Ext.MessageBox.confirm('Confirm', 'Are you sure you want to remove this panel?', function (e) {

                                    if (e == "yes") {
                                        var record = grid.getStore().getAt(rowIndex);
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
        for (var i = 0; i < this.userPanels.length; i++) {
            if (this.userPanels[i].name == record.get("name")) {
                enc = i;
                break;
            }
        }
        if (enc >= 0) {
            this.userPanels.splice(enc, 1);
            localStorage.bioinfo_panels_user_settings = JSON.stringify(this.userPanels);
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
                }
            }
        });

        this.pagBar = Ext.create('Ext.toolbar.Toolbar', {
            id: this.pagbarId,
            style: 'border: ' + this.border,
            items: [
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
//				    iconCls: 'icon-delete',
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

        if (this.userPanels.length == 0) {
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
            items: tabPanel
        });
        panel.addDocked(this.bar);
        return panel;
    },

    add: function (panel) {
        this.userPanels.push(panel);
        this.grid.add({name: panel.name});
        Ext.getCmp(this.id + "_tabPanel").setActiveTab(this.grid.getPanel());
        localStorage.bioinfo_panels_user_settings = JSON.stringify(this.userPanels);
    }
};

TeamPanelListWidget.prototype.draw = function () {

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

    // Load example panels
    var names = [];
    for (var i = 0; i < this.examplePanels.length; i++) {
        names.push({
            name: this.examplePanels[i].name
        });
    }
    this.exampleGrid.loadData(names);
};

TeamPanelListWidget.prototype.getData = function () {
    return this.userPanels;
};

TeamPanelListWidget.prototype.show = function () {
    if (!this.panel.rendered) {
        this.panel.render(this.targetId);
    }
    this.panel.show();
};

TeamPanelListWidget.prototype.hide = function () {
    if (!this.panel.rendered) {
        this.panel.render(this.targetId);
    }
    this.panel.hide();
};