function MutationSelectorWidget(args){
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("MutationSelectorWidget");

    _.extend(this, args);
    this.rendered = false;
    if(this.autoRender){
        this.render(this.targetId);
    }
}

MutationSelectorWidget.prototype = {
    draw: function(){
        var _this = this;
        if (!this.rendered) {
            console.info('Panel Settings Widget is not rendered yet');
            return;
        }

    },

    render: function (){

        var _this = this;

        _this.rendered = true;

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
            height: 700,
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

    },
    _createGenomeViewer : function() {
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

                        var tracks = [];

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
                            drawChromosomePanel: false
                            //                            drawRegionOverviewPanel: true
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
                        tracks.push(_this.sequence);

                        _this.gene = new GeneTrack({
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
                        tracks.push(_this.gene);

                        var renderer = new FeatureRenderer(FEATURE_TYPES.gene);
                        renderer.on({
                            'feature:click': function (event) {
                            }
                        });


                        var gene = new FeatureTrack({
                            targetId: null,
                            id: 2,
                            //        title: 'Gene',
                            minHistogramRegionSize: 20000000,
                            maxLabelRegionSize: 10000000,
                            height: 100,

                            renderer: renderer,

                            dataAdapter: new CellBaseAdapter({
                                category: "genomic",
                                subCategory: "region",
                                resource: "gene",
                                params: {
                                    exclude: 'transcripts'
                                },
                                species: genomeViewer.species,
                                cacheConfig: {
                                    chunkSize: 100000
                                }
                            })
                        });
                        genomeViewer.addOverviewTrack(gene);

                        _this.snp = new FeatureTrack({
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

                        tracks.push(_this.snp);
                        genomeViewer.addTrack(tracks);

                        //                        genomeViewer.addTrack(_this.sequence);
                        //                        genomeViewer.addTrack(this.gene);
                        //                        genomeViewer.addTrack(this.snp);

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
    }

};
