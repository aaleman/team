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

        this.panel       = this._createPanel(this.targetId);
        this.tabPanel    = this._createTabPanel();
        this.panels      = this._initializeDiseasePanel();

        this.form        = this._createForm();
        this.primDisGrid = this._createDiseaseGrid("Prim. Diagnosis");
        this.secDisGrid  = this._createDiseaseGrid("Sec. Diagnosis");
        this.extraGrid   = this._createDiseaseGrid("Deleterious Variants");

        this.panel.add(this.form);
        this.panel.add(this.tabPanel);

        this.tabPanel.add(this.primDisGrid.getPanel());
        this.tabPanel.add(this.secDisGrid.getPanel());
        this.tabPanel.add(this.extraGrid.getPanel());
        this.tabPanel.setActiveTab(this.primDisGrid.getPanel());

        this.dataSec     = [];
        this.dataPrim    = [];
        this.dataExtra   = [];
    },
    _createPanel: function (targetId) {
        var panel = Ext.create('Ext.panel.Panel', {
            renderTo : targetId,
            //title  : "Panels",
            width    : '100%',
            height   : '100%',
            border   : 0,
            layout   : 'vbox',
            closable : false,
            cls      : 'ocb-border-top-lightgrey',
            items    : []
        });

        return panel;
    },
    _createTabPanel: function () {
        var panel = Ext.create('Ext.tab.Panel', {
            title  : "Results",
            width  : '100%',
            flex   : 3,
            border : 0,
            layout : 'vbox',
            cls    : 'ocb-border-top-lightgrey',
            items  : []
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
                                _this.panels = _this._addPanelToForm(panel);

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
            fields: ['name', 'value'],
            data: data
        });

        var genes = Ext.create('Ext.form.field.File', {
            id         : _this.id + "gene_list",
            fieldLabel : "Gene list",
            width      : 500,
            emptyText  : 'Select a file',
            allowBlank : false,
            name       : 'genes'

        });

        var disease = Ext.create('Ext.form.field.ComboBox', {
            id           : _this.id + "disease",
            name         : "disease",
            fieldLabel   : "Panel",
            store        : this.diseaseStore,
            queryMode    : 'local',
            displayField : 'name',
            valueField   : 'name',
            value        : this.diseaseStore.getAt(0).get('value'),
            editable     : false,
            allowBlank   : false
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
                        

                        _this.dataSec = [];
                        _this.dataPrim = [];

                        _this.primDisGrid.clear();
                        _this.secDisGrid.clear();
                        _this.extraGrid.clear();
                        _this.primDisGrid.refresh();


                        var form = _this.form.getForm();
                        if (form.isValid()) {
                            _this.primDisGrid.setLoading(true);

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
                            
                            //for(var i = 0; i< _this.diseaseStore.count(); i++){
                                //var elem = _this.diseaseStore.getAt(i).raw;
                                //if (elem.name == panelName) {
                                    //panel = elem;
                                    //break;
                                //}
                            //}

                            fds_vcf.on("success", function (data) {
                                var variants = _this._parseVcfFile(data);

                                _this._filterVariants(variants, panel);

                                _this.primDisGrid.loadData(_this.dataPrim);
                                _this.secDisGrid.loadData(_this.dataSec);
                                _this.extraGrid.loadData(_this.dataExtra);

                                Ext.getCmp(_this.id + "numRowsLabel").setText(_this.dataPrim.length + " variants");
                                _this.primDisGrid.setLoading(false);

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

        var newGrid = new Grid();

        var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: '{groupField}: {groupValue} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
        });

        var attributes = [
            {name: 'chromosome'        , type: 'String'},
            {name: 'position'          , type: 'int'}   ,
            {name: 'id_snp'            , type: 'String'},
            {name: 'reference'         , type: 'String'},
            {name: 'alternate'         , type: 'String'},
            {name: 'gene'              , type: 'String'},
            {name: 'quality'           , type: 'float'} ,
            {name: 'filter'            , type: 'String'},
            {name: 'info'              , type: 'String'},
            {name: 'format'            , type: 'String'},
            {name: 'sample'            , type: 'String'},
            {name: "gene"              , type: 'String'},
            {name: "ensembl_protein"   , type: 'String'},
            {name: "reference_mutation", type: 'String'},
            {name: "xref"              , type: 'String'},
            {name: "description"       , type: 'String'},
            {name: "omim"              , type: 'String'},
            {name: "hgvs_cds"          , type: 'String'},
            {name: "hgvs_protein"      , type: 'String'},
            {name: "sift"              , type: 'String'},
            {name: "polyphen"          , type: 'String'},
            {name: "ct"                , type: 'String'},
            {name: "transcript"        , type: 'String'},
            {name: "aaPos"             , type: 'int'}   ,
            {name: "aaChange"          , type: 'String'},
            {name: "phenotype"         , type: 'String'},
            {name: "source"            , type: 'String'},
            {name: "pvalue"            , type: 'float'}
        ];
        var renderer = function (value) {
            if (value == '') {
                return ".";
            }
            return value;
        };

        var columns = [
            new Ext.grid.RowNumberer({width: 30}),
            {dataIndex: 'chromosome'        , text: 'Chromosome'        , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'position'          , text: 'Position'          , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'id_snp'            , text: 'SNP Id'            , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'reference'         , text: 'Ref'               , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'alternate'         , text: 'Alt'               , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'gene'              , text: 'Gene'              , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'ct'                , text: 'Conseq. Type'      , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: 'quality'           , text: 'Quality'           , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "ensembl_protein"   , text: 'Ensembl protein'   , flex: 1, emptyCellText: '.', renderer: renderer , hidden:true} ,
            {dataIndex: "reference_mutation", text: 'Reference mutation', flex: 1, emptyCellText: '.', renderer: renderer , hidden:true} ,
            {dataIndex: "xref"              , text: 'Xref'              , flex: 1, emptyCellText: '.', renderer: renderer , hidden: true},
            {dataIndex: "description"       , text: 'Description'       , flex: 1, emptyCellText: '.', renderer: renderer , hidden:true} ,
            {dataIndex: "omim"              , text: 'OMIM'              , flex: 1, emptyCellText: '.', renderer: renderer , hidden: true},
            {dataIndex: "hgvs_cds"          , text: 'Hgvs cds'          , flex: 1, emptyCellText: '.', renderer: renderer , hidden:true} ,
            {dataIndex: "hgvs_protein"      , text: 'Hgvs protein'      , flex: 1, emptyCellText: '.', renderer: renderer , hidden:true} ,
            {dataIndex: "phenotype"         , text: 'Phenotype'         , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "source"            , text: 'Source'            , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "pvalue"            , text: 'pValue'            , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "sift"              , text: 'SIFT'              , flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "polyphen"          , text: 'PolyPhen'          , flex: 1, emptyCellText: '.', renderer: renderer}
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

        return newGrid;

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
    _getRegions: function (genes) {

        var gene_names =[];    
        var final_genes = [];

        Ext.each(genes, function(gene, index){
            gene_names.push(gene.name);
        });
        
        CellBaseManager.get({
            host: 'http://ws-beta.bioinfo.cipf.es/cellbase/rest',
            version: 'v3',
            species: 'hsapiens', //TODO multiples species
            category: 'feature',
            subCategory: 'gene',
            query: gene_names.join(","),
            resource: 'info',
            params: {
                include: "chromosome,start,end"
            },
            async: false,
            success: function (response, textStatus, jqXHR) {

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
                console.log('Error loading Genes');
            }
        });

        return final_genes;
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
                            chromosome: fields[0].replace("chrom","").replace("chr","").replace("chr",""),
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
    _filterVariants: function(variants, panel){
        var _this = this;
        console.log(panel);

        var data = [];

        var genes = _this._getRegions(panel.genes);
        console.log(genes);
        
        for(var i=0; i < variants.length;){
            data = [];

            for(var j = 0; i < variants.length && j < 100; j++, i++){
                data.push(variants[i]);
            }

            _this._checkVariantBatch(data, panel.primaryDiseases, _this.dataPrim);
            _this._checkVariantBatch(data, panel.secondaryDiseases, _this.dataSec);
            _this._checkVariantGeneBatch(data, genes, _this.dataExtra);

            
        }
    
    },
    _checkVariantBatch: function(variants, diseases, grid){
        var _this = this;

        var variantsReg = [];
        for(var i = 0; i< variants.length; i++){
            variantsReg.push(variants[i].chromosome + ":" + variants[i].start + "-" + variants[i].end);
        }


        for (var i = 0; i< diseases.length; i++){

            var dis = diseases[i].name;
            var url = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/genomic/region/" + variantsReg.join(",") + "/snp?phenotype=" + dis;

            $.ajax({
                url: url,
                dataType: 'json',
                async:false,
                success: function(response, textStatus, jqXHR){

                    for(var j=0; j < response.response.length; j++){

                        var elem = response.response[j];
                        if(elem.numResults > 0){
                            //console.log(elem);
                            for (var k = 0; k < elem.numResults; k++){
                                var aux = elem.result[k]; 

                                var copy = {};
                                _.extend(copy, variants[j]);

                                //console.log(aux);
                                copy.gene = aux.associatedGenes;
                                copy.phenotype = aux.phenotype;
                                copy.source = aux.source; if(copy.pvalue >= 0){
                                    copy.pvalue = aux.pValue;
                                }


                                _this._getEffect(copy);
                                _this._getPolyphenSift(copy);
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
        return;

    },
    _checkVariantGeneBatch: function(variants, genes, grid){
        var _this = this;

        for (var i = 0; i < variants.length; i++) {

            var variant = variants[i];
            var panelVariant;

            if (genes.length > 0 && (panelVariant = _this._checkGeneVariant(variant, genes)) != null) {
                variant.gene = panelVariant.name;
                _this._getEffect(variant);
                _this._getPolyphenSift(variant);
                _this.dataExtra.push(variant);
            }
        }
    },
    _filterVariants1: function (variants, panel) {
        var _this = this;

        for (var i = 0; i < variants.length; i++) {
            var variant = variants[i];
            var panelVariant;

            if ((panelVariant = _this._checkVariant(variant, panel.primVar)) != null) {

                variant.gene = panelVariant.gene;
                variant.description = panelVariant.primaryHistology;
//                variant.hgvs_cds = panelVariant.mutationCDS;
//                variant.hgvs_protein = panelVariant.mutationAA;
//                variant.description = panelVariant.description;

                _this.dataPrim.push(variant);
            }
        }

        for (var i = 0; i < variants.length && _this.dataPrim.length == 0; i++) {
            var variant = variants[i];
            var panelVariant;

            if ((panelVariant = _this._checkVariant(variant, panel.secVar)) != null) {


                variant.gene = panelVariant.gene;
                variant.description = panelVariant.primaryHistology;
//                variant.hgvs_cds = panelVariant.mutationCDS;
//                variant.hgvs_protein = panelVariant.mutationAA;
//                variant.description = panelVariant.description;

                _this.dataSec.push(variant);
            }
        }


//        if (_this.dataPrim.length == 0 && _this.dataSec.length == 0) {
        if (true) {

            var req = [];
            var gene = [];

            for (var i = 0; i < panel.primVar.length; i++) {

                var variant = panel.primVar[i];
                req.push(variant.chromosome + ":" + variant.start + "::G");
            }

            var url = "http://ws.bioinfo.cipf.es/cellbase/rest/latest/hsa/genomic/variant/" + req.join(",") + "/consequence_type?of=json";

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
            );

            for (var i = 0; i < variants.length; i++) {

                var variant = variants[i];
                var panelVariant;


                if (final_genes.length > 0 && (panelVariant = _this._checkGeneVariant(variant, final_genes)) != null) {
                    variant.gene = panelVariant.name;
                    _this.dataExtra.push(variant);
                }
            }
        }


        if (_this.dataPrim.length > 0) { // VariantEffect

            var req = [];

            for (var i = 0; i < _this.dataPrim.length; i++) {
                var variant = _this.dataPrim[i];
                req.push(variant.chromosome + ":" + variant.start + ":" + variant.reference + ":" + variant.alternate);
            }

            $.ajax({
                url: "http://ws.bioinfo.cipf.es/cellbase/rest/latest/hsa/genomic/variant/" + req.join(",") + "/consequence_type?of=json",
                dataType: 'json',
                async: false,
                success: function (response, textStatus, jqXHR) {


                    for (var i = 0; i < _this.dataPrim.length; i++) {
                        var variant = _this.dataPrim[i];
                        var gene = [];
                        var ct = [];

                        for (var j = 0; j < response.length; j++) {
                            var elem = response[j];

                            if (elem.chromosome == variant.chromosome && elem.position == variant.start) {
                                
                               if(elem.aaPosition != -1 && elem.transcriptId != "" && elem.aminoacidChange.length >=3 && variant.transcriptId == undefined && variant.aaPos == undefined && variant.aaChange == undefined){
                                   variant.transcript = elem.transcriptId;
                                   variant.aaPos = elem.aaPosition;
                                   variant.aaChange = elem.aminoacidChange;
                               }

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
                        });

                        variant.gene = gene.join(",");
                        variant.ct = ct.join(",");

                        console.log(variant);
                    }

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error loading Diseases');
                }
            });

        _this._getPolyphenSift(_this.dataPrim);
        
        }

        if (_this.dataSec.length > 0) { // VariantEffect

            var req = [];

            for (var i = 0; i < _this.dataSec.length; i++) {
                var variant = _this.dataSec[i];
                req.push(variant.chromosome + ":" + variant.start + ":" + variant.reference + ":" + variant.alternate);
            }

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
        _this._getPolyphenSift(_this.dataSec);
        }
    },
    _getEffect: function(variant){
    
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
                               
                                if(elem.aaPosition != -1 && elem.transcriptId != "" && elem.aminoacidChange.length >=3 && variant.transcriptId == undefined && variant.aaPos == undefined && variant.aaChange == undefined){
                                   variant.transcript = elem.transcriptId;
                                   variant.aaPos = elem.aaPosition;
                                   variant.aaChange = elem.aminoacidChange;
                               }

                        //gene.push(elem.geneName);
                        ct.push(elem.consequenceTypeObo);
                    }

                    //gene = gene.filter(function (elem, pos, self) {
                        //return self.indexOf(elem) == pos;
                    //});


                    ct = ct.filter(function (elem, pos, self) {
                        return self.indexOf(elem) == pos;
                    })

                    //variant.gene = gene.join(",");
                    variant.ct = ct.join(",");

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error loading Effect');
                }
            });


    },
    _getPolyphenSift: function(variant){

            //variant.transcript = "ENST00000378371";
            //variant.aaPos = 1;
            //variant.aaChange = "L/L";

            if(variant.aaPos != undefined && variant.aaPos >= 0){
                var change = variant.aaChange.split("/")[1];
                //if(variant.aaPos != -1){

                var url = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v3/hsapiens/feature/transcript/" + variant.transcript + "/function_prediction?aaPosition=" + variant.aaPos + "&aaChange=" + change;
                //console.log(url);
                $.ajax({
                    url: url,
                    dataType: 'json',
                    async: false,
                    success: function (response, textStatus, jqXHR) {
                        //console.log(response);

                        var res = response.response[0];

                        if(res.numResults > 0){
                            res = res.result[0].aaPositions[variant.aaPos][change];

                            if(res != null){
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

        for (var i = 0; i < EXAMPLE_PANELS.length; i++) {

            var panel = EXAMPLE_PANELS[i];
            panels.push(this._createDiseasePanel(panel.name, panel.primaryDiseases, panel.secondaryDiseases));
        }

        if (localStorage.bioinfo_panels_panels) {
            var lsPanels = JSON.parse(localStorage.bioinfo_panels_panels);
            for (var i = 0; i < lsPanels.length; i++) {
                panels.push(lsPanels[i]);
            }
        }

        if (localStorage.bioinfo_panels_user_settings) {
            var userDefinedPanels = JSON.parse(localStorage.bioinfo_panels_user_settings);
            for (var i = 0; i < userDefinedPanels.length; i++) {
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
        return panels;
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
//                }
//            });

        for (var i = 0; i < panel.primaryDiseases.length; i++) {
            var disease = panel.primaryDiseases[i].name;
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
            var disease = panel.secondaryDiseases[i].name;
            for (var j = 0; j < DB.length; j++) {
                var variant = DB[j];

                if (variant.primaryHistology.indexOf(disease) != -1) {
                    variantsSec.push(variant);
                }
            }
        }

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
