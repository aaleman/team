function Panel(args) {
    this.id = Utils.genId("Panel");
    this.name = "";
    this.diseases = [];
    this.genes = [];
    this.mutations = [];

    this.modCount = 0;
};
Panel.prototype = {
    _incModCount: function () {
        this.modCount++;
    },
    addDisease: function (disease) {
        if (!this.containsDisease(disease)) {
            this.diseases.push(disease);
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
        this.diseases = [];
        this._incModCount();
    },
    clearGenes: function () {
        this.genes = [];
        this._incModCount();
    },
    clearMutations: function () {
        this.mutations = [];
        this._incModCount();
    },
    addGene: function (gene) {
        var auxGene = this.containsGene(gene);
        if (auxGene) {
            auxGene.count++;
        } else {
            gene.count = 1;
            this.genes.push(gene);
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
                return gene;
            }
        }
        return null;
    },
    addMutation: function (mutation) {
        this.mutations.push(mutation);
        this._incModCount();
    }
};