function TeamSettingsView(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("TeamSettingsView");

    this.diseases = [];
    this.edit = true;
    this.userSettings;
    this.userPanel;
    this.action = "new";
    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }
}

TeamSettingsView.prototype = {
    showImport: function () {
        this.importView.show();
    },
    showSavePanel: function () {

        var _this = this;

        this.saveView.show();
    },
    newPanel: function () {
        this.userPanel = new Panel();

        if (this.diseases.length == 0) {
            this.diseases = this._getDiseases();
            this.allDiseases.loadData(this.diseases);
        }

        Ext.getCmp(this.id + "btnAddPanel").setVisible(true);
        Ext.getCmp(this.id + "btnClearPanel").setVisible(true);
        Ext.getCmp(this.id + "_panelname").enable();
        Ext.getCmp(this.id + "btnAddPanel").setText("Add new panel");
        this.action = "new";


        Ext.getStore("MutationStore").removeAll();

        this.panel.show();

    },
    show: function (edit) {

        if (this.diseases.length == 0) {
            this.diseases = this._getDiseases();
            this.allDiseases.loadData(this.diseases);
        }

        this.edit = (edit == null) ? true : edit;
        if (this.edit) {
            Ext.getCmp(this.id + "btnAddPanel").setVisible(true);
            Ext.getCmp(this.id + "btnClearPanel").setVisible(true);
            Ext.getCmp(this.id + "_panelname").enable();
            Ext.getCmp(this.id + "btnAddPanel").setText("Save");
            this.action = "edit";
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
        this.diseaseModel = Ext.define('DiseaseModel', {
            extend: 'Ext.data.Model',
            idProperty: 'name',
            fields: ['name']
        });

        this.geneModel = Ext.define('GeneModel', {
            extend: 'Ext.data.Model',
            idProperty: 'name',
            fields: ['name']
        });


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
        this.saveView = this._createSavePanel();
    },
    clearSettings: function () {

        var _this = this;

        _this.allDiseases.addAll(_this.primDiseases.getData());

        _this.panelName.reset();
        _this.polyphen.reset();
        _this.sift.reset();
        _this.allDiseases.refresh();
        _this.primDiseases.clear();
        _this.diseaseGenes.clear();

        Ext.getStore("MutationStore").removeAll();
        delete _this.userPanel;
        _this.userPanel = new Panel();

    },
    edit_panel: function (panelType, panelId) {
        var _this = this;

        _this.clearSettings();

        _this.userPanel = _this.userSettings.get(panelType, panelId);

        if (_this.userPanel != null) {

            var edit = panelType == "user";

            var primD = [];
            var genes = [];

            Ext.each(_this.userPanel.getDiseases(), function (dis, index) {
                primD.push({name: dis.name});
            });

            Ext.each(_this.userPanel.getGenes(), function (gene, index) {
                genes.push({name: gene.name});
            });

            _this.panelName.setValue(_this.userPanel.name);
            _this.polyphen.setValue(_this.userPanel.polyphen);
            _this.sift.setValue(_this.userPanel.sift);

            _this.primDiseases.loadData(primD);
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
                                var fds_file = new FileDataSource({
                                    file: file
                                });

                                fds_file.on("success", function (data) {

                                    _this.userSettings.importData(data);

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
            )
            ;

        return window;
    },
    _createSavePanel: function () {

        var _this = this;

        var filename = Ext.create('Ext.form.field.Text', {
            id: _this.id + "_save_settings_file",
            fieldLabel: "Filename",
            width: 400,
            emptyText: 'Select a Filename',
            allowBlank: false,
            name: 'filename'
        });

        var window = Ext.create('Ext.window.Window', {
                title: 'Save Panels',
                height: 100,
                modal: true,
                minimizable: true,
                closable: false,
                bodyPadding: 10,
                items: [filename],
                listeners: {
                    minimize: function (win, obj) {
                        win.hide();
                    }
                },
                buttons: [
                    {
                        text: 'Save',
                        href: 'none',
                        handler: function (win) {
                            var content = _this.userSettings.toJson();

                            var filename = Ext.getCmp(_this.id + "_save_settings_file").getValue();
                            if (filename == "") {
                                filename = "Panel Settings";
                            }

                            this.getEl().set({
                                href: 'data:text/json,' + encodeURIComponent(content),
                                download: filename + ".json"
                            });

                            Ext.getCmp(_this.id + "_save_settings_file").reset();
                            this.up('.window').hide();
                            filename.reset();

                        }
                    },
                    {
                        text: 'Close',
                        handler: function () {
                            Ext.getCmp(_this.id + "_settings_file").reset();
                            this.up('.window').hide();
                            filename.reset();
                        }
                    }
                ]
            }
        );

        return window;
    },

    _createPanel: function () {
        var _this = this;
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
                margin: "0 0 20 0",
                allowBlank: false
            });

        this.panelGenes = Ext.create('Ext.form.TextArea',
            {
                id: _this.id + '_genes',
                name: 'genes',
                emptyText: "BRCA2,PPL",
                allowBlank: true
            });
        this.polyphen = Ext.create('Ext.form.NumberField',
            {
                id: _this.id + '_polyphen',
                name: 'polyphen',
                fieldLabel: 'PolyPhen',
                height: 20,
                maxWidth: 300,
                step: 0.01,
                maxValue: 1,
                minValue: 0
            });
        this.sift = Ext.create('Ext.form.NumberField',
            {
                id: _this.id + '_sift',
                name: 'Sift',
                fieldLabel: 'Sift',
                height: 20,
                maxWidth: 300,
                step: 0.01,
                maxValue: 1,
                minValue: 0
            });

        this.genesButton = Ext.create('Ext.Button', {
            text: 'Add Genes',
            scale: 'small',
            margin: '0 0 10 0',
            handler: function () {
                var genesPanel = Ext.getCmp(_this.id + '_genes');
                var genes = genesPanel.getValue().split(",");
                var wrongGenes = _this._checkWrongGenes(genes);

                if (wrongGenes.length > 0 || genes == "") {
                    Ext.MessageBox.show({
                        title: 'Form Error',
                        msg: "Wrong Gene Name(s): " + wrongGenes.join(","),
                        icon: Ext.MessageBox.WARNING,
                        buttons: Ext.Msg.OK
                    });
                } else {
                    _this.diseaseGenes.store.suspendEvents();

                    for (var i = 0; i < genes.length; i++) {
                        var gene = {
                            name: genes[i]
                        };

                        _this.diseaseGenes.add(gene);
                        _this.userPanel.addExtraGene(gene);
                    }
                    genesPanel.reset();
                    _this.diseaseGenes.store.resumeEvents();
                    _this.diseaseGenes.store.fireEvent('refresh');
                }
            }
        });

        var searchField = Ext.create('Ext.form.field.Text', {
            id: this.id + "searchField",
            emptyText: 'enter search term',
            enableKeyEvents: true,
            margin: '0 15 10 0',
            listeners: {
                change: {
                    buffer: 200,
                    fn: function () {
                        var str = Ext.getCmp(_this.id + "searchField").getValue();
                        var st = Ext.getStore("allDiseases")
                        st.clearFilter();
                        st.filter(
                            {
                                id: 'name',
                                property: 'name',
                                value: str,
                                anyMatch: true
                            }
                        );
                    }
                }
            }
        });

        _this.allDiseases = _this._createAllDiseases(filters, _this.diseases);
        _this.diseaseGenes = _this._createGenesGrid("Genes");
        _this.primDiseases = _this._createDiseaseSetGrid("Primary Disease", _this.allDiseases, _this.diseaseGenes, filters, true);
        _this.mutationsGrid = _this._createMutationsGrid();

        _this.showGenesPanel = _this._createShowGenesPanel();
        _this.mutationPanel = _this._createNewMutationPanel();

        var mutationButton = Ext.create('Ext.Button', {
            text: 'Add Mutation',
            scale: 'small',
            margin: '0 15 10 0',
            handler: function () {

                Ext.getCmp(_this.id + "_chr_mutationPanel").reset();
                Ext.getCmp(_this.id + "_pos_mutationPanel").reset();
                Ext.getCmp(_this.id + "_ref_mutationPanel").reset();
                Ext.getCmp(_this.id + "_alt_mutationPanel").reset();
                Ext.getCmp(_this.id + "_disName_mutationPanel").reset();


                _this.mutationPanel.show();
            }
        });

        _this.genesWindow = Ext.create('Ext.window.Window', {
            height: 300,
            width: 260,
            modal: true,
            minimizable: true,
            closable: false,
            bodyPadding: 10,
            listeners: {
                minimize: function (win, obj) {
                    win.hide();
                }
            },
            items: [
                _this.showGenesPanel.getPanel()
            ]
        });

        var window = Ext.create('Ext.window.Window', {
                title: 'Panel Manager',
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
                            {

                                xtype: 'container',
                                flex: 1,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items: [
                                    this.allDiseases.getPanel(),
                                    searchField
                                ]
                            },
                            {
                                xtype: 'container',
                                flex: 1,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items: [
                                    this.primDiseases.getPanel(),
                                    this.mutationsGrid.getPanel(),
                                    mutationButton

                                ]
                            },
                            {
                                xtype: 'container',
                                width: 150,
                                layout: {
                                    type: 'vbox',
                                    align: 'stretch'
                                },
                                items: [
                                    this.diseaseGenes.getPanel(),
                                    this.panelGenes,
                                    this.genesButton
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
                        text: 'Add new panel',
                        handler: function () {
                            window.setLoading(true);
                            if (_this.action == "new") {
                                var name = Ext.getCmp(_this.id + "_panelname").getValue();

                                if (name == "") {
                                    Ext.MessageBox.alert("Error", "Name is mandatory");
                                }
                                else {
                                    var polyphen = Ext.getCmp(_this.id + "_polyphen").getValue();
                                    var sift = Ext.getCmp(_this.id + "_sift").getValue();

                                    _this.userPanel.polyphen = polyphen;
                                    _this.userPanel.sift = sift;
                                    _this.userPanel.name = name;

                                    _this.userSettings.addPanel(_this.userPanel);
                                    _this.userSettings.save();
                                    _this.clearSettings();
                                    _this.hide();
                                }
                            } else if (_this.action == "edit") {


                                var name = Ext.getCmp(_this.id + "_panelname").getValue();

                                if (name == "") {
                                    Ext.MessageBox.alert("Error", "Name is mandatory");
                                }
                                else {
//                                    _this.userSettings.removePanel(_this.userPanel.name);
                                    _this.userSettings.remove(_this.userPanel);
                                    _this.userSettings.save();

                                    var polyphen = Ext.getCmp(_this.id + "_polyphen").getValue();
                                    var sift = Ext.getCmp(_this.id + "_sift").getValue();

                                    _this.userPanel.polyphen = polyphen;
                                    _this.userPanel.sift = sift;
                                    _this.userPanel.name = name;

                                    _this.userSettings.addPanel(_this.userPanel);
                                    _this.userSettings.save();
                                    _this.clearSettings();
                                    _this.hide();
                                }
                            }
                            window.setLoading(false);
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
                    },
                    {
                        text: 'Close',
                        id: _this.id + "btnClosePanel",
                        handler: function () {
                            _this.clearSettings();
                            _this.hide();
                        }
                    }
                ]
            }
        );
        return window;
    },
    _createNewMutationPanel: function () {

        var _this = this;

        _this.chrField = Ext.create('Ext.form.TextField', {
            id: _this.id + "_chr_mutationPanel",
            name: 'chr',
            fieldLabel: 'Chr',
            maxWidth: 30,
            labelAlign: 'top',
            allowBlank: false,
            margin: "0 10 0 0",
            listeners: {
                change: function () {
                }
            }
        });

        _this.posField = Ext.create('Ext.form.NumberField', {
            id: _this.id + "_pos_mutationPanel",
            name: 'pos',
            fieldLabel: 'Pos',
            labelAlign: 'top',
            maxWidth: 120,
            setp: 1,
            minValue: 0,
            allowBlank: false,
            margin: "0 10 0 0",
            listeners: {
                change: function () {
                }
            }

        });

        _this.refField = Ext.create('Ext.form.TextField', {
            id: _this.id + "_ref_mutationPanel",
            name: 'ref',
            fieldLabel: 'Ref',
            labelAlign: 'top',
            allowBlank: false,
            maxWidth: 80,
            margin: "0 10 0 0"
        });
        var alt = Ext.create('Ext.form.TextField', {
            id: _this.id + "_alt_mutationPanel",
            name: 'alt',
            fieldLabel: 'Alt',
            labelAlign: 'top',
            allowBlank: false,
            maxWidth: 80,
            margin: "0 10 0 0"
        });

        var diseaseName = Ext.create('Ext.form.TextField', {
            id: _this.id + "_disName_mutationPanel",
            name: 'disname',
            fieldLabel: 'Disease Name',
            labelAlign: 'top',
            allowBlank: false,
            maxWidth: 400
//            margin: "0 10 0 0"
        });

        var checkButton = Ext.create('Ext.Button', {
            text: 'Check',
            scale: 'small',
            height: 22,
            handler: function () {
                var chr = _this.chrField.getValue();
                var pos = _this.posField.getValue();

                if (chr != "" && pos != "") {
                    var region = new Region({
                        chromosome: chr,
                        start: pos,
                        end: pos
                    });
                    _this.gv.setRegion(region);
                } else {
                    Ext.MessageBox.show({
                        title: 'Form Error',
                        msg: "Please enter 'Chr' and 'Pos'",
                        icon: Ext.MessageBox.WARNING,
                        buttons: Ext.Msg.OK
                    });
                }

            }
        });


        this.gvPanel = this._createGenomeViewer();

        var form = Ext.create('Ext.form.Panel', {
            bodyStyle: 'background:none',
            bodyPadding: 4,
            layout: {
                type: 'hbox'
            },
            items: [_this.chrField, _this.posField, _this.refField, alt, diseaseName ],
            buttons: [
                {
                    text: 'Reset',
                    handler: function () {
                        this.up('form').getForm().reset();
                    }
                },
                checkButton,
                {
                    text: 'Add Mutation',
                    formBind: true, //only enabled once the form is valid
                    disabled: true,
                    handler: function () {
                        var form = this.up('form').getForm();
                        if (form.isValid()) {

                            chr = Ext.getCmp(_this.id + "_chr_mutationPanel").getValue();
                            pos = Ext.getCmp(_this.id + "_pos_mutationPanel").getValue();
                            ref = Ext.getCmp(_this.id + "_ref_mutationPanel").getValue();
                            alt = Ext.getCmp(_this.id + "_alt_mutationPanel").getValue();
                            disName = Ext.getCmp(_this.id + "_disName_mutationPanel").getValue();

                            _this.userPanel.addMutationToDisease(disName, chr, pos, ref, alt);
                            console.log(_this.userPanel.diseases);
                            window.hide();

                            if (_this.primDiseases.grid.getSelectionModel().getCurrentPosition()) {
                                var currentRow = _this.primDiseases.grid.getSelectionModel().getCurrentPosition().row;
                                _this.primDiseases.grid.getSelectionModel().deselectAll();
                                _this.primDiseases.grid.getSelectionModel().select(currentRow);
                            }
                        }
                    }
                }
            ]
        });

        var window = Ext.create('Ext.window.Window', {
            title: "Add mutation",
            height: 630,
            width: 800,
            minimizable: true,
            closable: false,
            bodyPadding: 10,
            modal: true,
            listeners: {
                minimize: function (win, obj) {
                    win.hide();
                }
            },
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                form,
                this.gvPanel
            ]
        });

        return window;
    },

    _createGenomeViewer: function () {
        var _this = this;

        var gvpanel = Ext.create('Ext.panel.Panel', {
            border: 1,
            margin: "30 0 0 0",
            html: '<div id="' + this.id + 'genomeViewer" style="width:750px;height:600;position:relative;"></div>',
            listeners: {
                afterrender: {
                    fn: function () {
                        var w = this.getWidth();
                        $('#' + _this.id + 'genomeViewer').width(w);

                        var region = new Region({
                            chromosome: "13",
                            start: 32889611,
                            end: 32889611
                        });


                        var genomeViewer = new GenomeViewer({
                            sidePanel: false,
                            targetId: _this.id + 'genomeViewer',
                            autoRender: true,
                            border: false,
                            resizable: true,
                            region: region,
                            trackListTitle: '',
                            drawNavigationBar: true,
                            drawKaryotypePanel: false,
                            drawChromosomePanel: false,
                            drawRegionOverviewPanel: false
                        }); //the div must exist

                        genomeViewer.draw();

                        _this.sequence = new SequenceTrack({
                            targetId: null,
                            id: 1,
                            title: 'Sequence',
                            histogramZoom: 20,
                            transcriptZoom: 50,
                            height: 30,
                            visibleRegionSize: 200,
                            renderer: new SequenceRenderer(),

                            dataAdapter: new SequenceAdapter({
                                category: "genomic",
                                subCategory: "region",
                                resource: "sequence",
                                species: genomeViewer.species

                            })

                        });
                        this.gene = new GeneTrack({
                            targetId: null,
                            id: 2,
                            title: 'Gene',
                            height: 140,
                            minHistogramRegionSize: 20000000,
                            maxLabelRegionSize: 10000000,
                            minTranscriptRegionSize: 200000,

                            renderer: new GeneRenderer(),

                            dataAdapter: new CellBaseAdapter({
                                category: "genomic",
                                subCategory: "region",
                                resource: "gene",
                                species: genomeViewer.species,
                                params: {
                                    exclude: 'transcripts.tfbs,transcripts.xrefs,transcripts.exons.sequence'
                                },
                                cacheConfig: {
                                    chunkSize: 100000
                                },
                                filters: {},
                                options: {},
                                featureConfig: FEATURE_CONFIG.gene
                            })
                        });
                        this.snp = new FeatureTrack({
                            targetId: null,
                            id: 4,
                            title: 'SNP',

                            minHistogramRegionSize: 12000,
                            maxLabelRegionSize: 3000,
                            featureType: 'SNP',
                            height: 100,

                            renderer: new FeatureRenderer(FEATURE_TYPES.snp),

                            dataAdapter: new CellBaseAdapter({
                                category: "genomic",
                                subCategory: "region",
                                resource: "snp",
                                params: {
                                    exclude: 'transcriptVariations,xrefs,samples'
                                },
                                species: genomeViewer.species,
                                cacheConfig: {
                                    chunkSize: 10000
                                },
                                filters: {},
                                options: {}
                            })
                        });

                        genomeViewer.addTrack(_this.sequence);
                        genomeViewer.addTrack(this.gene);
                        genomeViewer.addTrack(this.snp);

                        var updateForm = function () {

                            var pos = _this.sequence.region.center();
                            var chr = _this.sequence.region.chromosome;
                            var ref = _this.sequence.dataAdapter.getNucleotidByPosition({start: pos, end: pos, chromosome: chr})

                            _this.chrField.setValue(chr);
                            _this.posField.setValue(pos);
                            _this.refField.setValue(ref);

                        };

                        genomeViewer.on("region:change", updateForm);
                        genomeViewer.on("region:move", updateForm);

                        _this.gv = genomeViewer;

                        $(_this.gv.navigationBar.restoreDefaultRegionButton).hide();
                        $(_this.gv.navigationBar.regionHistoryButton).hide();
                        $(_this.gv.navigationBar.speciesButton).hide();
                        $(_this.gv.navigationBar.chromosomesButton).hide();
                        $(_this.gv.navigationBar.karyotypeButton).hide();
                        $(_this.gv.navigationBar.chromosomeButton).hide();
                        $(_this.gv.navigationBar.regionButton).hide();
                        $(_this.gv.navigationBar.windowSizeField).parent().hide();
                        $(_this.gv.navigationBar.regionField).parent().hide();
                        $(_this.gv.navigationBar.goButton).parent().hide();
                        //$(_this.gv.navigationBar.searchField).parent().hide();
                        //$(_this.gv.navigationBar.quickSearchButton).parent().hide();
                        $(_this.gv.navigationBar.autoheightButton).parent().hide();
                        $(_this.gv.navigationBar.compactButton).parent().hide();

                    }
                }
            },
            autoRender: true
        });

        return gvpanel;
    },
    _createShowGenesPanel: function () {
        var _this = this;

        var newGrid = new Grid();

        newGrid.model = _this.geneModel;
        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            storeId: "showGenesStore",
            remoteSort: false,
            sorters: [
                {property: 'name', direction: 'ASC'}
            ],
            autoLoad: false
        });

        newGrid.grid = Ext.create('Ext.grid.Panel', {
                store: newGrid.store,
                height: 240,
                columns: [
                    {
                        text: "Name",
                        flex: 1,
                        dataIndex: 'name'
                    }
                ],
                plugins: 'bufferedrenderer',
                title: 'Genes',
                margins: '0 0 10 0'
            }
        );

        return newGrid;

    },
    _createGridColumns: function () {
        var columns = [
            {
                text: "Name",
                flex: 1,
                sortable: true,
                groupable: true,
                dataIndex: 'name',
                filter: {type: 'string'},
                summaryType: 'count',
                editor: {
                    allowBlank: false
                }
            }
        ];
        return columns;
    },
    _createGridColumnsGenes: function () {
        var _this = this;
        var columns = [
            {
                text: "Name",
                flex: 1,
                sortable: true,
                groupable: true,
                dataIndex: 'name',
                filter: {type: 'string'},
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
                        icon: Utils.images.del,
                        tooltip: 'Delete',
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            alert("Delete " + rec.get('name'));

                            _this.userPanel.removeGene(rec.get("name"));

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
            storeId: 'allDiseases',
            data: data,
            remoteSort: false,
            sorters: [
                {property: 'name', direction: 'ASC'}
            ],
            proxy: {type: 'memory'},
            groupField: 'name'
        });


        var showGenesAction = Ext.create('Ext.Action', {
            text: 'Show Genes',
            handler: function (widget, evet) {
                var record = allDiseases.grid.getSelectionModel().getSelection()[0];
                var disName = record.get("name");

                _this.showGenesPanel.clear();

                var url = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/feature/snp/phenotypes?phenotype=" + disName + "";
                url = url.replace(/ /g, "%20");

                $.ajax({
                    url: url,
                    dataType: 'json',
                    async: false,
                    success: function (response, textStatus, jqXHR) {

                        var genes = [];

                        for (var i = 0; i < response.response.numResults; i++) {
                            var dis = response.response.result[i];

                            for (var j = 0; j < dis.associatedGenes.length; j++) {
                                genes.push({name: dis.associatedGenes[j]
                                });
                            }
                        }

                        _this.genesWindow.setTitle(disName);
                        _this.showGenesPanel.add(genes);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('Error loading Genes');
                    }
                });
                _this.genesWindow.show();
            }
        });
        var showMutationsAction = Ext.create('Ext.Action', {
            text: 'Show Mutations',
            handler: function (widget, evet) {
                var record = allDiseases.grid.getSelectionModel().getSelection()[0];
                alert(record.get("name"));
            }
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

                        if (_this.userPanel !== undefined) {
                            this.getStore().sort('name', 'ASC');

                            var geneStore = Ext.getStore("DiseaseGeneStore");

                            var diseases = data.records;

                            for (var i = 0; i < diseases.length; i++) {

                                var disName = diseases[i].data.name;

                                var d = _this.userPanel.getDisease(disName);
                                if (d != null) {
                                    var g = d.getGenes();

                                    for (var j = 0; j < g.length; j++) { // TODO aaleman: Check this code
                                        var gene = g[j];
                                        var query = Ext.getStore("DiseaseGeneStore").queryBy(function (record, id) {
                                            return (record.get('name') == gene.name);
                                        });

                                        geneStore.remove(query.items);
                                    }

                                }
                                _this.userPanel.removeDisease(disName);


                            }

                        }
                    },
                    itemcontextmenu: function (este, record, item, index, e) {
                        e.stopEvent();
                        var items = [];
                        console.log(record)
                        items.push(showGenesAction);
//                        items.push(showMutationsAction);
                        var contextMenu = Ext.create('Ext.menu.Menu', {
                            items: items
                        });
                        contextMenu.showAt(e.getXY());
                        return false;
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
                        }
                    }
                }
            ],
            features: [filters],
            store: allDiseases.store,
            columns: this.columns,
            stripeRows: true,
            title: "Diseases (Drag)",
            flex: 1,
            height: "80%",
            multiSelect: true,
            margin: '0 15 10 0',
            loadMask: true,
            plugins: 'bufferedrenderer'
        });

        return allDiseases;
    },
    _createMutationsGrid: function () {
        var _this = this;

        var newGrid = new Grid();

        newGrid.model = Ext.define('MutationModel', {
            extend: 'Ext.data.Model',
            fields: [
                { name: 'chr', type: 'string'},
                { name: 'pos', type: 'int'},
                { name: 'ref', type: 'string'},
                { name: 'alt', type: 'string'}
            ]
        });

        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            storeId: 'MutationStore',
            remoteSort: false
        });
        var columns = [
            {text: 'Chr', dataIndex: 'chr', flex: 1, sortable: false},
            {text: 'Pos', dataIndex: 'pos', flex: 1, sortable: false},
            {text: 'Ref', dataIndex: 'ref', flex: 1, sortable: false},
            {text: 'Alt', dataIndex: 'alt', flex: 1, sortable: false}
        ];

        newGrid.grid = Ext.create('Ext.grid.Panel', {
            title: 'Mutations',
            store: newGrid.store,
            columns: columns,
            margin: '0 15 10 0',
            flex: 1
        });
        return newGrid;
    },
    _createDiseaseSetGrid: function (title, mainGrid, geneGrid, filters, addGenes) {

        var _this = this;

        var newGrid = new Grid();

        newGrid.model = _this.diseaseModel;
        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            storeId: "PrimDiseaseStore",
            remoteSort: false,
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                }
            ]
        });

        newGrid.addGenes = addGenes;

        var showGenesAction = Ext.create('Ext.Action', {
            text: 'Show Genes',
            handler: function (widget, evet) {
                var record = _this.primDiseases.grid.getSelectionModel().getSelection()[0];
                var disName = record.get("name");

                _this.showGenesPanel.clear();

                var url = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/feature/snp/phenotypes?phenotype=" + disName + "";
                url = url.replace(/ /g, "%20");

                $.ajax({
                    url: url,
                    dataType: 'json',
                    async: false,
                    success: function (response, textStatus, jqXHR) {

                        var genes = [];

                        for (var i = 0; i < response.response.numResults; i++) {
                            var dis = response.response.result[i];

                            for (var j = 0; j < dis.associatedGenes.length; j++) {
                                genes.push({name: dis.associatedGenes[j]
                                });
                            }
                        }

                        _this.genesWindow.setTitle(disName);
                        _this.showGenesPanel.add(genes);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('Error loading Genes');
                    }
                });
                _this.genesWindow.show();
            }
        });
        var showMutationsAction = Ext.create('Ext.Action', {
            text: 'Show Mutations',
            handler: function (widget, evet) {
                var record = newGrid.grid.getSelectionModel().getSelection()[0];
                alert(record.get("name"));
            }
        });

        var addMutationAction = Ext.create('Ext.Action', {
            text: 'Add Mutation',
            handler: function (widget, evet) {
                var record = newGrid.grid.getSelectionModel().getSelection()[0];
                var disName = record.get("name");
                Ext.getCmp(_this.id + "_disName_mutationPanel").setValue(disName);

                Ext.getCmp(_this.id + "_chr_mutationPanel").reset();
                Ext.getCmp(_this.id + "_pos_mutationPanel").reset();
                Ext.getCmp(_this.id + "_ref_mutationPanel").reset();
                Ext.getCmp(_this.id + "_alt_mutationPanel").reset();


                _this.mutationPanel.show();
            }
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
                            _this.allDiseases.setLoading(true);
                            _this.primDiseases.setLoading(true);
                            _this.diseaseGenes.setLoading(true);

                            this.getStore().sort('name', 'ASC');

                            var diseases = data.records;

                            for (var i = 0; i < diseases.length && newGrid.addGenes; i++) {

                                var disName = diseases[i].data.name;
                                var disease = new Disease();

                                $.ajax({
                                    url: "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/feature/snp/phenotypes?phenotype=" + disName,
                                    dataType: 'json',
                                    async: false,
                                    success: function (response, textStatus, jqXHR) {


                                        var genes = [];
                                        for (var i = 0; i < response.response.numResults; i++) {
                                            var dis = response.response.result[i];

                                            for (var j = 0; j < dis.associatedGenes.length; j++) {
                                                genes.push({name: dis.associatedGenes[j]
                                                });
                                            }
                                        }
                                        disease.name = disName;
                                        disease.genes = genes;

                                        _this.userPanel.addDisease(disease, false);
                                        _this.diseaseGenes.add(genes);
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        console.log('Error loading Genes');
                                    }
                                });


                            }
                            _this.allDiseases.setLoading(false);
                            _this.primDiseases.setLoading(false);
                            _this.diseaseGenes.setLoading(false);


                            _this.diseaseGenes.grid.getStore().sort('name', 'ASC');
                        },
                        itemcontextmenu: function (este, record, item, index, e) {
                            e.stopEvent();
                            var items = [];
                            console.log(record)
                            items.push(showGenesAction);
                            items.push(addMutationAction);
                            //items.push(renameBucketAction);
                            var contextMenu = Ext.create('Ext.menu.Menu', {
                                items: items
                            });
                            contextMenu.showAt(e.getXY());
                            return false;
                        }
                    }
                },
                store: newGrid.store,
                columns: this.columns,
                stripeRows: true,
                title: title + " (Drop)",
                flex: 1,
                multiSelect: true,
                hideHeaders: true,
                tools: [
                    {
                        type: 'refresh',
                        tooltip: 'Clear',
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
            }
        );

        newGrid.grid.getSelectionModel().on('selectionchange', function (sm, selectedRecord) {
            if (selectedRecord.length) {
                var selectedRec = selectedRecord[0];
                var dis = _this.userPanel.getDisease(selectedRec.get("name"));
                if (dis !== null) {
                    Ext.getStore("MutationStore").removeAll();
                    Ext.getStore("MutationStore").loadData(dis.getMutations());

                }
            }
        });


        return newGrid;
    },
    _createGenesGrid: function (title) {

        var _this = this;

        var newGrid = new Grid();

        newGrid.model = _this.geneModel;
        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            storeId: 'DiseaseGeneStore',
            remoteSort: false,
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                }
            ]
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
                tools: [
                    {
                        type: 'refresh',
                        tooltip: 'Clear',
                        handler: function (event, toolEl, panel) {
                            if (_this.edit) {
                                _this.diseaseGenes.removeAll();
                            }
                        }
                    }
                ],
                dockedItems: [],
                plugins: [rowEditing],
                hideHeaders: true
            }
        );

        return newGrid;
    },
    _getDiseases: function () {

        var data = [];
        $.ajax({
            url: "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/feature/snp/phenotypes?exclude=associatedGenes",
            dataType: 'json',
            async: false,
            success: function (response, textStatus, jqXHR) {
                for (var i = 0; i < response.response.result.length; i++) {
                    var disease = response.response.result[i].phenotype;
                    data.push(
                        {
                            value: disease,
                            name: disease
                        });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error downloading Diseases');
            }
        });
        return data;
    },
    _checkWrongGenes: function (genes) {

        var wrongGenes = [];
        var url = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/feature/gene/" + genes.join(",") + "/info?include=chromosome,start,end";

        $.ajax({
            url: url,
            dataType: 'json',
            async: false,
            success: function (response, textStatus, jqXHR) {
                if (response.response !== undefined && response.response.length > 0) {

                    for (var i = 0; i < response.response.length; i++) {
                        var geneObj = response.response[i];
                        if (geneObj.numResults == 0) {
                            wrongGenes.push(genes[i]);
                        }

                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error loading Genes');
            }
        });
        return wrongGenes;
    }
}
;
