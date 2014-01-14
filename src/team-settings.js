function PanelSettingsView(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("PanelSettingsView");

    this.data = [];
    this.edit = true;
    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }
}

PanelSettingsView.prototype = {
    showImport: function () {
        this.importView.show();
    },
    show: function (edit) {

        this.edit = (edit == null) ? true : edit;
        if (this.edit) {
            Ext.getCmp(this.id + "btnAddPanel").setVisible(true);
            Ext.getCmp(this.id + "btnClearPanel").setVisible(true);
            Ext.getCmp(this.id + "_panelname").enable();


        } else {
            Ext.getCmp(this.id + "btnAddPanel").setVisible(false);
            Ext.getCmp(this.id + "btnClearPanel").setVisible(false);
            Ext.getCmp(this.id + "_panelname").disable();
        }
        this.panel.show();

    },
    hide: function () {
        this.panel.hide();
    },
    render: function () {
        var _this = this;

        this.rendered = true;
        this.diseases = this._getDiseases();
        this.columns = this._createGridColumns();
        this.columnsGenes = this._createGridColumnsGenes();


    },
    draw: function () {
        var _this = this;
        if (!this.rendered) {
            console.info('Panel Settings Widget is not rendered yet');
            return;
        }

        /* Panel */
        this.panel = this._createPanel();
        this.importView = this._createImportPanel();
    },
    clearSettings: function () {

        var _this = this;


        _this.allDiseases.addAll(_this.primDiseases.getData());
        _this.allDiseases.addAll(_this.secDiseases.getData());

        _this.panelName.reset();
        _this.polyphen.reset();
        _this.sift.reset();
        _this.allDiseases.refresh();
        _this.primDiseases.clear();
        _this.secDiseases.clear();
        _this.diseaseGenes.clear();

    },
    load: function (panels, panelName, edit) {
        var _this = this;

        var panel = null;

        for (var i = 0; i < panels.length; i++) {
            if (panels[i].name == panelName) {
                panel = panels[i];
                break;
            }
        }

        if (panel != null) {

            var primD = [];
            var secD = [];
            var genes = [];

            Ext.each(panel.primaryDiseases, function (dis, index) {
                primD.push({name: dis.name});
            });
            Ext.each(panel.genes, function (gene, index) {
                genes.push({name: gene.name});
            });

            Ext.each(panel.secondaryDiseases, function (dis, index) {
                secD.push({name: dis.name});
            });

            _this.clearSettings();

            _this.panelName.setValue(panel.name);
            _this.polyphen.setValue(panel.polyphen);
            _this.sift.setValue(panel.sift);
            
            _this.primDiseases.loadData(primD);
            _this.secDiseases.loadData(secD);
            _this.diseaseGenes.loadData(genes);

            _this.show(edit);
        }


    },
    _createImportPanel: function () {

        var _this = this;

        var settings_file = Ext.create('Ext.form.field.File', {
            id: _this.id + "_settings_file",
            fieldLabel: "Settings file",
            width: 400,
            emptyText: 'Select a file',
            allowBlank: false,
            name: 'settings_file'
        });


        var window = Ext.create('Ext.window.Window', {
                title: 'Import Settings',
                height: 100,
//                width: 450,

                modal: true,
                minimizable: true,
                closable: false,
                bodyPadding: 10,
                items: [
                    settings_file
                ],
                listeners: {
                    minimize: function (win, obj) {
                        win.hide();
                    }
                },
                buttons: [
                    {
                        text: 'Import',
                        handler: function () {

                            var file = document.getElementById(settings_file.fileInputEl.id).files[0];

                            var fds_file = new FileDataSource(file);

                            fds_file.on("success", function (data) {
                                _this.parent.data = JSON.parse(data);
                                _this.parent.grid.loadData(_this.parent.data);
                                localStorage.bioinfo_panels_user_settings = JSON.stringify(_this.parent.data);
                            });

                            fds_file.fetch(true);
                            this.up('.window').hide();


                        }
                    },
                    {
                        text: 'Close',
                        handler: function () {
                            Ext.getCmp(_this.id + "_settings_file").reset();
                            this.up('.window').hide();
                            settings_file.reset();
                        }
                    }
                ]
            }
        );

        return window;
    },
    _createPanel: function () {

        var _this = this;

        _this.diseaseModel = Ext.define('DiseaseModel', {
            extend: 'Ext.data.Model',
            fields: ['name']
        });

        _this.geneModel = Ext.define('GeneModel', {
            extend: 'Ext.data.Model',
            fields: ['name'],
//            idProperty: 'name'
        });

        var filters = {
            ftype: 'filters',
            encode: false,
            local: true,
            filters: [
                {
                    type: 'boolean',
                    dataIndex: 'visible'
                }
            ]
        };

        this.panelName = Ext.create('Ext.form.TextField',
            {
                id: _this.id + '_panelname',
                name: 'panelname',
                fieldLabel: 'Name',
                height: 20,
                maxWidth: 300,
                margin: "0 0 20 0"
            });
        this.polyphen = Ext.create('Ext.form.NumberField',
            {
                id: _this.id + '_polyphen',
                name: 'polyphen',
                fieldLabel: 'PolyPhen',
                height: 20,
                maxWidth: 300,
                step:0.01,
                maxValue:1,
                minValue:0

                //margin: "0 0 20 0"
            });
        this.sift = Ext.create('Ext.form.NumberField',
            {
                id: _this.id + '_sift',
                name: 'Sift',
                fieldLabel: 'Sift',
                height: 20,
                maxWidth: 300,
                step:0.01,
                maxValue:1,
                minValue:0
                //margin: "0 0 20 0"
            });

        _this.allDiseases = _this._createAllDiseases(filters, _this.diseases);
        _this.diseaseGenes = _this._createGenesGrid("Genes");
//        _this.secGenes = _this._createGenesGrid("Secondary Genes");
        _this.primDiseases = _this._createDiseaseSetGrid("Primary Disease", _this.allDiseases, _this.diseaseGenes, filters);
        _this.secDiseases = _this._createDiseaseSetGrid("Secondary Disease", _this.allDiseases, _this.diseaseGenes, filters);

        var window = Ext.create('Ext.window.Window', {
                title: 'Settings',
                height: 600,
                width: 800,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                modal: true,
                minimizable: true,
                closable: false,
                bodyPadding: 10,
                items: [
                    this.panelName,
                    {
                        xtype: 'container',
                        flex: 1,
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        items: [
                            this.allDiseases.getPanel(),
                            {
                                xtype: 'container',
                                flex: 1,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items: [
                                    this.primDiseases.getPanel(),
                                    this.secDiseases.getPanel()

                                ]
                            }, {
                                xtype: 'container',
                                flex: 1,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items: [
                                    this.diseaseGenes.getPanel()
//                                    this.secGenes.getPanel()

                                ]
                            }
                        ]

                    },
                    this.polyphen,
                    this.sift
                ],
                listeners: {
                    minimize: function (win, obj) {
                        win.hide();
                    }
                },
                buttons: [
                    {
                        id: _this.id + "btnAddPanel",
                        text: 'Add Panel',
                        handler: function () {
                            if (_this.edit) {
                                var name = Ext.getCmp(_this.id + "_panelname").getValue();
                                var polyphen = Ext.getCmp(_this.id + "_polyphen").getValue();
                                var sift = Ext.getCmp(_this.id + "_sift").getValue();
                                var pd = [];
                                var sd = [];
                                var genes = [];
//
                                for (var i = 0; i < _this.primDiseases.count(); i++) {
                                    pd.push({name: _this.primDiseases.getAt(i).get("name")});
                                }
//
                                for (var i = 0; i < _this.secDiseases.count(); i++) {
                                    sd.push({name: _this.secDiseases.getAt(i).get("name")});
                                }

                                for (var i = 0; i < _this.diseaseGenes.count(); i++) {
                                    genes.push({name: _this.diseaseGenes.getAt(i).get("name")});
                                }

                                var panel = {
                                    name: name,
                                    primaryDiseases: pd,
                                    secondaryDisases: sd,
                                    genes: genes,
                                    polyphen:polyphen,
                                    sift:sift
                                };

                                _this.parent.add(panel);
//
                                _this.clearSettings();
                                _this.hide();

                                _this.parent.parent.diseaseStore.add({
                                    name:name,
                                    value:name
                                });
                                console.log(panel);

                            }
                        }
                    },
                    {
                        text: 'Clear',
                        id: _this.id + "btnClearPanel",
                        handler: function () {
                            if (_this.edit) {
                                _this.clearSettings();

                            }
                        }
                    }
                ]
            }
        );
        return window;
    },
    _createGridColumns: function () {
        var columns = [
            {
                text: "Name",
                flex: 1,
                sortable: true,
                groupable: true,
                dataIndex: 'name',
                filter: {
                    type: 'string'
                },
                summaryType: 'count',
                editor: {
                    allowBlank: false
                }
            },
        ];
        return columns;
    },
    _createGridColumnsGenes: function () {
        var columns = [
            {
                text: "Name",
                flex: 1,
                sortable: true,
                groupable: true,
                dataIndex: 'name',
                filter: {
                    type: 'string'
                },
                summaryType: 'count',
                editor: {
                    allowBlank: false
                }
            },
            {
                xtype: 'actioncolumn',
                width: 40,
                tdCls: 'delete',
                items: [
                    {
                        icon: Utils.images.del,  // Use a URL in the icon config
                        tooltip: 'Delete',
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            alert("Delete " + rec.get('name'));
                            grid.getStore().removeAt(rowIndex);
                        }
                    }
                ]
            }
        ];
        return columns;
    },
    _createAllDiseases: function (filters, data) {

        var _this = this;

        var allDiseases = new Grid();
        allDiseases.model = this.diseaseModel;
        allDiseases.store = Ext.create('Ext.data.Store', {
            model: allDiseases.model,
            data: data,
            remoteSort: false,
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                }
            ],
            groupField: 'name'
        });

        allDiseases.grid = Ext.create('Ext.grid.Panel', {
            viewConfig: {
                plugins: {
                    ptype: 'gridviewdragdrop',
                    dragGroup: 'firstGridDDGroup',
                    dropGroup: 'secondGridDDGroup'
                },
                listeners: {
                    drop: function (node, data, dropRec, dropPosition) {
                        if (_this.edit) {
                            this.getStore().sort('name', 'ASC');
                        }
                    }
                }
            },
            tools: [
                {
                    type: 'refresh',
                    tooltip: 'Settings',
                    handler: function (event, toolEl, panel) {
                        if (_this.edit) {
                            _this.allDiseases.loadData(_this.diseases);
                            _this.primDiseases.removeAll();
                            _this.secDiseases.removeAll();
                        }
                    }
                }
            ],
            features: [
                filters
            ],
            store: allDiseases.store,
            columns: this.columns,
            stripeRows: true,
            title: "Diseases",
            margins: '0 2 0 0',
            flex: 1,
            height: "80%",
            multiSelect: true,
            margin: '0 15 10 0'
        });

        return allDiseases;


    },
    _createDiseaseSetGrid: function (title, mainGrid, geneGrid, filters) {

        var _this = this;

        var newGrid = new Grid();

        newGrid.model = _this.diseaseModel;
        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            remoteSort: false,
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                }
            ]

        });

        newGrid.grid = Ext.create('Ext.grid.Panel', {
                viewConfig: {
                    plugins: {
                        ptype: 'gridviewdragdrop',
                        dragGroup: 'secondGridDDGroup',
                        dropGroup: 'firstGridDDGroup'
                    },
                    listeners: {
                        drop: function (node, data, dropRec, dropPosition) {
                            this.getStore().sort('name', 'ASC');
                            //geneGrid.add({name: "Alemán"});
                            //geneGrid.add({name: "Ramos"});
                        }
                    }
                },
                store: newGrid.store,
                columns: this.columns,
                stripeRows: true,
                title: title,
                margins: '0 0 0 3',
                flex: 1,
                multiSelect: true,
                hideHeaders: true,
                tools: [
                    {
                        type: 'refresh',
                        tooltip: 'Settings',
                        handler: function (event, toolEl, panel) {
                            if (_this.edit) {
                                mainGrid.addAll(newGrid.getData());
                                mainGrid.refresh();
                                newGrid.removeAll();
                            }
                        }
                    }
                ],
                margin: '0 15 10 0',
                plain: true
//                bodyStyle: 'background:none'
            }
        );

        return newGrid;
    },
    _createGenesGrid: function (title) {

        var _this = this;

        var newGrid = new Grid();

        newGrid.model = _this.geneModel;
        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            remoteSort: false,
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                }
            ]
