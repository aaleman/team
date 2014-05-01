function TeamWidget(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.id = Utils.genId("TeamWidget");

    //set default args
    this.border = true;
    this.autoRender = false;
    this.targetId;
    this.width;
    this.height;
    this.userSettings;
    this.sidePanelDiv;

    //set instantiation args, must be last
    _.extend(this, args);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

TeamWidget.prototype = {
    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;

        _this.mutationReportModel = Ext.define('MutationReportModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: "chromosome", type: "string"},
                {name: "start", type: "int"},
                {name: "end", type: "int"},
                {name: "riskAllele", type: "string"},
                {name: "source", type: "string"},
                {name: "associatedGenes", type: "string"},
                {name: "phenotype", type: "string"}
            ]
        });

        _this.mutationReportStore = Ext.create("Ext.data.Store", {
            model: _this.mutationReportModel,
            storeId: "MutationReportStore",
            autoload: false
        });

        _this.mutationReportGrid = Ext.create('Ext.grid.Panel', {
            store: _this.mutationReportStore,
            height: 540,
            columns: [
                {text: "Chromosome", flex: 1, dataIndex: "chromosome"      },
                {text: "Start", flex: 1, dataIndex: "start"           },
                {text: "End", flex: 1, dataIndex: "end"             },
                {text: "RiskAllele", flex: 1, dataIndex: "riskAllele"      },
                {text: "Source", flex: 1, dataIndex: "source"          },
                {text: "AssociatedGenes", flex: 1, dataIndex: "associatedGenes" },
                {text: "Phenotype", flex: 1, dataIndex: "phenotype" }
            ],
            plugins: 'bufferedrenderer',
            title: 'Mutations',
            margins: '0 0 10 0'
        });

        _this.mainStore = Ext.create("Ext.data.Store", {
            fields: [
                {name: 'panelType', type: 'String'},
                {name: 'panelId', type: 'int'},
                {name: 'name', type: 'String'},
                {name: 'value', type: 'String',
                    convert: function (v, rec) {
                        return rec.get('panelType') + '_' + rec.get('panelId');
                    }}
            ],
            data: [],
            storeId: 'MainStore'
        });

        _this.mainStore.on('add', function (store, records, successful, eOpts) {

            var disStore = Ext.getStore("DiseaseStore");
            var exStore = Ext.getStore("ExampleStore");
            var userStore = Ext.getStore("UserExampleStore");

            for (var i = 0; i < records.length; i++) {
                var record = records[i];

                disStore.add(record);
                if (record.get("panelType") == "user") {
                    userStore.add(record);
                } else if (record.get("panelType") == "example") {
                    exStore.add(record);
                }
            }
        });

        _this.mainStore.on("remove", function (store, record, index, isMove, eOpts) {
            var disStore = Ext.getStore("DiseaseStore");
            var userStore = Ext.getStore("UserExampleStore");
            disStore.remove(record);
            userStore.remove(record);
        });

        _this.diseaseStore = Ext.create("Ext.data.Store", {
            fields: [
                {name: 'panelType', type: 'String'},
                {name: 'panelId', type: 'int'},
                {name: 'name', type: 'String'},
                {name: 'value', type: 'String',
                    convert: function (v, rec) {
                        return rec.get('panelType') + '_' + rec.get('panelId');
                    }}
            ],
            data: [],
            storeId: 'DiseaseStore'
        });

        _this.userDefinedStore = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'name', type: 'String'},
                {name: 'panelId', type: 'String'},
                {name: 'panelType', type: 'String'}
            ],
            data: [],
            storeId: 'UserExampleStore'
        });

        _this.exampleStore = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'name', type: 'String'},
                {name: 'panelId', type: 'String'},
                {name: 'panelType', type: 'String'}
            ],
            storeId: 'ExampleStore'
        });

        _this.userSettings = new UserSettings({
            handlers: {
                "add:panel": function (e) {
                    Ext.getStore("MainStore").add(e.args);
                },
                "remove:panel": function (e) {
                    var panelName = e.panelName;
                    var storeAux = Ext.getStore("MainStore").queryBy(function (rec) {
                        return rec.data.panelType == "user" && rec.data.name == panelName;
                    });
                    Ext.getStore("MainStore").remove(storeAux.items);
                }
            }
        });

        _this.teamListWidget = new TeamListWidget({
            'title': 'Panels',
            'pageSize': 7,
            'targetId': this.sidePanelDiv,
            'order': 0,
            'width': 320,
            'height': 425,
            border: true,
            'mode': 'view',
            userSettings: this.userSettings
        });
        _this.teamListWidget.render();

        _this.rendered = true;

    },
    draw: function () {
        var _this = this;

        this.teamListWidget.draw();
        this.panel = this._createPanel(this.targetId);
        this.tabPanel = this._createTabPanel();
        this.gridEffect = this._createEffectGrid();
        this.progress = Ext.create('Ext.ProgressBar', {
            text: 'Progress',
            border: 1,
            margin: 3,
            height: 20,
            width: "100%",
            animate: true
        });

        this.form = this._createForm();
        this.primDisGrid = this._createDiseaseGrid("Diagnostic");
        this.extraGrid = this._createDiseaseGrid("Secondary findings");

        this.panel.add(this.form);
        this.panel.add(this.tabPanel);
        this.panel.add(this.gridEffect);
//        this.panel.add(this.progress);

        this.tabPanel.add(this.primDisGrid.getPanel());
        this.tabPanel.add(this.extraGrid.getPanel());
        this.tabPanel.setActiveTab(this.primDisGrid.getPanel());

        this.dataPrim = [];
        this.dataExtra = [];

        this.reportWindow = this._createReportWindow();
    },
    _createPanel: function (targetId) {
        var panel = Ext.create('Ext.panel.Panel', {
            renderTo: targetId,
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
    _createReportWindow: function () {
        var _this = this;

        var title = Ext.create('Ext.form.TextField', {
            id: _this.id + "_title_report",
            name: 'title',
            fieldLabel: 'Title',
            labelAlign: 'left',
            allowBlank: false
        });

        var info = Ext.create('Ext.form.TextArea', {
            id: _this.id + "_info_report",
            name: 'info',
            width: 500,
            fieldLabel: 'Information',
            labelAlign: 'left',
            allowBlank: true
        });

        var name = Ext.create('Ext.form.TextField', {
            id: _this.id + "_name_report",
            name: 'name',
            fieldLabel: 'Name',
            labelAlign: 'left',
            allowBlank: false
        });

        var date = Ext.create('Ext.form.DateField', {
            id: _this.id + "_date_report",
            name: 'date',
            fieldLabel: 'Date',
            labelAlign: 'left',
            allowBlank: false,
            maxValue: new Date(),  // limited to the current date or prior
            value: new Date()  // defaults to today
        });

        var comments = Ext.create('Ext.form.TextArea', {
            id: _this.id + "_comments_report",
            name: 'comments',
            width: 500,
            fieldLabel: 'Comments',
            labelAlign: 'left',
            allowBlank: true
        });

        var primCheckBox = Ext.create('Ext.form.Checkbox', {
            boxLabel: 'Diagnostic',
            name: 'prim',
            inputValue: true,
            id: 'prim',
            checked: true
        });

        var secCheckBox = Ext.create('Ext.form.Checkbox', {
            boxLabel: 'Secondary findings',
            name: 'sec',
            inputValue: true,
            id: 'sec',
            checked: true
        });

        var form = Ext.create('Ext.form.Panel', {
            id: _this.id + "_form_report",
            bodyStyle: 'background:none',
            bodyPadding: 4,
            layout: {
                type: 'vbox'
            },
            items: [
                title,
                info,
                {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Data',
                    items: [
                        primCheckBox,
                        secCheckBox
                    ]
                },
                date,
                name,
                comments],
            buttons: [
                {
                    text: 'Reset',
                    handler: function () {
                        this.up('form').getForm().reset();
                    }
                },
                {
                    text: 'Generate!!',
                    formBind: true,
                    disabled: true,
                    handler: function () {
                        var form = this.up('form').getForm();
                        if (form.isValid()) {
                            var values = form.getValues();
                            _this._generateReport(values);
                            Ext.getCmp(_this.id + "_report_generator_window").hide();
                        }
                    }
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            id: _this.id + "_report_generator_window",
            title: "Report Generator",
            height: 380,
            width: 600,
            minimizable: true,
            closable: false,
            bodyPadding: 10,
            listeners: {
                minimize: function (win, obj) {
                    win.hide();
                }
            },
            items: [form]
        });
        return window;
    },
    _generateReport: function (values) {

        var _this = this;

        Ext.ux.grid.Printer.printAutomatically = false;

        var panelOpt = Ext.getCmp(_this.id + "disease").getValue();
        var panelSplit = panelOpt.split("_");
        var panelType = panelSplit[0];
        var panelId = panelSplit[1];

        panel = _this.userSettings.get(panelType, panelId);

        Ext.getStore("MutationReportStore").suspendEvents();
        for (var i = 0; i < panel.diseases.length; i++) {
            var disName = panel.diseases[i].name;
            var url = "http://ws-beta.bioinfo.cipf.es/cellbase-staging-aleman/rest/v3/hsapiens/genomic/variant/" + disName + "/phenotype?limit=100"
            url = url.replace(/ /g, "%20");

            console.log(url);

            $.ajax({
                url: url,
                dataType: 'json',
                async: false,
                success: function (response, textStatus, jqXHR) {
                    for (var i = 0; i < response.response.numResults; i++) {
                        var dis = response.response.result[i];
                        for (var j = 0; j < dis.associatedGenes.length; j++) {
                            Ext.getStore("MutationReportStore").add(dis);
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error loading Mutations');
                }
            });

            for (var j = 0; j < panel.diseases[i].mutations.length; j++) {
                var mut = panel.diseases[i].mutations[j];
                var dis = {
                    chromosome: mut.chr,
                    start: mut.pos,
                    end: mut.pos,
                    riskAllele: mut.alt,
                    source: "user",
                    phenotype: disName
                };
                console.log(dis);

                Ext.getStore("MutationReportStore").add(dis);

            }
        }

        Ext.getStore("MutationReportStore").resumeEvents();
        Ext.getStore("MutationReportStore").fireEvent("refresh");

        var htmlGrid1 = Ext.ux.grid.Printer.print(_this.primDisGrid.grid);
        var htmlGrid2 = Ext.ux.grid.Printer.print(_this.extraGrid.grid);
        var htmlGrid3 = Ext.ux.grid.Printer.print(_this.mutationReportGrid);


        var scriptPath = Ext.Loader.getPath('Ext.ux.grid.Printer');
        var stylesheetPath = scriptPath.substring(0, scriptPath.indexOf('Printer.js')) + 'gridPrinterCss/print.css';

        var win = window.open('', 'printgrid');

        var style = "<style>" +
            ".bodyReport {font-family: tahoma, arial, verdana, sans-serif;}" +
            ".reportTitle {height: 20px;font-size: 20px;text-align: center;padding: 10px 10px 10px 10px;}" +
            ".gridHeader {height: 30px;}" +
            ".reportInfo {margin-left:50px;margin-right:50px;margin-top: 20px;margin-bottom:30px;text-indent: 20px;text-align: center;}" +
            ".gridHeader {padding-left: 100px;margin-top: 20px;margin-bottom: 20px;}" +
            ".reportGrid{margin-left:50px;margin-right:50px;}" +
            "td{max-width: 200px;word-wrap:break-word}" +
            ".reportDate{margin-top: 20px;margin-bottom:20px;margin-left:50px;}" +
            ".reportDateText{}" +
            ".reportName{margin-top: 20px;margin-left:50px;}" +
            ".reportComments{margin-top:20px;margin-left:50px;margin-bottom: 10px;}" +
            ".reportCommentsText{text-indent: 20px;margin-left:50px;}" +
            "</style>";
        //document must be open and closed
        win.document.open();
        win.document.write(
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
                '<html class="' + Ext.baseCSSPrefix + 'ux-grid-printer">' +
                '<head>' +
                '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />' +
                '<link href="' + stylesheetPath + '" rel="stylesheet" type="text/css" />' +
                '<title>Team Report</title>' + style);
        win.document.write('</head>' +
                '<body class="' + Ext.baseCSSPrefix + 'ux-grid-printer-body bodyReport">' +

                '<div class="' + Ext.baseCSSPrefix + 'ux-grid-printer-noprint ' + Ext.baseCSSPrefix + 'ux-grid-printer-links">' +
                '<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkprint" href="javascript:void(0);" onclick="window.print();">Print</a>',
                '<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkclose" href="javascript:void(0);" onclick="window.close();">Close</a>' +
                '</div>'
        )
        ;
        win.document.write('<div class="reportTitle">' + values.title + '</div>')
        win.document.write('<div class="reportInfo">' + values.info + '</div>')
        if (values.prim) {
            win.document.write('<div class="gridHeader">Diagnostic: </div>');
            win.document.write('<div class="reportGrid">')
            win.document.write(htmlGrid1);
            win.document.write('</div>');

        }
        if (values.sec) {
            win.document.write('<div class="gridHeader">Secondary findings: </div>');
            win.document.write('<div class="reportGrid">')
            win.document.write(htmlGrid2);
            win.document.write('</div>')
        }

        win.document.write('<div class="gridHeader">Panel Configuration: </div>');
        win.document.write('<div class="reportGrid">')
        win.document.write(htmlGrid3);
        win.document.write('</div>')
        win.document.write('<div class="reportDate">Date:  ' + values.date + '</div>')
        win.document.write('<div class="reportName">Name:  ' + values.name + '</div>')
        win.document.write('<div class="reportComments">Comments: </div><div class="reportCommentsText">' + values.comments + '</div>')
        win.document.write('</body></html>');
        win.document.close();

        if (this.printAutomatically) {
            win.print();
        }
    },
    _createTabPanel: function () {
        var _this = this;

        var panel = Ext.create('Ext.tab.Panel', {
                title: "Results",
                width: '100%',
                flex: 3,
                border: 1,
                layout: 'vbox',
                margin: '0 5 5 5',
                cls: 'ocb-border-top-lightgrey',
                items: [],
                bbar: [
                    '->',
                    {
                        xtype: 'button',
                        id: _this.id + "_generate_report",
                        text: 'Generate Report',
                        disabled: true,
                        handler: function () {
                            Ext.getCmp(_this.id + "_form_report").getForm().reset();
                            _this.reportWindow.show();
                        }
                    }
                ]
            })
            ;

        return panel;
    },
    _createForm: function () {
        var _this = this;


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
            valueField: 'value',
            editable: false,
            allowBlank: false,
            emptyText: "Select a Panel..."
        });

        var vcf = Ext.create('Ext.form.field.File', {
            id: _this.id + "vcf_file",
            fieldLabel: "VCF File",
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
            margin: '5 5 20 5',
            items: [disease, vcf],
            buttonAlign: 'left',
            buttons: [
                {
                    text: 'Run',
                    handler: function () {
                        _this.tabPanel.setActiveTab(_this.primDisGrid.getPanel());
                        var button = Ext.getCmp(_this.id + "_generate_report");
                        button.disable();

                        _this.dataPrim = [];
                        _this.dataExtra = [];

                        _this.primDisGrid.clear();
                        _this.extraGrid.clear();
                        _this.gridEffect.getStore().removeAll();

                        var form = _this.form.getForm();
                        if (form.isValid()) {
                            _this.primDisGrid.setLoading(true);

                            var vcf_file = document.getElementById(vcf.fileInputEl.id).files[0];

                            var fds_vcf = new FileDataSource({
                                file: vcf_file
                            });

                            var panelOpt = Ext.getCmp(_this.id + "disease").getValue();
                            var panelSplit = panelOpt.split("_");
                            var panelType = panelSplit[0];
                            var panelId = panelSplit[1];

                            panel = _this.userSettings.get(panelType, panelId);

                            fds_vcf.on("success", function (data) {

                                _this.progress.updateProgress(0.1, 'Parsing Vcf File');

                                var variants = _this._parseVcfFile(data);

                                _this._filterVariants(variants, panel);

                                _this.primDisGrid.loadData(_this.dataPrim);
                                _this.extraGrid.loadData(_this.dataExtra);

                                if (_this.primDisGrid.count() > 0) {
                                    _this.tabPanel.setActiveTab(_this.primDisGrid.getPanel());
                                } else if (_this.extraGrid.count() > 0) {
                                    _this.tabPanel.setActiveTab(_this.extraGrid.getPanel());
                                }

                                Ext.getCmp(_this.id + "numRowsLabel").setText(_this.dataPrim.length + " variants");
                                _this.primDisGrid.setLoading(false);

                                if (_this.primDisGrid.count() > 0 || _this.extraGrid.count() > 0) {
                                    button.enable();

                                }

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
    _createDiseaseGrid: function (gridName) {

        var _this = this;
        var newGrid = new Grid();

        var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: '{groupField}: {groupValue} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
        });

        var attributes = [
            {name: 'chromosome', type: 'String'},
            {name: 'position', type: 'int'}   ,
            {name: 'id_snp', type: 'String'},
            {name: 'reference', type: 'String'},
            {name: 'alternate', type: 'String'},
            {name: 'gene', type: 'String'},
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
            {name: "ct", type: 'String'},
            {name: "transcript", type: 'String'},
            {name: "aaPos", type: 'int'}   ,
            {name: "aaChange", type: 'String'},
            {name: "phenotype", type: 'String'},
            {name: "source", type: 'String'},
            {name: "conservation", type: 'float'},
        ];
        var renderer = function (value) {
            if (value == '') {
                return ".";
            }
            return value;
        };

        var columns = [
            new Ext.grid.RowNumberer({width: 30}),
            {dataIndex: 'chromosome', text: 'Chromosome', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'position', text: 'Position', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'id_snp', text: 'SNP Id', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'reference', text: 'Ref', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'alternate', text: 'Alt', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'gene', text: 'Gene', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'ct', text: 'Conseq. Type', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "ensembl_protein", text: 'Ensembl protein', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true} ,
            {dataIndex: "reference_mutation", text: 'Reference mutation', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true} ,
            {dataIndex: "xref", text: 'Xref', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true},
            {dataIndex: "description", text: 'Description', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true} ,
            {dataIndex: "omim", text: 'OMIM', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true},
            {dataIndex: "hgvs_cds", text: 'Hgvs cds', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true} ,
            {dataIndex: "hgvs_protein", text: 'Hgvs protein', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true} ,
            {dataIndex: "phenotype", text: 'Phenotype', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "source", text: 'Source', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "sift", text: 'SIFT', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "polyphen", text: 'PolyPhen', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "conservation", text: 'Conservation', flex: 1, emptyCellText: '.', renderer: renderer}
        ];

        newGrid.createModel('Variant', attributes);

        newGrid.createStore();
        newGrid.store.group('gene');

        newGrid.grid = Ext.create('Ext.grid.Panel', {
            title: gridName,
            width: '100%',
            flex: 3,
            store: newGrid.store,
            columns: columns,
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


        newGrid.grid.getSelectionModel().on('selectionchange', function (sm, selectedRecord) {

            if (selectedRecord.length) {

                var row = selectedRecord[0].data;

                var chr = row.chromosome;
                var pos = row.position;
                var ref = row.reference;
                var alt = row.alternate;

                _this._updateEffectGrid(chr, pos, ref, alt);

            }
        });

        return newGrid;
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
                            chromosome: fields[0].replace("chrom", "").replace("chr", "").replace("chr", ""),
                            position: parseInt(fields[1]),
                            start: parseInt(fields[1]),
                            end: parseInt(fields[1]),
                            id_snp: fields[2],
                            reference: fields[3],
                            alternate: fields[4],
                            quality: fields[5],
                            filter: fields[6],
                            info: fields[7],
                            format: fields[8],
                            sample: samples
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

        var data = [];
        _this.progress.updateProgress(0.2, 'Retrieving Genes');
        var genes = panel.getGenes();
        _this.progress.updateProgress(.3, 'Retrieving Disease Info');

        for (var i = 0; i < variants.length;) {
            data = [];
            for (var j = 0; i < variants.length && j < 100; j++, i++) {
                data.push(variants[i]);
            }
            _this._checkVariantBatch(data, panel, _this.dataPrim);
            _this._checkVariantGeneBatch(data, genes, panel, _this.dataExtra);
        }
        _this.progress.updateProgress(1, 'Finish');


    },
    _checkVariantBatch: function (variants, panel, grid) {
        var _this = this;

        var variantsReg = [];
        var diseases = panel.getDiseases();
        for (var i = 0; i < variants.length; i++) {
            variantsReg.push(variants[i].chromosome + ":" + variants[i].start + "-" + variants[i].end);
        }
        for (var i = 0; i < diseases.length; i++) {

            var dis = diseases[i].name;
            dis = dis.replace(/ /g, "%20");
            var url = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/genomic/region/" + variantsReg.join(",") + "/snp?phenotype=" + dis;

            $.ajax({
                url: url,
                dataType: 'json',
                async: false,
                success: function (response, textStatus, jqXHR) {

                    for (var j = 0; j < response.response.length; j++) {

                        var elem = response.response[j];
                        if (elem.numResults > 0) {

                            for (var k = 0; k < elem.numResults; k++) {
                                var aux = elem.result[k];

                                var copy = {};
                                _.extend(copy, variants[j]);

                                copy.gene = aux.associatedGenes;
                                copy.phenotype = aux.phenotype;
                                copy.source = _this._parsePhenotypeSource(aux.phenotype, aux.source);

                                _this._getEffect(copy);
                                _this._getPolyphenSift(copy);
                                _this._getConservation(copy);

                                var sift = (copy.sift == undefined || copy.sift == null);
                                var polyphen = (copy.polyphen == undefined || copy.polyphen == null);

                                if (!sift) {
                                    sift = (panel.sift == undefined || panel.sift == null);
                                }
                                if (!polyphen) {
                                    polyphen = (panel.polyphen == undefined || panel.polyphen == null);
                                }
                                if (!sift) {
                                    sift = (copy.sift <= panel.sift);
                                }
                                if (!polyphen) {
                                    polyphen = (copy.polyphen >= panel.polyphen);
                                }
                                if (sift && polyphen) {
                                    _this.dataExtra.push(copy);
                                }
                                grid.push(copy);
                            }
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error loading variants/diseases');
                }
            });
        }
        // User-defined Mutations
        for (var i = 0; i < diseases.length; i++) {
            var dis = diseases[i];

            for (var j = 0; dis.mutations !== undefined && j < dis.mutations.length; j++) {
                var m = dis.mutations[j];
                for (var k = 0; k < variants.length; k++) {
                    var v = variants[k];
                    if (v.chromosome == m.chr && v.start == m.pos && v.reference == m.ref && v.alternate == m.alt) {
                        v.phenotype = dis.name;
                        v.source = "user-defined";
                        grid.push(v);
                    }
                }
            }
        }
    },
    _generateURL: function (path, text) {

        return "<a href=\"" + path + "\" target=\"_blank\">" + text + "<\a>";
    },
    _parsePhenotypeSource: function (phenotype, source) {
        var _this = this;

        var res = "";
        switch (source) {
            case 'OMIM':
                res = _this._generateURL("http://omim.org/search?index=entry&start=1&limit=10&search=" + phenotype + "&sort=score+desc%2C+prefix_sort+desc", source);
                break;
            case 'dbSNP_ClinVar':
                res = _this._generateURL("https://www.ncbi.nlm.nih.gov/clinvar/?term=" + phenotype, source);
                break;
            case 'Uniprot':
                res = _this._generateURL("http://www.uniprot.org/uniprot/?query=" + phenotype + "&sort=score", source);
                break;
            case 'dbGap':
                res = _this._generateURL("http://www.ncbi.nlm.nih.gov/gap/?term=" + phenotype, source);
            default:
                res = source;
        }
        return res;
    },
    _checkVariantGeneBatch: function (variants, genes, panel, grid) {
        var _this = this;

        for (var i = 0; i < variants.length; i++) {

            var variant = variants[i];
            var panelVariant;

            if (genes.length > 0 && (panelVariant = _this._checkGeneVariant(variant, genes)) != null) {
                variant.gene = panelVariant.name;
                _this._getEffect(variant);
                _this._getPolyphenSift(variant);
                _this._getConservation(variant);

                var sift = (variant.sift == undefined || variant.sift == null);
                var polyphen = (variant.polyphen == undefined || variant.polyphen == null);

                if (!sift) {
                    sift = (panel.sift == undefined || panel.sift == null);
                }
                if (!polyphen) {
                    polyphen = (panel.polyphen == undefined || panel.polyphen == null);
                }
                if (!sift) {
                    sift = (variant.sift <= panel.sift);
                }
                if (!polyphen) {
                    polyphen = (variant.polyphen >= panel.polyphen);
                }
                if (sift && polyphen) {
                    _this.dataExtra.push(variant);
                }
            }
        }
    },
    _getEffect: function (variant) {
        var _this = this;
        var req = variant.chromosome + ":" + variant.start + ":" + variant.reference + ":" + variant.alternate;
        var ct = [];

        $.ajax({
            url: "http://ws.bioinfo.cipf.es/cellbase/rest/latest/hsa/genomic/variant/" + req + "/consequence_type?of=json",
            dataType: 'json',
            async: false,
            success: function (response, textStatus, jqXHR) {
                for (var j = 0; j < response.length; j++) {
                    var elem = response[j];
                    if (elem.aaPosition != -1 && elem.transcriptId != "" && elem.aminoacidChange.length >= 3 && variant.transcriptId == undefined && variant.aaPos == undefined && variant.aaChange == undefined) {
                        variant.transcript = elem.transcriptId;
                        variant.aaPos = elem.aaPosition;
                        variant.aaChange = elem.aminoacidChange;
                    }
                    ct.push(elem.consequenceTypeObo);
                }

                ct = ct.filter(function (elem, pos, self) {
                    return self.indexOf(elem) == pos;
                });

                variant.ct = ct.join(",");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error loading Effect');
            }
        });

    },
    _getPolyphenSift: function (variant) {

        if (variant.aaPos != undefined && variant.aaPos >= 0) {
            var change = variant.aaChange.split("/")[1];
            var url = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/feature/transcript/" + variant.transcript + "/function_prediction?aaPosition=" + variant.aaPos + "&aaChange=" + change;

            $.ajax({
                url: url,
                dataType: 'json',
                async: false,
                success: function (response, textStatus, jqXHR) {
                    var res = response.response[0];
                    if (res.numResults > 0 && variant.aaPos in res.result[0].aaPositions && change in res.result[0].aaPositions[variant.aaPos]) {
                        res = res.result[0].aaPositions[variant.aaPos][change];
                        if (res != null) {
                            variant.polyphen = res.ps
                            variant.sift = res.ss;
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error loading PolyPhen/SIFT');
                }
            });
        }
    },
    _getConservation: function (variant) {

        var chr = variant.chromosome;
        var start = variant.start;
        var end = variant.end;
        var url = "http://ws-beta.bioinfo.cipf.es/cellbase-staging-aleman/rest/v3/hsapiens/genomic/region/" + chr + ":" + start + "-" + end + "/conserved_region";

        $.ajax({
            url: url,
            dataType: 'json',
            async: false,
            success: function (response, textStatus, jqXHR) {
                if (response.response && response.response.length > 0 && response.response[0].numResults > 0) {
                    var data = response.response[0].result;
                    for (var i = 0; i < data.length; i++) {
                        var elem = data[i];
                        if (elem.type == "phastCons" && elem.values.length > 0) {
                            variant.conservation = elem.values[0];
                        }
                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error loading PolyPhen/SIFT');
            }
        });
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
    showPanels: function () {
        var _this = this;
        _this.teamListWidget.show();
    },
    hidePanels: function () {
        var _this = this;
        _this.teamListWidget.hide();
    },
    _createEffectGrid: function () {

        this.stEffect = Ext.create("Ext.data.Store", {
            groupField: 'featureId',
            fields: [
                {name: "featureId", type: "String"},
                {name: "featureName", type: "String"},
                {name: "featureType", type: "String"},
                {name: "featureBiotype", type: "String"},
                {name: "featureChromosome", type: "String"},
                {name: "featureStart", type: "int"},
                {name: "featureEnd", type: "int"},
                {name: "featureStrand", type: "String"},
                {name: "snpId", type: "String"},
                {name: "ancestral", type: "String"},
                {name: "alternative", type: "String"},
                {name: "geneId", type: "String"},
                {name: "transcriptId", type: "String"},
                {name: "geneName", type: "String"},
                {name: "consequenceType", type: "String"},
                {name: "consequenceTypeObo", type: "String"},
                {name: "consequenceTypeDesc", type: "String"},
                {name: "consequenceTypeType", type: "String"},
                {name: "aaPosition", type: "int"},
                {name: "aminoacidChange", type: "String"},
                {name: "codonChange", type: "String"},
                {name: "polyphenScore", type: "float"},
                {name: "polyphenEffect", type: "float"},
                {name: "siftScore", type: "float"},
                {name: "siftEffect", type: "float"},


            ],
            data: [],
            autoLoad: false,
            proxy: {type: 'memory'},
            pageSize: 5
        });

        var gridEffect = Ext.create('Ext.grid.Panel', {
            title: 'Variant Effect',
            width: '100%',
            flex: 2,
            store: this.stEffect,
            loadMask: true,
            border: 1,
            titleCollapse: true,
            collapsible: true,
            margin: '0 5 5 5',
            columns: [
                {xtype: 'rownumberer'},
                {
                    text: "Position chr:start:end (strand)",
                    dataIndex: "featureChromosome",
                    xtype: "templatecolumn",
                    tpl: '{featureChromosome}:{featureStart}-{featureEnd} <tpl if="featureStrand == 1">(+)<tpl elseif="featureStrand == -1">(-)</tpl>',
                    flex: 1
                },
                {
                    text: "SNP Id",
                    dataIndex: "snpId",
                    flex: 1
                },
                {
                    text: "Conseq. Type",
                    dataIndex: "consequenceTypeObo",
                    xtype: "templatecolumn",
                    tpl: '{consequenceTypeObo} (<a href="http://www.sequenceontology.org/browser/current_svn/term/{consequenceType}" target="_blank">{consequenceType}</a>)',
                    flex: 1
                },
                {
                    text: "Aminoacid Change",
                    xtype: "templatecolumn",
                    tpl: '<tpl if="aminoacidChange">{aminoacidChange} - {codonChange} ({aaPosition}) <tpl else>.</tpl>  ',
                    flex: 1
                },
                {
                    text: "Gene (EnsemblId)",
                    dataIndex: "geneName",
                    xtype: 'templatecolumn',
                    tpl: '<tpl if="geneName">{geneName} (<a href="http://www.ensembl.org/Homo_sapiens/Location/View?g={geneId}" target="_blank">{geneId}</a>)<tpl else>.</tpl>',
                    flex: 1
                },
                {
                    text: "Transcript Id",
                    dataIndex: "transcriptId",
                    xtype: 'templatecolumn',
                    tpl: '<a href="http://www.ensembl.org/Homo_sapiens/Location/View?t={transcriptId}" target="_blank">{transcriptId}</a>',
                    flex: 1
                },
                {
                    text: "Feature Id",
                    dataIndex: "featureId",
                    flex: 1

                },
                {
                    text: "Feature Name",
                    dataIndex: "featureName",
                    flex: 1

                },
                {
                    text: "Feature Type",
                    dataIndex: "featureType",
                    flex: 1

                },
                {
                    text: "Feature Biotype",
                    dataIndex: "featureBiotype",
                    flex: 1

                },
                {
                    text: "Ancestral",
                    dataIndex: "ancestral",
                    hidden: true,
                    flex: 1
                },
                {
                    text: "Alternative",
                    dataIndex: "alternative",
                    hidden: true,
                    flex: 1
                }
            ],
            viewConfig: {
                emptyText: 'No records to display'
            },
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items: [
                        {
                            xtype: 'tbtext',
                            id: this.id + "numRowsLabelEffect"
                        }
                    ]
                }
            ]
        });
        return gridEffect
    },
    _updateEffectGrid: function (chr, pos, ref, alt) {

        var _this = this;
        var req = chr + ":" + pos + ":" + ref + ":" + alt;
        _this.gridEffect.setLoading(true);

        $.ajax({
            url: "http://ws-beta.bioinfo.cipf.es/cellbase-staging/rest/latest/hsa/genomic/variant/" + req + "/consequence_type?of=json",
            dataType: 'json',
            success: function (response, textStatus, jqXHR) {
                if (response.length > 0) {

                    var data = _this._filterEffectData(response);

                    _this.gridEffect.getStore().loadData(data);
                    _this.gridEffect.setTitle('Variant Effect - <spap class="info">' + chr + ':' + pos + ' ' + ref + '>' + alt + '</spap>');
                    Ext.getCmp(_this.id + "numRowsLabelEffect").setText(data.length + " effects");

                } else {
                    _this.gridEffect.getStore().removeAll();
                }
                _this.gridEffect.setLoading(false);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error loading Effect');
                _this.gridEffect.setLoading(false);
            }
        });
    },
    _filterEffectData: function (data) {
        var _this = this;
        var res = [];

        var regulatory = {};

        for (var i = 0; i < data.length; i++) {
            var elem = data[i];
            if (elem.consequenceTypeObo == "coding_sequence_variant" || elem.consequenceTypeObo == "exon_variant" || elem.consequenceTypeObo == "intron_variant") {
                continue;
            } else if (elem.consequenceTypeObo == "regulatory_region_variant") {
                if (!(elem.featureId in regulatory)) {
                    regulatory[elem.featureId] = elem;
                }
                continue;
            }

            res.push(elem);
        }

        for (var elem in regulatory) {
            res.push(regulatory[elem]);
        }

        return res;
    }
};
