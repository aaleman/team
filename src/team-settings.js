function TeamSettingsView(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("TeamSettingsView");

    this.diseases = [];
    this.edit = true;
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
    },
    clearSettings: function () {

        var _this = this;

        _this.allDiseases.addAll(_this.primDiseases.getData());
        //_this.allDiseases.addAll(_this.secDiseases.getData());

        _this.panelName.reset();
        _this.polyphen.reset();
        _this.sift.reset();
        _this.allDiseases.refresh();
        _this.primDiseases.clear();
        //_this.secDiseases.clear();
        _this.diseaseGenes.clear();

    },
    load: function (panelType, panelId) {
        var _this = this;

        var query = Ext.getStore("DiseaseStore").queryBy(function (record, id) {
            return (record.get('panelType') == panelType && record.get('panelId') == panelId);
        });

        panel = query.getAt(0).raw;

        if (panel != null) {

            var edit = panelType == "user";

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
            //_this.secDiseases.loadData(secD);
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
                            var fds_file = new FileDataSource(file);

                            fds_file.on("success", function (data) {

                                var dataObj = JSON.parse(data);
                                var userDefinedPanels = [];
                                
                                if(localStorage.bioinfo_panels_user_settings){
                                    userDefinedPanels = JSON.parse(localStorage.bioinfo_panels_user_settings);
                                }

                                var storeAux = Ext.getStore("DiseaseStore");

                                var query = storeAux.query("panelType", "user");
                                var max = -1;

                                for (var i = 0; i < query.getCount(); i++) {
                                    var elem = query.getAt(i).raw;
                                    if (elem.panelId > max) {
                                        max = elem.panelId;
                                    }
                                }

                                for(var i = 0; i< dataObj.length; i++){
                                    var importPanel = dataObj[i];
                                    userDefinedPanels.push(importPanel);
                                    
                                    _this.parent.grid.add(importPanel);
                                    
                                    storeAux.add({
                                        panelType: 'user',
                                        panelId: max++,
                                        name: importPanel.name,
                                        primaryDiseases: importPanel.primaryDiseases,
                                        secondaryDiseases: importPanel.secondaryDiseases,
                                        genes: importPanel.genes,
                                        polyphen: importPanel.polyphen,
                                        sift: importPanel.sift
                                    });
                                    

                                }

                                //_this.parent.grid.loadData(userDefinedPanels);
                                localStorage.bioinfo_panels_user_settings = JSON.stringify(userDefinedPanels);
                                //console.log(userDefinedPanels);
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
                //fieldLabel: 'New Gene',
                emptyText: "BRCA2,PPL",
                //labelAlign:'top',
                //height: 20,
                //maxWidth: 300,
                //margin: "0 0 20 0",
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

                //margin: "0 0 20 0"
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
                //margin: "0 0 20 0"
            });

        this.genesButton = Ext.create('Ext.Button',{
            text: 'Add Genes',
            scale:'small',
            margin: '0 0 10 0',
            handler: function(){
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
                }else{
                        _this.diseaseGenes.store.suspendEvents();
                   
                    for(var i = 0 ; i < genes.length; i++){
                        var gene = {
                            name: genes[i]
                        };
                        _this.diseaseGenes.add(gene);
                    }
                    genesPanel.reset();
                        _this.diseaseGenes.store.resumeEvents();
                        _this.diseaseGenes.store.fireEvent('refresh');


                }


            
            }
        });

        var searchField = Ext.create('Ext.form.field.Text', {
            id: this.id + "searchField",
            //margin: "0 1 0 0",
            emptyText: 'enter search term',
            enableKeyEvents: true,
            margin: '0 15 10 0',
            //height: 20,

            listeners: {
                change: 
                    {
                    buffer:200,
                    fn:function () {

                        var str = Ext.getCmp(_this.id + "searchField").getValue();
                        var st = Ext.getStore("allDiseases")
                        st.clearFilter();
                        st.filter(
                            {
                            id: 'name',
                            property: 'name',
                            value: str,
                            anyMatch:true
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
        //_this.secDiseases = _this._createDiseaseSetGrid("Secondary Disease", _this.allDiseases, _this.diseaseGenes, filters, false);

        _this.showGenesPanel = _this._createShowGenesPanel();
        _this.mutationPanel = _this._createNewMutationPanel();
        //_this.showMutationsPanel = _this._createShowMutationsPanel();
        //console.log(_this.showGenesPanel);

        var mutationButton = Ext.create('Ext.Button',{
            text: 'Add Mutation',
            scale:'small',
            margin: '0 15 10 0',
            handler: function(){
                _this.mutationPanel.show();
            }
        });
        //_this.mutationPanel.show();

        _this.genesWindow = Ext.create('Ext.window.Window', {
                //title: 'Show Genes',
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
                                    //this.secDiseases.getPanel()

                                ]
                            }, {
                                xtype: 'container',
                                //flex: 1,
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
                        text: 'Add Panel',
                        handler: function () {
                            window.setLoading(true);
                            if (_this.edit) {
                                var name = Ext.getCmp(_this.id + "_panelname").getValue();
                                if (name == "") {
                                    Ext.MessageBox.alert("Error", "Name is mandatory");
                                }
                                else {
                                    var polyphen = Ext.getCmp(_this.id + "_polyphen").getValue();
                                    var sift = Ext.getCmp(_this.id + "_sift").getValue();
                                    var pd = [];
                                    var sd = [];
                                    var genes = [];

                                    for (var i = 0; i < _this.primDiseases.count(); i++) {
                                        pd.push({name: _this.primDiseases.getAt(i).get("name")});
                                    }

                                    //for (var i = 0; i < _this.secDiseases.count(); i++) {
                                        //sd.push({name: _this.secDiseases.getAt(i).get("name")});
                                    //}

                                    for (var i = 0; i < _this.diseaseGenes.count(); i++) {
                                        genes.push({name: _this.diseaseGenes.getAt(i).get("name")});
                                    }

                                    var panel = {
                                        name: name,
                                        primaryDiseases: pd,
                                        secondaryDiseases: sd,
                                        genes: genes,
                                        polyphen: polyphen,
                                        sift: sift
                                    };

                                    _this.parent.add(panel);
                                    _this.clearSettings();
                                    _this.hide();

                                    var storeAux = Ext.getStore("DiseaseStore");

                                    var query = storeAux.query("panelType", "user");
                                    var max = -1;

                                    for (var i = 0; i < query.getCount(); i++) {
                                        var elem = query.getAt(i).raw;
                                        if (elem.panelId > max) {
                                            max = elem.panelId;
                                        }
                                    }

                                    storeAux.add({
                                        panelType: 'user',
                                        panelId: max + 1,
                                        name: name,
                                        primaryDiseases: pd,
                                        secondaryDiseases: sd,
                                        genes: genes,
                                        polyphen: polyphen,
                                        sift: sift
                                    });

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
    _createNewMutationPanel: function(){
    
        var _this = this;


        _this.chrField = Ext.create('Ext.form.TextField',{
            id: _this.id + "_chr_mutationPanel",
            name: 'chr',
            fieldLabel: 'Chr',
            labelAlign:'top',
            allowBlank: false,
            margin: "0 10 0 0",
            listeners: {
                change: function () {

                //var chr = Ext.getCmp(_this.id + "_chr_mutationPanel").getValue();
                //var pos = Ext.getCmp(_this.id + "_pos_mutationPanel").getValue();

                //var region = new Region({
                    //chromosome: chr,
                    //start: pos,
                    //end:pos 
                //});
                //_this.gv.setRegion(region);
            }
            }
        });
        
        _this.posField = Ext.create('Ext.form.NumberField',{
            id: _this.id + "_pos_mutationPanel",
            name: 'pos',
            fieldLabel: 'Pos',
            labelAlign:'top',
            setp:1,
            minValue: 0,
            allowBlank: false,
            margin: "0 10 0 0",
            listeners: {
                change: function () {

                //var chr = _this.chrField.getValue();
                //var pos = _this.posField.getValue();

                //var region = new Region({
                    //chromosome: chr,
                    //start: pos,
                    //end:pos 
                //});
                //_this.gv.setRegion(region);
            }
            }

        });

        var ref = Ext.create('Ext.form.TextField',{
            id: _this.id + "_ref_mutationPanel",
            name: 'ref',
            fieldLabel: 'Ref',
            labelAlign:'top',
            allowBlank: false,
            margin: "0 10 0 0",
        });
        var alt = Ext.create('Ext.form.TextField',{
            id: _this.id + "_alt_mutationPanel",
            name: 'alt',
            fieldLabel: 'Alt',
            labelAlign:'top',
            allowBlank: false,
            margin: "0 10 0 0",
        });

        var checkButton = Ext.create('Ext.Button',{
            text: 'Check',
            //scale:'small',
            margin: "0 10 0 0",
            height: 22,
            handler: function(){

                var chr = _this.chrField.getValue();
                var pos = _this.posField.getValue();

                var region = new Region({
                    chromosome: chr,
                    start: pos,
                    end:pos 
                });
                _this.gv.setRegion(region);


            }
        });
        var gvDiv = $('<div id="gv"></div>')[0];

        this.gvPanel = this._createGenomeViewer();




        var window = Ext.create('Ext.window.Window', {
                //title: 'Show Genes',
            height: 600,
            width: 800,
            //modal: true,
            minimizable: true,
            closable: false,
            bodyPadding: 10,
            listeners: {
                minimize: function (win, obj) {
                    win.hide();
                }
            },
            layout:{
                type:'vbox',
                align: 'stretch'
            },
            items: [
                {
                xtype: 'container',
                //height: 200,
                //width:"100%",
                layout:{
                    type: 'hbox',
                    align: 'stretch'
                },
                items:[_this.chrField,_this.posField,ref, alt, checkButton]

            },
            this.gvPanel
            ]
        });

        return window;
    }
    ,

    _createGenomeViewer: function () {
        var _this = this;

        var gvpanel = Ext.create('Ext.panel.Panel', {
                //title: 'Genome Viewer',
                //flex: 8,
                //height: '100%',
                border: 1,
                margin:"50 0 0 0",
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
                                drawNavigationBar: false,
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

                            var updateForm = function(){
                            
                                var pos = _this.sequence.region.center();
                                var chr = _this.sequence.region.chromosome;

                                _this.chrField.setValue(chr);
                                _this.posField.setValue(pos);
                            };


                            genomeViewer.on("region:change", updateForm);
                            genomeViewer.on("region:move",updateForm);

                            _this.gv = genomeViewer;
                        }
                    }
                },
                autoRender: true
            })
            ;

        return gvpanel;
    },
    _createShowGenesPanel: function(){
        var _this = this;

        var newGrid = new Grid();

        newGrid.model = _this.geneModel;
        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            storeId: "showGenesStore",
            remoteSort: false,
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                }
            ],
            autoLoad:false
        });

        newGrid.grid = Ext.create('Ext.grid.Panel', {
            store: newGrid.store,
            height: 240,
            columns: [
                {
                text: "Name",
                flex: 1,
                dataIndex: 'name',
            }]
            ,
        plugins: 'bufferedrenderer',
        //bbar : {
            //xtype : 'pagingtoolbar',
            //displayInfo: true,
            //store: newGrid.store,
            //displayMsg : 'Total rows {2}'// defaultvalue = 'Displaying {0} - {1} of {2}'
        //},
        //stripeRows: true,
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
            storeId:'allDiseases',
            data: data,
            remoteSort: false,
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                }
            ],
            proxy: {
                type: 'memory'
            },
            groupField: 'name'
        });


        var showGenesAction = Ext.create('Ext.Action', {
            text: 'Show Genes',
            handler: function(widget, evet){
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

                //debugger

                _this.genesWindow.show();

            }
        });
        var showMutationsAction = Ext.create('Ext.Action', {
            text: 'Show Mutations',
            handler: function(widget, evet){
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
                    },
                    itemcontextmenu: function (este, record, item, index, e) {
                        e.stopEvent();
                        var items = [];
                        console.log(record)
                        items.push(showGenesAction);
                        items.push(showMutationsAction);
                        //items.push(renameBucketAction);
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
                            //_this.secDiseases.removeAll();
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
            title: "Diseases (Drag)",
            //margins: '0 2 0 0',
            flex: 1,
            height: "80%",
            multiSelect: true,
            margin: '0 15 10 0',
            loadMask: true,
            plugins: 'bufferedrenderer'
        });

        return allDiseases;
    },
    _createMutationsGrid: function(){
        var _this = this;

        var newGrid = new Grid();

        newGrid.model = Ext.define('MutationModel', {
            extend: 'Ext.data.Model',
            //idProperty: 'name',
            fields: [
                { name:'chr', type:'string'},
                { name:'pos', type:'int'},
                { name:'ref', type:'string'},
                { name:'alt', type:'string'}
            ]
        });

        newGrid.store = Ext.create('Ext.data.Store', {
            model: newGrid.model,
            remoteSort: false,
            storeId: 'mutationStore'
        });
        var columns = [
            {text:'Chr', dataIndex:'chr', flex:1, sortable:false},
            {text:'Pos', dataIndex:'pos', flex:1, sortable:false},
            {text:'Ref', dataIndex:'ref', flex:1, sortable:false},
            {text:'Alt', dataIndex:'alt', flex:1, sortable:false}
        ];

        newGrid.grid = Ext.create('Ext.grid.Panel',{
            title: 'Mutations',
            store: newGrid.store,
            columns: columns,
            margin: '0 15 10 0',
            flex: 1,
            //hideHeaders: true,

        });
        return newGrid;
    }
    ,
    _createDiseaseSetGrid: function (title, mainGrid, geneGrid, filters, addGenes) {

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

        newGrid.addGenes = addGenes;
        
        var showGenesAction = Ext.create('Ext.Action', {
            text: 'Show Genes',
            handler: function(widget, evet){
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

                //debugger

                _this.genesWindow.show();

            }
        });
        var showMutationsAction = Ext.create('Ext.Action', {
            text: 'Show Mutations',
            handler: function(widget, evet){
                var record = allDiseases.grid.getSelectionModel().getSelection()[0];
                alert(record.get("name"));
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
                            //_this.secDiseases.setLoading(true);
                            _this.diseaseGenes.setLoading(true);

                            this.getStore().sort('name', 'ASC');

                            var diseases = data.records;

                            for (var i = 0; i < diseases.length && newGrid.addGenes; i++) {

                                var disName = diseases[i].data.name;

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

                                        _this.diseaseGenes.add(genes);

                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        console.log('Error loading Genes');
                                    }
                                });


                            }
                            _this.allDiseases.setLoading(false);
                            _this.primDiseases.setLoading(false);
                            //_this.secDiseases.setLoading(false);
                            _this.diseaseGenes.setLoading(false);


                            _this.diseaseGenes.grid.getStore().sort('name', 'ASC');
                        },
                    itemcontextmenu: function (este, record, item, index, e) {
                        e.stopEvent();
                        var items = [];
                        console.log(record)
                        items.push(showGenesAction);
                        items.push(showMutationsAction);
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
                    },
                    //{
                        //type: 'plus',
                        //tooltip: 'Add Gene',
                        //handler: function (event, toolEl, panel) {
                            //if (_this.edit) {
                                //rowEditing.cancelEdit();

                                //// Create a record instance through the ModelManager
                                //var r = Ext.create('GeneModel', {
                                    //name: 'New Gene'
                                //});

                                //newGrid.insert(newGrid.count(), r);
                                //rowEditing.startEdit(newGrid.getAt(newGrid.count() - 1), 0);

                            //}
                        //}
                    //}
                ],
                dockedItems: [
                    //{
                        //xtype: 'toolbar',
                        //dock: 'bottom',
                        //items: [
                            ////'->',
                            ////{
                                ////xtype: 'button',
                                ////text: 'New Gene',
                                ////handler: function () {
                                    ////if (_this.edit) {
                                        ////rowEditing.cancelEdit();

                                        ////// Create a record instance through the ModelManager
                                        ////var r = Ext.create('GeneModel', {
                                            ////name: 'New Gene'
                                        ////});

                                        ////newGrid.insert(newGrid.count(), r);
                                        ////rowEditing.startEdit(newGrid.getAt(newGrid.count() - 1), 0);

                                    ////}
                                ////}
                            ////}
                        //]
                    //}
                ],
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

};