//            proxy: {
//                type: 'memory',
//                idProperty: 'name'
//
//            }
        });

        var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 1,
            autoCancel: false
        });

        newGrid.grid = Ext.create('Ext.grid.Panel', {
                store: newGrid.store,
                columns: this.columnsGenes,
                stripeRows: true,
                title: title,
                margins: '0 0 10 0',
                flex: 1,
//                bbar: [
//                    {
//                        text: 'Add new Gene',
////                        iconCls: 'employee-add',
//                        handler: function () {
//                            rowEditing.cancelEdit();
//
//                            // Create a record instance through the ModelManager
//                            var r = Ext.create('GeneModel', {
//                                name: 'New Gene'
//                            });
//
//                            newGrid.insert(newGrid.count(), r);
//                            rowEditing.startEdit(newGrid.getAt(newGrid.count() - 1), 0);
//                        }
//                    }
//                ],
                tools: [
                    {
                        type: 'plus',
                        tooltip: 'Add Gene',
                        handler: function (event, toolEl, panel) {
                            if (_this.edit) {
//                            mainGrid.addAll(newGrid.getData());
//                            mainGrid.refresh();
//                            newGrid.removeAll();
                                rowEditing.cancelEdit();

                                // Create a record instance through the ModelManager
                                var r = Ext.create('GeneModel', {
                                    name: 'New Gene'
                                });

                                newGrid.insert(newGrid.count(), r);
                                rowEditing.startEdit(newGrid.getAt(newGrid.count() - 1), 0);

                            }
                        }
                    }
                ],
                plugins: [rowEditing],
                hideHeaders: true
            }
        );

        return newGrid;

    },
