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

    this.modCount = 0;
    this.polymer = args.polymer;
};
Panel.prototype = {
    _incModCount: function () {
        this.modCount++;
        //console.log("Panel changed!!");
    },
    addDisease: function (disease) {
        if (!this.containsDisease(disease)) {
            delete disease._filtered
            this.polymer.push('formData.diseases', disease)

            if (disease.associatedGenes && disease.associatedGenes.length > 0) {
                for (var j = 0; j < disease.associatedGenes.length; j++) {
                    var elem = disease.associatedGenes[j];
                    if (elem.indexOf(",") >= 0) {
                        var splits = elem.split(",");
                        for (var k = 0; k < splits.length; k++) {
                            var gene = splits[k];
                            this.addGene({
                                name: gene
                            });
                        }
                    } else {
                        this.addGene({
                            name: elem
                        })
                    }
                }
            }
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
            disease: this.diseases,
            version: this.version,
            archived: this.archived,
            diseases: this.diseases,
            genes: this.genes,
            mutations: this.mutations
        }
    }
};