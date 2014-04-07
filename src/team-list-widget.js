function TeamPanelListWidget(args) {
    var _this = this;

    console.log(args);
    this.counter = null;
    this.allData = [];
    this.userSettings;

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
        this.diseaseStore = Ext.getStore("DiseaseStore");
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
                            _this.settingsView.newPanel();
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
                    id: this.btnSaveSettings,
                    text: 'Save Panels',
                    tooltip: 'Save Panels',
                    listeners: {
                        click: function () {
                            _this.settingsView.showSavePanel();
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
                                    _this.userSettings.clear();
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
            fields: [
                {name: 'name', type: 'String'},
                {name: 'panelId', type: 'String'},
                {name: 'panelType', type: 'String'}
            ]
        });

        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            storeId: 'UserExampleStore',
            sorters: [
                { property: 'date', direction: 'DESC'}
            ],
            autoLoad: false
        });

        newGrid.grid = Ext.create('Ext.grid.Panel', {
            title: 'User-defined',
            id: "userPanelGrid",
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
                                // _this.settingsView.load(record.get('panelType'), record.get('panelId'));
                                _this.settingsView.edit_panel(record.get('panelType'), record.get('panelId'));
                            }
                        },
                        {
                            icon: Utils.images.del,
                            handler: function (grid, rowIndex, colIndex) {
                                Ext.MessageBox.confirm('Confirm', 'Are you sure you want to remove this panel?', function (e) {
                                    if (e == "yes") {
                                        var rec = grid.getStore().getAt(rowIndex);
                                        _this.userSettings.remove(rec.raw);
                                        _this.userSettings.save();
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
    _createExamplePanelsGrid: function () {

        var _this = this;
        var newGrid = new Grid();

        newGrid.model = Ext.define('PanelSettingsModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'name', type: 'String'},
                {name: 'panelId', type: 'String'},
                {name: 'panelType', type: 'String'}
            ]
        });

        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            storeId: 'ExampleStore',
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
                                _this.settingsView.load(record.get('panelType'), record.get('panelId'));

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

        if (this.userSettings === undefined || this.userSettings.isExampleDataEmpty()) {
            tabPanel.setActiveTab(this.exampleGrid.getPanel());
        } else {
            tabPanel.setActiveTab(this.grid.getPanel());
        }

        var panel = Ext.create('Ext.panel.Panel', {
            id: this.panelId,
            target: this.targetId,
            title: "Panels",
            border: this.border,
            width: this.width,
            height: this.height,
            border: this.border,
            items: tabPanel
        });
        panel.addDocked(this.bar);
        return panel;
    },

    add: function (panel) {
        this.userSettings.addPanel(panel);
        Ext.getCmp(this.id + "_tabPanel").setActiveTab(this.grid.getPanel());

    }
}
;

TeamPanelListWidget.prototype.draw = function () {
    var _this = this;

    this.bar = _this._createToolbar();
    this.grid = _this._createUserPanelsGrid();
    this.exampleGrid = _this._createExamplePanelsGrid();
    this.panel = _this._createPanel();
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