//    _createSecDiseasesGrid: function (filters) {
//
//        var _this = this;
//
//        var sec = new Grid();
//
//        sec.model = _this.diseaseModel;
//        sec.store = Ext.create('Ext.data.Store', {
//            model: sec.model,
//            remoteSort: false,
//            sorters: [
//                {
//                    property: 'name',
//                    direction: 'ASC'
//                }
//            ]
//        });
//
//        sec.grid = Ext.create('Ext.grid.Panel', {
//                viewConfig: {
//                    plugins: {
//                        ptype: 'gridviewdragdrop',
//                        dragGroup: 'secondGridDDGroup',
//                        dropGroup: 'firstGridDDGroup'
//                    },
//                    listeners: {
//                        drop: function (node, data, dropRec, dropPosition) {
//                            this.getStore().sort('name', 'ASC');
//                        }
//                    }
//                },
//                store: sec.store,
//                columns: this.columns,
//                stripeRows: true,
//                title: 'Secondary Disease',
//                margins: '0 0 0 3',
//                flex: 1,
//                multiSelect: true,
//                tools: [
//                    {
//                        type: 'refresh',
//                        tooltip: 'Settings',
//                        handler: function (event, toolEl, panel) {
////                            for (var i = 0; i < _this.thirdGridStore.count(); i++) {
////                                _this.firstGridStore.add(_this.thirdGridStore.getAt(i));
////                            }
////                            _this.firstGrid.getView().refresh();
////                            _this.thirdGridStore.removeAll();
//
//                        }
//                    }
//                ]
//            }
//        );
//
//        return sec;
//    },
    _getDiseases: function () {
        var data = [];
        $.ajax({
            url: "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/feature/mutation/diseases",
            dataType: 'json',
            async: false,
            success: function (response, textStatus, jqXHR) {
                for (var i = 0; i < response.response.result.length; i++) {
                    data.push(
                        {
                            value: response.response.result[i],
                            name: Utils.formatText(response.response.result[i], "_")
                        });
                }

            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error loading Diseases');

            }
        });

        return data;
    }


}
;
