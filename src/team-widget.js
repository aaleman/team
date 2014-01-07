function PanelsWidget(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.id = Utils.genId("PanelsWidget");

    //set default args
    this.border = true;
    this.autoRender = false;
    this.targetId;
    this.width;
    this.height;

    //set instantiation args, must be last
    _.extend(this, args);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

PanelsWidget.prototype = {
    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;

        this.rendered = true;

    },
    draw: function () {

        this.panel = this._createPanel(this.targetId);
        this.tabPanel = this._createTabPanel();
        //this.settings = this._createSettings();
//        this.panelSettings = new PanelSettingsView({
//            autoRender: true
//        });
//        this.panelSettings.draw();


        this.panels = this._initializeDiseasePanel();

        this.form = this._createForm();
        this.grid1 = this._createGridVG();
        this.grid2 = this._createGridPrimary();
        this.gridSec = this._createGridSecondary();
        this.gridExtra = this._createGridExtra();

        this.panel.add(this.form);
        this.panel.add(this.tabPanel);

        this.tabPanel.add(this.grid2);
        this.tabPanel.add(this.gridSec);
        this.tabPanel.add(this.gridExtra);
        this.tabPanel.setActiveTab(this.grid2);

        this.dataSec = [];
        this.data2 = [];
        this.dataExtra = [];

        //this.panelSettings.show();
    },
    _createPanel: function (targetId) {
        var panel = Ext.create('Ext.panel.Panel', {
            renderTo: targetId,
            //title: "Panels",
            width: '100%',
            height: '100%',
            border: 0,
            layout: 'vbox',
            closable: false,
            cls: 'ocb-border-top-lightgrey',
            items: []
        });

        return panel;
    },
    _createTabPanel: function () {
        var panel = Ext.create('Ext.tab.Panel', {
            title: "Results",
            width: '100%',
            flex: 3,
            border: 0,
            layout: 'vbox',
            cls: 'ocb-border-top-lightgrey',
            items: []
        });

        return panel;

    },
    _createSettings: function () {

        var _this = this;

        Ext.define('DataObject', {
            extend: 'Ext.data.Model',
            fields: ['name']
        });


        var myData = [];

        myData = _this._getDiseases();


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


        this.firstGridStore = Ext.create('Ext.data.Store', {
            model: 'DataObject',
            data: myData,
            remoteSort: false,
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                }
            ],
            groupField: 'name',
            groupers: {
                property: "name",
                getGroupString: function (record) {
                    return record.get('name')[0];
                }
            }
        });

        this.secondGridStore = Ext.create('Ext.data.Store', {
            model: 'DataObject',
            remoteSort: false,
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                }
            ]
        });

        this.thirdGridStore = Ext.create('Ext.data.Store', {
            model: 'DataObject',
            remoteSort: false,
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                }
            ]
        });

        var columns = [
            {
                text: "Name",
                flex: 1,
                sortable: true,
                groupable: true,
                dataIndex: 'name',
                filter: {
                    type: 'string'
                }
            },
        ];

        this.firstGrid = Ext.create('Ext.grid.Panel', {
            viewConfig: {
                plugins: {
                    ptype: 'gridviewdragdrop',
                    dragGroup: 'firstGridDDGroup',
                    dropGroup: 'secondGridDDGroup'
                },
                listeners: {
                    drop: function (node, data, dropRec, dropPosition) {
                        _this.firstGridStore.sort('name', 'ASC');
                    }
                }
            },
            tools: [
                {
                    type: 'refresh',
                    tooltip: 'Settings',
                    handler: function (event, toolEl, panel) {

                        _this.firstGridStore.loadData(myData);
                        _this.secondGridStore.removeAll();
                        _this.thirdGridStore.removeAll();

                    }
                }
            ],
            features: [filters],
            store: this.firstGridStore,
            columns: columns,
            stripeRows: true,
            title: 'Diseases',
            margins: '0 2 0 0',
            flex: 1,
            multiSelect: true
        });

        this.secondGrid = Ext.create('Ext.grid.Panel', {
                viewConfig: {
                    plugins: {
                        ptype: 'gridviewdragdrop',
                        dragGroup: 'secondGridDDGroup',
                        dropGroup: 'firstGridDDGroup'
                    },
                    listeners: {
                        drop: function (node, data, dropRec, dropPosition) {
                            _this.secondGridStore.sort('name', 'ASC');
                        }
                    }
                },
                store: this.secondGridStore,
                columns: columns,
                stripeRows: true,
                title: 'Primary Disease',
                margins: '0 0 0 3',
                flex: 1,
                multiSelect: true,
                tools: [
                    {
                        type: 'refresh',
                        tooltip: 'Settings',
                        handler: function (event, toolEl, panel) {
                            for (var i = 0; i < _this.secondGridStore.count(); i++) {
                                _this.firstGridStore.add(_this.secondGridStore.getAt(i));
                            }
                            _this.firstGrid.getView().refresh();
                            _this.secondGridStore.removeAll();

                        }
                    }
                ]
            }
        )
        ;

        this.thirdGrid = Ext.create('Ext.grid.Panel', {
            viewConfig: {
                plugins: {
                    ptype: 'gridviewdragdrop',
                    dragGroup: 'secondGridDDGroup',
                    dropGroup: 'firstGridDDGroup'
                },
                listeners: {
                    drop: function (node, data, dropRec, dropPosition) {
                        _this.thirdGridStore.sort('name', 'ASC');
                    }
                }
            },
            store: this.thirdGridStore,
            columns: columns,
            stripeRows: true,
            title: 'Secondary Disease',
            margins: '0 0 0 3',
            flex: 1,
            multiSelect: true,
            tools: [
                {
                    type: 'refresh',
                    tooltip: 'Settings',
                    handler: function (event, toolEl, panel) {
                        for (var i = 0; i < _this.thirdGridStore.count(); i++) {
                            _this.firstGridStore.add(_this.thirdGridStore.getAt(i));
                        }
                        _this.firstGrid.getView().refresh();
                        _this.thirdGridStore.removeAll();
                    }
                }
            ]
        });

        var panelName = Ext.create('Ext.form.TextField',
            {
                id: _this.id + '_panelname',
                name: 'panelname',
                fieldLabel: 'Name',
                height: 20,
                maxWidth: 300,
                margin: "0 0 20 0"
            });

        var window = Ext.create('Ext.window.Window', {
                    title: 'Settings',
                    height: 600,
                    width: 800,
                    layout: {
                        type: 'vbox',
                        align: 'stretch',
                    },
                    modal: true,
                    minimizable: true,
                    closable: false,
                    bodyPadding: 10,
                    items: [
                        panelName,
                        {
                            xtype: 'container',
                            flex: 1,
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            items: [
                                this.firstGrid,
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: {
                                        type: 'vbox',
                                        align: 'stretch'
                                    },
                                    items: [
                                        this.secondGrid,
                                        this.thirdGrid

                                    ]
                                }
                            ]

                        },
                    ],
                    listeners: {
                        minimize: function (win, obj) {
                            win.hide();
                        }
                    },
                    buttons: [
                        {
                            text: 'Add Panel',
                            handler: function () {

                                var name = Ext.getCmp(_this.id + "_panelname").getValue();
                                var pd = [];
                                var sd = [];

                                for (var i = 0; i < _this.secondGridStore.count(); i++) {
                                    pd.push(_this.secondGridStore.getAt(i).raw.value);
                                }

                                for (var i = 0; i < _this.thirdGridStore.count(); i++) {
                                    sd.push(_this.thirdGridStore.getAt(i).raw.value);
                                }

                                var panel = _this._createDiseasePanel(name, pd, sd);
                                _this._addPanelToForm(panel);

                                _this._clearSettings();
                                _this.settings.hide();

                            }
                        },
                        {
                            text: 'Clear',
                            handler: function () {
                                _this._clearSettings();
                            }
                        }
                    ]
                }
            )
            ;
        return window;
    },
    _createForm: function () {
        var _this = this;

        var data = [];
        Ext.each(_this.panels, function (panel, index) {
            data.push({
                name: panel.name,
                value: panel.name
            })
        });

        this.diseaseStore = Ext.create("Ext.data.Store", {
            fields: ['name','value'],
            data: data
        });

        var genes = Ext.create('Ext.form.field.File', {
            id: _this.id + "gene_list",
            fieldLabel: "Gene list",
            width: 500,
            emptyText: 'Select a file',
            allowBlank: false,
            name: 'genes'

        });

        var disease = Ext.create('Ext.form.field.ComboBox', {
            id: _this.id + "disease",
            name: "disease",
            fieldLabel: "Panel",
            store: this.diseaseStore,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'name',
            value: this.diseaseStore.getAt(0).get('value'),
            editable: false,
            allowBlank: false
        });


        var vcf = Ext.create('Ext.form.field.File', {
            id: _this.id + "vcf_file",
            fieldLabel: "Vcf File",
            width: 500,
            emptyText: 'Select a file',
            allowBlank: false,
            name: 'vcf'
        });
        var form = Ext.create('Ext.form.Panel', {
            title: "Search",
            width: "100%",
            height: 130,
            bodyPadding: '10 10 0',
            layout: 'vbox',
            defaults: {
                allowBlank: false,
                msgTarget: 'side',
                labelWidth: 70
            },
            items: [disease, vcf],
            buttons: [
                {
                    text: 'Run',
                    handler: function () {

                        _this.data1 = [];
                        _this.data2 = [];

                        _this.storeVC.removeAll();
                        _this.storeVG.removeAll();

                        _this.grid1.getView().refresh();
                        _this.grid2.getView().refresh();


                        var form = _this.form.getForm();
                        if (form.isValid()) {
                            _this.grid1.setLoading(true);
                            _this.grid2.setLoading(true);

                            var vcf_file = document.getElementById(vcf.fileInputEl.id).files[0];

                            var fds_vcf = new FileDataSource(vcf_file);

                            var panelName = Ext.getCmp(_this.id + "disease").getValue();
                            var panel;


                            for (var i = 0; i < _this.panels.length; i++) {
                                var elem = _this.panels[i];
                                if (elem.name == panelName) {
                                    panel = elem;
                                    break;
                                }
                            }

                            panel = _this._getVariants(panel);

                            fds_vcf.on("success", function (data) {
                                var variants = _this._parseVcfFile(data);

                                _this._filterVariants(variants, panel);

                                _this.storeVC.loadData(_this.data2);
                                _this.storeSec.loadData(_this.dataSec);
                                _this.storeExtra.loadData(_this.dataExtra);

                                Ext.getCmp(_this.id + "numRowsLabel").setText(_this.data2.length + " variants");
                                _this.grid2.setLoading(false);

                            });

                            fds_vcf.fetch(true);
                        }
                    }
                },
                {
                    text: 'Reset',
                    handler: function () {
                        _this.form.getForm().reset();
                    }
                }
            ],
            dockedItems: [],
            tools: []
        });

        return form;
    },
    _createGridVG: function () {

        var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: '{groupField}: {groupValue} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
        });


        var _this = this;

        _this.attributesVG = [
            {name: 'chromosome', type: 'String'},
            {name: 'position', type: 'int'},
            {name: 'id_snp', type: 'String'},
            {name: 'reference', type: 'String'},
            {name: 'alternate', type: 'String'},
            {name: 'gene', type: 'String'},
            {name: 'quality', type: 'float'},
            {name: 'filter', type: 'String'},
            {name: 'info', type: 'String'},
            {name: 'format', type: 'String'},
            {name: 'sample', type: 'String'},
            {name: 'sampleData', type: 'String'},
        ];
        _this.columnsVG = [
            new Ext.grid.RowNumberer({width: 30}),
            {
                text: 'Chromosome',
                dataIndex: 'chromosome',
                flex: 1
            },
            {
                text: 'Position',
                dataIndex: 'position',
                flex: 1
            },
            {
                text: 'Id',
                dataIndex: 'id_snp',
                flex: 1
            },
            {
                text: 'Ref',
                dataIndex: 'reference',
                flex: 1
            },
            {
                text: 'Alt',
                dataIndex: 'alternate',
                flex: 1
            },
            {
                text: 'Gene',
                dataIndex: 'gene',
                flex: 1
            },
            {
                text: 'Quality',
                dataIndex: 'quality',
                flex: 1
            },
            {
                text: 'Filter',
                dataIndex: 'filter',
                flex: 1
            },
            {
                text: 'Info',
                dataIndex: 'info',
                flex: 1
            },
            {
                text: 'Format',
                dataIndex: 'format',
                flex: 2
            },
            {
                text: 'Sample(s)',
                dataIndex: 'sample',
                flex: 10
            },
        ];

        _this.modelVG = Ext.define('Variant', {
            extend: 'Ext.data.Model',
            fields: _this.attributesVG
        });

        _this.storeVG = Ext.create('Ext.data.Store', {
            model: _this.modelVG,
            groupField: 'gene',
            data: [],
            autoLoad: false
        });

        var grid = Ext.create('Ext.grid.Panel', {
            title: 'Prim. Diagnosis',
            width: '100%',
            flex: 3,
            frame: true,
            store: _this.storeVG,
            columns: _this.columnsVG,
            loadMask: true,
            plugins: 'bufferedrenderer',
            features: [groupingFeature],
            dockedItems: [

                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items: [
                        {
                            xtype: 'tbtext',
                            id: this.id + "numRowsLabel"
                        }
                    ]
                }
            ]


        });



        return grid;

    },
    _createGridPrimary: function () {

        var _this = this;

        var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: '{groupField}: {groupValue} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
        });
        _this.attributesVC = [
            {name: 'chromosome', type: 'String'},
            {name: 'position', type: 'int'},
            {name: 'id_snp', type: 'String'},
            {name: 'reference', type: 'String'},
            {name: 'alternate', type: 'String'},
            {name: 'gene', type: 'String'},
            {name: 'quality', type: 'float'},
            {name: 'filter', type: 'String'},
            {name: 'info', type: 'String'},
            {name: 'format', type: 'String'},
            {name: 'sample', type: 'String'},
            {name: "gene", type: 'String'},
            {name: "ensembl_protein", type: 'String'},
            {name: "reference_mutation", type: 'String'},
            {name: "xref", type: 'String'},
            {name: "description", type: 'String'},
            {name: "omim", type: 'String'},
            {name: "hgvs_cds", type: 'String'},
            {name: "hgvs_protein", type: 'String'},
            {name: "sift", type: 'String'},
            {name: "polyphen", type: 'String'},
            {name: "ct", type: 'String'}
        ];
        _this.columnsVC = [
            new Ext.grid.RowNumberer({width: 30}),
            {
                text: 'Chromosome',
                dataIndex: 'chromosome',
                flex: 1
            },
            {
                text: 'Position',
                dataIndex: 'position',
                flex: 1
            },
            {
                text: 'Id',
                dataIndex: 'id_snp',
                flex: 1
            },
            {
                text: 'Ref',
                dataIndex: 'reference',
                flex: 1
            },
            {
                text: 'Alt',
                dataIndex: 'alternate',
                flex: 1
            },
            {
                text: 'Gene',
                dataIndex: 'gene',
                flex: 1
            },
            {
                text: 'Consequence Type',
                dataIndex: 'ct',
                flex: 1
            },
            {
                text: 'Quality',
                dataIndex: 'quality',
                flex: 1
            },
            {dataIndex: "ensembl_protein"   , text: 'Ensembl protein'   , flex: 1},
            {dataIndex: "reference_mutation", text: 'Reference mutation', flex: 1},
            {dataIndex: "xref"              , text: 'Xref'              , flex: 1},
            {dataIndex: "description"       , text: 'Description'       , flex: 1},
            {dataIndex: "omim"              , text: 'OMIM'              , flex: 1},
            {dataIndex: "hgvs_cds"          , text: 'Hgvs cds'          , flex: 1},
            {dataIndex: "hgvs_protein"      , text: 'Hgvs protein'      , flex: 1},
            {dataIndex: "sift"              , text: 'SIFT'              , flex: 1},
            {dataIndex: "polyphen"          , text: 'PolyPhen'          , flex: 1}
        ];

        _this.modelVC = Ext.define('Variant', {
            extend: 'Ext.data.Model',
            fields: _this.attributesVC
        });

        _this.storeVC = Ext.create('Ext.data.Store', {
            model: _this.modelVC,
            groupField: 'gene',
            data: [],
            autoLoad: false
        });

        var grid = Ext.create('Ext.grid.Panel', {
            title: 'Prim. Diagnosis',
            width: '100%',
            flex: 3,
            store: _this.storeVC,
            columns: _this.columnsVC,
            loadMask: true,
            plugins: 'bufferedrenderer',
            features: [groupingFeature],
            margin: "0 0 20 0",
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items: [
                        {
                            xtype: 'tbtext',
                            id: this.id + "numRowsLabel"
                        }
                    ]
                }
            ]
        });

        return grid;

    },
    _createGridSecondary: function () {

        var _this = this;

        var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: '{groupField}: {groupValue} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
        });
        _this.attributesSec = [
            {name: 'chromosome', type: 'String'},
            {name: 'position', type: 'int'},
            {name: 'id_snp', type: 'String'},
            {name: 'reference', type: 'String'},
            {name: 'alternate', type: 'String'},
            {name: 'gene', type: 'String'},
            {name: 'quality', type: 'float'},
            {name: 'filter', type: 'String'},
            {name: 'info', type: 'String'},
            {name: 'format', type: 'String'},
            {name: 'sample', type: 'String'},
            {name: "gene", type: 'String'},
            {name: "ensembl_protein", type: 'String'},
            {name: "reference_mutation", type: 'String'},
            {name: "xref", type: 'String'},
            {name: "description", type: 'String'},
            {name: "omim", type: 'String'},
            {name: "hgvs_cds", type: 'String'},
            {name: "hgvs_protein", type: 'String'},
            {name: "sift", type: 'String'},
            {name: "polyphen", type: 'String'},
            {name: "ct", type: 'String'}
        ];
        _this.columnsSec = [
            new Ext.grid.RowNumberer({width: 30}),
            {
                text: 'Chromosome',
                dataIndex: 'chromosome',
                flex: 1
            },
            {
                text: 'Position',
                dataIndex: 'position',
                flex: 1
            },
            {
                text: 'SNP Id',
                dataIndex: 'id_snp',
                flex: 1
            },
            {
                text: 'Ref',
                dataIndex: 'reference',
                flex: 1
            },
            {
                text: 'Alt',
                dataIndex: 'alternate',
                flex: 1
            }, {
                text: 'Gene',
                dataIndex: 'gene',
                flex: 1
            },
            {
                text: 'Conseq. Type',
                dataIndex: 'ct',
                flex: 1
            },
            {
                text: 'Quality',
                dataIndex: 'quality',
                flex: 1
            },
            {dataIndex: "ensembl_protein"   , text: 'Ensembl protein'   , flex: 1},
            {dataIndex: "reference_mutation", text: 'Reference mutation', flex: 1},
            {dataIndex: "xref"              , text: 'Xref'              , flex: 1},
            {dataIndex: "description"       , text: 'Description'       , flex: 1},
            {dataIndex: "omim"              , text: 'OMIM'              , flex: 1},
            {dataIndex: "hgvs_cds"          , text: 'Hgvs cds'          , flex: 1},
            {dataIndex: "hgvs_protein"      , text: 'Hgvs protein'      , flex: 1},
            {dataIndex: "sift"              , text: 'SIFT'              , flex: 1},
            {dataIndex: "polyphen"          , text: 'PolyPhen'          , flex: 1}
        ];

        _this.modelSec = Ext.define('Variant', {
            extend: 'Ext.data.Model',
            fields: _this.attributesSec
        });

        _this.storeSec = Ext.create('Ext.data.Store', {
            model: _this.modelSec,
            groupField: 'gene',
            data: [],
            autoLoad: false
        });

        var grid = Ext.create('Ext.grid.Panel', {
            title: 'Sec. Diagnosis',
            width: '100%',
            flex: 3,
            store: _this.storeSec,
            columns: _this.columnsSec,
            loadMask: true,
            plugins: 'bufferedrenderer',
            features: [groupingFeature],
            margin: "0 0 20 0",
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items: [
                        {
                            xtype: 'tbtext',
                            id: this.id + "numRowsLabel"
                        }
                    ]
                }
            ]
        });

        return grid;

    },
    _createGridExtra: function () {

        var _this = this;

        var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: '{groupField}: {groupValue} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
        });
        _this.attributesExtra = [
            {name: 'chromosome', type: 'String'},
            {name: 'position', type: 'int'},
            {name: 'id_snp', type: 'String'},
            {name: 'reference', type: 'String'},
            {name: 'alternate', type: 'String'},
            {name: 'gene', type: 'String'},
            {name: 'quality', type: 'float'},
            {name: 'filter', type: 'String'},
            {name: 'info', type: 'String'},
            {name: 'format', type: 'String'},
            {name: 'sample', type: 'String'},
            {name: "gene", type: 'String'},
            {name: "ensembl_protein", type: 'String'},
            {name: "reference_mutation", type: 'String'},
            {name: "xref", type: 'String'},
            {name: "description", type: 'String'},
            {name: "omim", type: 'String'},
            {name: "hgvs_cds", type: 'String'},
            {name: "hgvs_protein", type: 'String'},
            {name: "sift", type: 'String'},
            {name: "polyphen", type: 'String'}
        ];
        _this.columnsExtra = [
            new Ext.grid.RowNumberer({width: 30}),
            {
                text: 'Chromosome',
                dataIndex: 'chromosome',
                flex: 1
            },
            {
                text: 'Position',
                dataIndex: 'position',
                flex: 1
            },
            {
                text: 'Id',
                dataIndex: 'id_snp',
                flex: 1
            },
            {
                text: 'Ref',
                dataIndex: 'reference',
                flex: 1
            },
            {
                text: 'Alt',
                dataIndex: 'alternate',
                flex: 1
            }, {
                text: 'Gene',
                dataIndex: 'gene',
                flex: 1
            },
            {
                text: 'Quality',
                dataIndex: 'quality',
                flex: 1
            },
            {dataIndex: "ensembl_protein"   , text: 'Ensembl protein'   , flex: 1},
            {dataIndex: "reference_mutation", text: 'Reference mutation', flex: 1},
            {dataIndex: "xref"              , text: 'Xref'              , flex: 1},
            {dataIndex: "description"       , text: 'Description'       , flex: 1},
            {dataIndex: "omim"              , text: 'OMIM'              , flex: 1},
            {dataIndex: "hgvs_cds"          , text: 'Hgvs cds'          , flex: 1},
            {dataIndex: "hgvs_protein"      , text: 'Hgvs protein'      , flex: 1},
            {dataIndex: "sift"              , text: 'SIFT'              , flex: 1},
            {dataIndex: "polyphen"          , text: 'PolyPhen'          , flex: 1}
        ];

        _this.modelExtra = Ext.define('Variant', {
            extend: 'Ext.data.Model',
            fields: _this.attributesExtra
        });

        _this.storeExtra = Ext.create('Ext.data.Store', {
            model: _this.modelExtra,
            groupField: 'gene',
            data: [],
            autoLoad: false
        });

        var grid = Ext.create('Ext.grid.Panel', {
            title: 'Deleterious Variants',
            width: '100%',
            flex: 3,
            store: _this.storeExtra,
            columns: _this.columnsExtra,
            loadMask: true,
            plugins: 'bufferedrenderer',
            features: [groupingFeature],
            margin: "0 0 20 0",
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items: [
                        {
                            xtype: 'tbtext',
                            id: this.id + "numRowsLabel"
                        }
                    ]
                }
            ]
        });

        return grid;

    },
    _getGeneRegions: function () {

        for (var i = 0; i < DB.length; i++) {
            for (var j = 0; j < DB[i].genes.length; j++) {
                var reg = this._getRegion(DB[i].genes[i]);
                DB[i].genes[j].chromosome = reg.chr;
                DB[i].genes[j].start = reg.start;
                DB[i].genes[j].end = reg.end;
            }
        }
    },
    _getRegion: function (gene) {

        var reg = {};
        CellBaseManager.get({
            host: 'http://ws-beta.bioinfo.cipf.es/cellbase/rest',
            version: 'v3',
            species: 'hsapiens', //TODO multiples species
            category: 'feature',
            subCategory: 'gene',
            query: gene.name,
            resource: 'info',
            params: {
                include: "chromosome,start,end"
            },
            async: false,
            success: function (response, textStatus, jqXHR) {
                if (response.response[0].numResults > 0) {

                    reg = {
                        chr: response.response[0].result[0].chromosome,
                        start: response.response[0].result[0].start,
                        end: response.response[0].result[0].end

                    }

                }

            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error loading Gene');

            }
        });

        return reg;
    },
    _parseVcfFile: function (data) {

        var _this = this;
        var lines = data.split("\n");
        var variants = [];

        for (var i = 0; i < lines.length; i++) {

            var line = lines[i].replace(/^\s+|\s+$/g, "");
            if ((line != null) && (line.length > 0)) {
                var fields = line.split("\t");

                if (line.substr(0, 1) === "#") {
                    if (line.substr(1, 1) === "#") {
                        this.header += line.replace(/</gi, "&#60;").replace(/>/gi, "&#62;") + "<br>";
                    } else {
                        this.samples = fields.slice(9);
                    }
                } else {
                    var samples = "";
                    for (var j = 9; j < fields.length; j++) {
                        samples += fields[j];
                        if (j + 1 < fields.length) {
                            samples += "\t";
                        }
                    }
                    variants.push(
                        {
                            chromosome: fields[0],
                            position: parseInt(fields[1]),
                            start: parseInt(fields[1]),//added
                            end: parseInt(fields[1]),//added
                            id_snp: fields[2],
                            reference: fields[3],
                            alternate: fields[4],
                            quality: fields[5],
                            filter: fields[6],
                            info: fields[7], //.replace(/;/gi, "<br>"),
                            format: fields[8],
                            sample: samples
                            //sampleData: line
                            //featureType : "vcf"
                        }
                    );
                }
                delete fields;
            }
        }
        return variants;
    },
    _filterVariants: function (variants, panel) {
        var _this = this;

        //debugger
        for (var i = 0; i < variants.length; i++) {
            var variant = variants[i];
            var panelVariant;

            if ((panelVariant = _this._checkVariant(variant, panel.primVar)) != null) {
                console.log("ENTRA");


                variant.gene = panelVariant.gene;
//                variant.hgvs_cds = panelVariant.mutationCDS;
//                variant.hgvs_protein = panelVariant.mutationAA;
//                variant.description = panelVariant.description;

                _this.data2.push(variant);
            }
        }

        for (var i = 0; i < variants.length && _this.data2.length == 0; i++) {
            var variant = variants[i];
            var panelVariant;

            if ((panelVariant = _this._checkVariant(variant, panel.secVar)) != null) {


                variant.gene = panelVariant.gene;
//                variant.hgvs_cds = panelVariant.mutationCDS;
//                variant.hgvs_protein = panelVariant.mutationAA;
//                variant.description = panelVariant.description;

                _this.dataSec.push(variant);
            }
        }


//        if (_this.data2.length == 0 && _this.dataSec.length == 0) {
        if (true) {

            var req = [];
            var gene = [];


            for (var i = 0; i < panel.primVar.length; i++) {

                var variant = panel.primVar[i];
                req.push(variant.chromosome + ":" + variant.start + "::G");
            }

            var url = "http://ws.bioinfo.cipf.es/cellbase/rest/latest/hsa/genomic/variant/" + req.join(",") + "/consequence_type?of=json";

            console.log(url);


            $.ajax({
                url: url,
                dataType: 'json',
                async: false,
                success: function (response, textStatus, jqXHR) {

                    for (var j = 0; j < response.length; j++) {
                        var elem = response[j];

                        if (elem.geneName != "") {
                            gene.push(elem.geneName);
                        }

                        gene = gene.filter(function (elem, pos, self) {
                            return self.indexOf(elem) == pos;
                        });

                    }

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error loading Diseases');

                }
            });

            var final_genes = [];


            CellBaseManager.get({
                    host: 'http://ws-beta.bioinfo.cipf.es/cellbase/rest',
                    version: 'v3',
                    species: 'hsapiens', //TODO multiples species
                    category: 'feature',
                    subCategory: 'gene',
                    query: gene.join(","),
                    resource: 'info',
                    params: {
                        include: "chromosome,start,end"
                    },
                    async: false,
                    success: function (response, textStatus, jqXHR) {

                        console.log(response);
                        for (var i = 0; i < response.response.length; i++) {

                            if (response.response[i].numResults > 0) {

                                final_genes.push({
                                    name: response.response[i].id,
                                    chr: response.response[i].result[0].chromosome,
                                    start: response.response[i].result[0].start,
                                    end: response.response[i].result[0].end

                                });
                            }

                        }


                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('Error loading Gene');

                    }
                }
            )
            ;

            for (var i = 0; i < variants.length; i++) {

                var variant = variants[i];
                var panelVariant;


                if (final_genes.length > 0 && (panelVariant = _this._checkGeneVariant(variant, final_genes)) != null) {
                    variant.gene = panelVariant.name;
                    _this.dataExtra.push(variant);
                }
            }
        }


        if (_this.data2.length > 0) { // VariantEffect

            var req = [];


            for (var i = 0; i < _this.data2.length; i++) {
                console.log(variant);
                var variant = _this.data2[i];
                req.push(variant.chromosome + ":" + variant.start + ":" + variant.reference + ":" + variant.alternate);
            }

            console.log(req);

            $.ajax({
                url: "http://ws.bioinfo.cipf.es/cellbase/rest/latest/hsa/genomic/variant/" + req.join(",") + "/consequence_type?of=json",
                dataType: 'json',
                async: false,
                success: function (response, textStatus, jqXHR) {


                    for (var i = 0; i < _this.data2.length; i++) {
                        var variant = _this.data2[i];
                        var gene = [];
                        var ct = [];

                        for (var j = 0; j < response.length; j++) {
                            var elem = response[j];

                            if (elem.chromosome == variant.chromosome && elem.position == variant.start) {
                                if (elem.geneName != "") {
                                    gene.push(elem.geneName);
                                }
                                if (elem.consequenceTypeObo != "") {
                                    ct.push(elem.consequenceTypeObo);
                                }
                            }
                        }

                        gene = gene.filter(function (elem, pos, self) {
                            return self.indexOf(elem) == pos;
                        });


                        ct = ct.filter(function (elem, pos, self) {
                            return self.indexOf(elem) == pos;
                        })

                        variant.gene = gene.join(",");
                        variant.ct = ct.join(",");
                    }

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error loading Diseases');

                }
            });


        }

        if (_this.dataSec.length > 0) { // VariantEffect

            var req = [];

            for (var i = 0; i < _this.dataSec.length; i++) {
                console.log(variant);
                var variant = _this.dataSec[i];
                req.push(variant.chromosome + ":" + variant.start + ":" + variant.reference + ":" + variant.alternate);
            }

            console.log(req);

            $.ajax({
                url: "http://ws.bioinfo.cipf.es/cellbase/rest/latest/hsa/genomic/variant/" + req.join(",") + "/consequence_type?of=json",
                dataType: 'json',
                async: false,
                success: function (response, textStatus, jqXHR) {


                    for (var i = 0; i < _this.dataSec.length; i++) {
                        var variant = _this.dataSec[i];
                        var gene = [];
                        var ct = [];

                        for (var j = 0; j < response.length; j++) {
                            var elem = response[j];

                            if (elem.chromosome == variant.chromosome && elem.position == variant.start) {
                                if (elem.geneName != "") {
                                    gene.push(elem.geneName);
                                }
                                if (elem.consequenceTypeObo != "") {
                                    ct.push(elem.consequenceTypeObo);
                                }
                            }
                        }

                        gene = gene.filter(function (elem, pos, self) {
                            return self.indexOf(elem) == pos;
                        });


                        ct = ct.filter(function (elem, pos, self) {
                            return self.indexOf(elem) == pos;
                        })

                        variant.gene = gene.join(",");
                        variant.ct = ct.join(",");
                    }

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error loading Diseases');

                }
            });


        }


    },
    _checkCosmicVariant: function (variant, genes) {
        for (var key in genes) {
            var gene = genes[key];

            for (var i = 0; i < gene.variants.length; i++) {
                var geneVariant = gene.variants[i];
                if (geneVariant.chromosome == variant.chromosome && variant.position == geneVariant.position) {
                    geneVariant.gene_name = gene.name;
                    return geneVariant;
                }

            }
        }
        return null;

    },
    _checkVariant: function (variant, variants) {

        for (var i = 0; i < variants.length; i++) {
            var aux = variants[i];
            if (variant.chromosome == aux.chromosome && variant.start == aux.start && variant.end == aux.end) {
                return aux;
            }
        }
        return null;

    },
    _checkGeneVariant: function (variant, genes) {

        for (var i = 0; i < genes.length; i++) {
            var gene = genes[i];
            if (gene.chr == variant.chromosome && gene.start <= variant.start && variant.end <= gene.end) {
                return gene;

            }
        }
        return null;


    },
    _initializeDiseasePanel: function () {
        var panels = []
        panels.push(this._createDiseasePanel("Example Panel Ret.", ["Retinitis"], ["Usher syndrome"]));

        if (localStorage.bioinfo_panels_panels) {
            var lsPanels = JSON.parse(localStorage.bioinfo_panels_panels);
            for (var i = 0; i < lsPanels.length; i++) {
                panels.push(lsPanels[i]);
            }
        }

        if(localStorage.bioinfo_panels_user_settings)
            {
                var userDefinedPanels = JSON.parse(localStorage.bioinfo_panels_user_settings);
                for(var i = 0; i< userDefinedPanels.length; i++){
                    panels.push(userDefinedPanels[i]);
                }
            }

        return panels;
    },
    _createDiseasePanel: function (name, primDis, secDis, genes) {
        return {
            name: name,
            primaryDiseases: primDis,
            secondaryDiseases: secDis,
            genes: genes
        };
    },
    _addPanelToForm: function (panel) {

        var panels;
        var elem = {
            name: panel.name,
            value: panel.name
        };

        if (localStorage.bioinfo_panels_panels) {
            panels = JSON.parse(localStorage.bioinfo_panels_panels);
        } else {
            panels = [];
        }
        panels.push(panel);
        localStorage.bioinfo_panels_panels = JSON.stringify(panels);

        this.diseaseStore.add(elem);
    },
    _clearSettings: function () {
        var _this = this;
        Ext.getCmp(_this.id + "_panelname").reset();


        for (var i = 0; i < _this.thirdGridStore.count(); i++) {
            _this.firstGridStore.add(_this.thirdGridStore.getAt(i));
        }

        for (var i = 0; i < _this.secondGridStore.count(); i++) {
            _this.firstGridStore.add(_this.secondGridStore.getAt(i));
        }
        _this.firstGrid.getView().refresh();
        _this.thirdGridStore.removeAll();
        _this.secondGridStore.removeAll();
    },
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
    },
    _getVariants: function (panel) {

        var variantsPrim = [];
        var variantsSec = [];

        var dataSec;
        var dataPrim;
        var genes = [];

        //if (panel.primDis != null && panel.primDis.length > 0) {
//            dataPrim = panel.primDis.join(",");
//            $.ajax({
//                url: "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/feature/mutation/list?disease=" + dataPrim,
//                dataType: 'json',
//                async: false,
//                success: function (response, textStatus, jqXHR) {
//
//                    for (var i = 0; i < response.response.result.length; i++) {
//                        variantsPrim.push(response.response.result[i]);
//                        genes.push(response.response.result[i].gene);
//                    }
//
//                },
//                error: function (jqXHR, textStatus, errorThrown) {
//                    console.log('Error loading Diseases');
//
//                }
//            });

            for (var i = 0; i < panel.primaryDiseases.length; i++) {
                var disease = panel.primaryDiseases[i];
                console.log(disease);
                console.log(DB.length);
                for (var j = 0; j < DB.length; j++) {
                    var variant = DB[j];

                    if (variant.primaryHistology.indexOf(disease) != -1) {
                        variantsPrim.push(variant);
                    }
                }
            }


        //}


        //if (panel.secDis != null && panel.secDis.length > 0) {
//            dataSec = panel.secDis.join(",");
//            $.ajax({
//                url: "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/feature/mutation/list?disease=" + dataSec,
//                dataType: 'json',
//                async: false,
//                success: function (response, textStatus, jqXHR) {
//                    for (var i = 0; i < response.response.result.length; i++) {
//                        variantsSec.push(response.response.result[i]);
//                    }
//                },
//                error: function (jqXHR, textStatus, errorThrown) {
//                    console.log('Error loading Diseases');
//                }
//            });

        for (var i = 0; i < panel.secondaryDiseases.length; i++) {
                var disease = panel.secondaryDiseases[i];
                console.log(disease);
                for (var j = 0; j < DB.length; j++) {
                    var variant = DB[j];

                    if (variant.primaryHistology.indexOf(disease) != -1) {
                        variantsSec.push(variant);
                    }
                }
            }

        //}

        console.log(variantsPrim);
        console.log(variantsSec);

        panel.primVar = variantsPrim;
        panel.secVar = variantsSec;

        genes = genes.filter(function (elem, pos, self) {
            return self.indexOf(elem) == pos;
        })

        if (genes.length > 0) {
            Array.prototype.chunk = function (chunkSize) {
                var array = this;
                return [].concat.apply([],
                    array.map(function (elem, i) {
                        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
                    })
                );
            }

            var regions = [];

            var chunks = genes.chunk(200);

            for (var i = 0; i < chunks.length; i++) {

                CellBaseManager.get({
                    host: 'http://ws-beta.bioinfo.cipf.es/cellbase/rest',
                    version: 'v3',
                    species: 'hsapiens', //TODO multiples species
                    category: 'feature',
                    subCategory: 'gene',
                    query: chunks[i].join(","),
                    resource: 'info',
                    params: {
                        include: "chromosome,start,end"
                    },
                    async: false,
                    success: function (response, textStatus, jqXHR) {

                        for (var j = 0; j < response.response.length; j++) {

                            if (response.response[j].numResults > 0) {

                                var reg = {
                                    name: response.response[j].id,
                                    chr: response.response[j].result[0].chromosome,
                                    start: response.response[j].result[0].start,
                                    end: response.response[j].result[0].end

                                }
                                regions.push(reg);
                            }

                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('Error loading Gene');
                    }
                });

            }


        }
        panel.genes = regions;

        return panel;

    }

}
;
