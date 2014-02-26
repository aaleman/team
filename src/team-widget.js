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
    this.userSettings;

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
        this.progress = Ext.create('Ext.ProgressBar', {
            text: 'Progress',
            border: 1,
            margin: 3,
            height: 20,
            width: "100%"
        });

        this.form = this._createForm();
        this.primDisGrid = this._createDiseaseGrid("Prim. Diagnostic");
        this.extraGrid = this._createDiseaseGrid("Deleterious Variants");

        this.panel.add(this.form);
        this.panel.add(this.tabPanel);
//        this.panel.add(this.progress);

        this.tabPanel.add(this.primDisGrid.getPanel());
        this.tabPanel.add(this.extraGrid.getPanel());
        this.tabPanel.setActiveTab(this.primDisGrid.getPanel());

        this.dataSec = [];
        this.dataPrim = [];
        this.dataExtra = [];

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
                        alert('You clicked the button!');
                    }
                }
            ]
        });

        return panel;
    },
    _createForm: function () {
        var _this = this;

        this.diseaseStore = Ext.create("Ext.data.Store", {
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
            }
        )
        ;

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
            margin: '5 5 20 5',
            items: [disease, vcf],
            buttonAlign: 'left',
            buttons: [
                {
                    text: 'Run',
                    handler: function () {
                        var button = Ext.getCmp(_this.id + "_generate_report");
                        button.disable();

                        _this.dataSec = [];
                        _this.dataPrim = [];

                        _this.primDisGrid.clear();
                        _this.extraGrid.clear();

                        var form = _this.form.getForm();
                        if (form.isValid()) {
                            _this.primDisGrid.setLoading(true);

                            var vcf_file = document.getElementById(vcf.fileInputEl.id).files[0];

                            var fds_vcf = new FileDataSource(vcf_file);

                            var panelOpt = Ext.getCmp(_this.id + "disease").getValue();
                            var panelSplit = panelOpt.split("_");
                            var panelType = panelSplit[0];
                            var panelId = panelSplit[1];

                            panel = _this.userSettings.get(panelType, panelId);

                            fds_vcf.on("success", function (data) {

                                _this.progress.updateProgress(1, 'Parsing Vcf File');

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

            {name: 'quality', type: 'float'} ,
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
            {name: "pvalue", type: 'float'}
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
            {dataIndex: 'quality', text: 'Quality', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "ensembl_protein", text: 'Ensembl protein', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true} ,
            {dataIndex: "reference_mutation", text: 'Reference mutation', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true} ,
            {dataIndex: "xref", text: 'Xref', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true},
            {dataIndex: "description", text: 'Description', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true} ,
            {dataIndex: "omim", text: 'OMIM', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true},
            {dataIndex: "hgvs_cds", text: 'Hgvs cds', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true} ,
            {dataIndex: "hgvs_protein", text: 'Hgvs protein', flex: 1, emptyCellText: '.', renderer: renderer, hidden: true} ,
            {dataIndex: "phenotype", text: 'Phenotype', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "source", text: 'Source', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "pvalue", text: 'pValue', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "sift", text: 'SIFT', flex: 1, emptyCellText: '.', renderer: renderer},
            {dataIndex: "polyphen", text: 'PolyPhen', flex: 1, emptyCellText: '.', renderer: renderer}
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
    _getRegions: function (genes) {

        var gene_names = [];
        var final_genes = [];

        Ext.each(genes, function (gene, index) {
            gene_names.push(gene.name);
        });

        console.log(gene_names);

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


                for (var i = 0; response.response !== undefined && i < response.response.length; i++) {
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
                            chromosome: fields[0].replace("chrom", "").replace("chr", "").replace("chr", ""),
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

        _this.progress.updateProgress(2, 'Retrieving Genes');

        var genes = _this._getRegions(panel.getGenes());

        _this.progress.updateProgress(3, 'Retrieving Disease Info');

        for (var i = 0; i < variants.length;) {
            data = [];

            for (var j = 0; i < variants.length && j < 100; j++, i++) {
                data.push(variants[i]);
            }

            _this._checkVariantBatch(data, panel.getDiseases(), _this.dataPrim);
            _this._checkVariantGeneBatch(data, genes, _this.dataExtra);
        }
        _this.progress.updateProgress(5, 'Finish');


    },
    _checkVariantBatch: function (variants, diseases, grid) {
        var _this = this;

        var variantsReg = [];
        for (var i = 0; i < variants.length; i++) {
            variantsReg.push(variants[i].chromosome + ":" + variants[i].start + "-" + variants[i].end);
        }

        console.log("Start Cellbase");
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
                                copy.source = aux.source;
                                if (copy.pvalue >= 0) {
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

        console.log("FIN DISEASES");
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
    _checkVariantGeneBatch: function (variants, genes, grid) {
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
    _checkGeneVariant: function (variant, genes) {
        for (var i = 0; i < genes.length; i++) {
            var gene = genes[i];
            if (gene.chr == variant.chromosome && gene.start <= variant.start && variant.end <= gene.end) {
                return gene;
            }
        }
        return null;
    }
};