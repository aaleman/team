function Panel(args) {
    this.id = Utils.genId("Panel");
    this.name = "";
    this.diseases = [];
    this.genes = [];
    this.mutations = [];
    this.name = "";
    this.author = "";
    this.description = "";
    this.date = "";
    this.disease = "";
    this.version = 1;
    this.archived = false;
    this.polymer;

    _.extend(this, args);

    this.modCount = 0;
};
Panel.prototype = {
    _incModCount: function () {
        this.modCount++;
        //console.log("Panel changed!!");
    },
    addDisease: function (disease) {
        var me = this;
        if (!this.containsDisease(disease)) {
            delete disease._filtered
            this.polymer.push('formData.diseases', disease)

            if (disease.associatedGenes && disease.associatedGenes.length > 0) {
                console.log(disease.associatedGenes);
                for (var j = 0; j < disease.associatedGenes.length; j++) {
                    var elem = disease.associatedGenes[j];
                    //if (elem.indexOf(",") >= 0) {
                    var splits = elem.split(",");

                    CellBaseManager.get({
                        species: 'hsapiens',
                        category: 'feature',
                        subCategory: 'gene',
                        resource: 'info',
                        async: false,
                        query: elem,
                        params: {
                            include: "name,chromosome,start,end"
                        },
                        success: function (data) {

                            if (data.response && data.response.length > 0) {

                                for (var i = 0; i < data.response.length; i++) {
                                    var geneElem = data.response[i];
                                    if (geneElem.result.length > 0) {
                                        var row = data.response[i].result[0];
                                        var gene = {
                                            name: geneElem.id,
                                            chr: row.chromosome,
                                            start: row.start,
                                            end: row.end
                                        };
                                        me.addGene(gene);

                                    } else {
                                        me.addGene({
                                            name: geneElem.id
                                        });
                                    }


                                }
                            }
                        }
                    });
                    //} else {
                    //    this.addGene({
                    //        name: elem
                    //    })
                    //}
                }
            }
            //
            // if (disease.source == "clinvar") {
            //
            //    CellBaseManager.get({
            //        species: 'hsapiens',
            //        category: 'feature',
            //        subCategory: 'clinical',
            //        resource: 'all',
            //        async: false,
            //        params: {
            //            source: 'clinvar',
            //            phenotype: disease.phenotype,
            //            exclude: "annot,clinvarSet"
            //        },
            //        success: function (data) {
            //            if (data.response && data.response.length > 0) {
            //                var result = data.response[0].result;
            //                for (var i = 0; i < result.length; i++) {
            //                    var row = result[i];
            //                    var mut = {
            //
            //                        chr: row.chromosome,
            //                        pos: row.start,
            //                        ref: row.reference,
            //                        alt: row.alternate,
            //                        phe: disease.phenotype
            //                    }
            //                    me.addMutation(mut);
            //
            //                }
            //            }
            //        }
            //    });
            // }


            this._incModCount();
        }
    },
    addAllDiseases: function (diseases) {
        for (var i = 0; i < diseases.length; i++) {
            var disease = diseases[i];
            this.addDisease(disease);
        }
    },
    containsDisease: function (disease) {
        for (var i = 0; i < this.diseases.length; i++) {
            var elem = this.diseases[i];
            if (elem === disease) {
                return true;
            }
        }
        return false;
    },
    clearDiseases: function () {
        for (var i = 0; i < this.diseases.length; i++) {
            var disease = this.diseases[i];
            this.removeGenesFromDisease(disease);
            this.removeMutationsFromDisease(disease);
        }
        this.diseases = [];
        this.polymer.notifyPath('formData.diseases', this.diseases);
        this._incModCount();
    },
    clearGenes: function () {
        this.genes = [];
        this.polymer.notifyPath('formData.genes', this.genes);
        this._incModCount();
    },
    clearMutations: function () {
        this.mutations = [];
        this.polymer.notifyPath('formData.mutations', this.mutations);
        this._incModCount();
    },
    addGene: function (gene) {
        var auxGene = this.containsGene(gene);

        if (auxGene) {
            auxGene.count++;
            this.polymer.notifyPath('formData.genes', this.genes);
        } else {
            gene.count = 1;
            this.polymer.push('formData.genes', gene);
        }
        this._incModCount();
    },
    addAllGenes: function (genes) {
        for (var i = 0; i < genes.length; i++) {
            var elem = genes[i];
            this.addGene(elem);
        }
    },
    containsGene: function (gene) {
        for (var i = 0; i < this.genes.length; i++) {
            var elem = this.genes[i];
            if (elem.name === gene.name) {
                return elem;
            }
        }
        return null;
    },
    addMutation: function (mutation) {
        if (!this.containsMutation(mutation)) {
            this.polymer.push('formData.mutations', mutation);
            this._incModCount();
        }
    },
    containsMutation: function (mutation) {
        for (var i = 0; i < this.mutations.length; i++) {
            var elem = this.mutations[i];
            if (elem.chr == mutation.chr &&
                elem.pos == mutation.pos &&
                elem.ref == mutation.ref &&
                elem.alt == mutation.alt &&
                elem.phe == mutation.phe) {
                return true;
            }
        }
        return false;
    },
    removeGenesFromDisease: function (disease) {
        if (disease.associatedGenes && disease.associatedGenes.length > 0) {
            for (var j = 0; j < disease.associatedGenes.length; j++) {
                var elem = disease.associatedGenes[j];
                if (elem.indexOf(",") >= 0) {
                    var splits = elem.split(",");
                    for (var k = 0; k < splits.length; k++) {
                        var gene = splits[k];
                        this.removeGene({name: gene});
                    }
                } else {
                    this.removeGene({name: elem});
                }
            }
        }

    },
    removeMutationsFromDisease: function (disease) {
        var mutations = [];
        for (var i = 0; i < this.mutations.length; i++) {
            var mutation = this.mutations[i];
            if (mutation.phe !== disease.phenotype) {
                mutations.push(mutation);

            }
        }
        this.polymer.set('formData.mutations', mutations);
    },
    removeGene: function (gene) {
        var index = -1;
        var g = null;
        for (var i = 0; g == null && i < this.genes.length; i++) {
            var elem = this.genes[i];
            if (elem.name === gene.name) {
                index = i;
                g = elem;
            }
        }

        if (g != null && index >= 0) {
            if (g.count > 1) {
                g.count--;
            } else {
                this.polymer.splice('formData.genes', index, 1);
            }
            this._incModCount();
        }
    },
    toJSON: function () {
        return {
            id: this.id,
            name: this.name,
            author: this.author,
            description: this.description,
            date: this.date,
            disease: this.disease,
            version: this.version,
            archived: this.archived,
            diseases: this.diseases,
            genes: this.genes,
            mutations: this.mutations
        }
    }
};
