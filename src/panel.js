function Mutation(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("Mutation");

    this.chr;
    this.pos;
    this.ref;
    this.alt;

    _.extend(this, args);
}
Mutation.prototype = {

    toJSON: function () {
        return {
            chr: this.chr,
            pos: this.pos,
            ref: this.ref,
            alt: this.alt
        };
    }
}
;

function Disease(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("Disease");

    this.name = "";
    this.mutations = [];
    this.genes = [];

    _.extend(this, args);

}
Disease.prototype = {
    toJSON: function () {
        return{
            name: this.name,
            mutations: this.mutations,
            genes: this.genes
        }
    },
    getGenes: function () {
        return this.genes;
    },
    addMutation: function (chr, pos, ref, alt) {

        var m = new Mutation({
            chr: chr,
            pos: pos,
            ref: ref,
            alt: alt
        });
        this.mutations.push(m);

    },
    getMutations: function () {
        return this.mutations;
    }
}

function Panel(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("Panel");

    this.panelType;
    this.panelId;
    this.name;

    this.diseases = [];
    this.extraGenes = [];
    this.sift;
    this.polyphen;

    _.extend(this, args);
}
Panel.prototype = {
    toJSON: function () {
        return {
            panelType: this.panelType,
            panelId: this.panelId,
            name: this.name,
            diseases: this.diseases,
            extraGenes: this.extraGenes,
            sift:this.sift,

        }
    },
    getGenes: function () {

        var totalGenes = [];

        for (var i = 0; i < this.diseases.length; i++) {
            var d = this.diseases[i];
            for (var j = 0; d.genes !== undefined && j < d.genes.length; j++) {
                totalGenes.push(d.genes[j]);
            }
        }

        for (var i = 0; this.extraGenes !== undefined && i < this.extraGenes.length; i++) {
            totalGenes.push(this.extraGenes[i]);
        }
        console.log(totalGenes);
        return totalGenes;
    },
    getDiseases: function () {
        return this.diseases;
    },
    addDisease: function (dis, updateStore) {

        if (updateStore) {
            Ext.getStore("PrimDiseaseStore").add(dis);
        }
        this.diseases.push(dis);
    },
    getDisease: function (disName) {
        for (var i = 0; i < this.diseases.length; i++) {
            var d = this.diseases[i];
            if (d.name == disName) {
                return d;
            }
        }

        return null;
    },
    removeDisease: function (disName) {
        var elem = -1;

        for (var i = 0; i < this.diseases.length; i++) {
            var d = this.diseases[i];
            if (d.name == disName) {
                elem = i;
                break;
            }
        }
        if (elem != -1) {
            this.diseases.splice(elem, 1);
        }
    },
    addMutationToDisease: function (disName, chr, pos, ref, alt) {

        var b = false;
        for (var i = 0; i < this.diseases.length && !b; i++) {
            var d = this.diseases[i];
            if (d.name == disName) {
                d.addMutation(chr, pos, ref, alt);
                b = true;
            }
        }
        if (!b) {
            var d = new Disease();
            d.name = disName;
            d.addMutation(chr, pos, ref, alt);
            this.addDisease(d, true);
        }

    }
};

function UserSettings(args) {
    _.extend(this, Backbone.Events);

    // Default values
    this.id = Utils.genId("UserSettings");
    this.examples = [];
    this.userDefined = [];
    this.max = 0;

    if (EXAMPLE_PANELS) {
        for (var i = 0; i < EXAMPLE_PANELS.length; i++) {
            var panel = EXAMPLE_PANELS[i];

            this.addExamplePanel({
                panelType: 'example',
                panelId: i,
                name: panel.name,
                primaryDiseases: panel.primaryDiseases,
                secondaryDiseases: panel.secondaryDiseases,
                genes: panel.genes,
                diseases: panel.diseases,
                extraGenes: panel.extraGenes
            });
        }
    }

    if (localStorage.bioinfo_panels_user_settings) {
        var userDefinedPanels = JSON.parse(localStorage.bioinfo_panels_user_settings);

        for (var i = 0; i < userDefinedPanels.length; i++) {
            var elem = userDefinedPanels[i];
            elem.panelType = 'user';
            elem.panelId = i;
            this.addPanel(elem);
        }
        this.save();
        this.max = i;
    }


    _.extend(this, args);
}
UserSettings.prototype = {

    addPanel: function (args) { // CHECK MAX

        args.panelType = "user";
        args.panelId = this.max++;

        this.userDefined.push(new Panel(args));

        Ext.getStore("UserExampleStore").add(args);
        Ext.getStore("DiseaseStore").add(args);
    },
    save: function () {
        var aux = [];

        for (var i = 0; i < this.userDefined.length; i++) {
            if (this.userDefined[i].panelType == "user") {
                aux.push(this.userDefined[i]);
            }
        }
        localStorage.bioinfo_panels_user_settings = JSON.stringify(aux);
    },
    addExamplePanel: function (args) {

        args.panelType = "example";
        this.examples.push(new Panel(args));

        Ext.getStore("ExampleStore").add(args);
        Ext.getStore("DiseaseStore").add(args);

    },
    getData: function () {
        return this.userDefined;
    },
    isExampleDataEmpty: function () {

        return (this.userDefined.length == 0);
    },
    clear: function () {

        this.userDefined.splice(0, this.userDefined.length);

        var storeAux = Ext.getStore("DiseaseStore").query("panelType", "user");
        Ext.getStore("DiseaseStore").remove(storeAux.items);

        delete localStorage.bioinfo_panels_user_settings;
    },
    getUserPanels: function () {

        return this.userDefined;

    },
    toJson: function () {
        return JSON.stringify(this.getUserPanels(), null, '\t');
    },
    importData: function (data) {
        var jsonData = JSON.parse(data);

        for (var i = 0; i < jsonData.length; i++) {
            this.addPanel(jsonData[i]);
        }
        this.save();

    },
    get: function (panelType, panelId) {

        var data = [];

        if (panelType == "user") {
            data = this.userDefined;

        } else if (panelType == "example") {
            data = this.examples;

        }

        for (var i = 0; i < data.length; i++) {
            var p = data[i];
            if (p.panelType == panelType && p.panelId == panelId) {
                return p;
            }
        }
        return null;
    },
    remove: function (panel) {

        var elem = -1;
        for (var i = 0; i < this.userDefined.length; i++) {
            var p = this.userDefined[i];
            if (p.panelType == panel.panelType && p.panelId == panel.panelId) {
                elem = i;
                break;
            }
        }

        if (elem != -1) {
            this.userDefined.splice(elem, 1);
            var query = Ext.getStore("UserExampleStore").queryBy(function (record, id) {
                return (record.get('panelType') == panel.panelType && record.get('panelId') == panel.panelId);
            });

            Ext.getStore("UserExampleStore").remove(query.items);

            query = Ext.getStore("DiseaseStore").queryBy(function (record, id) {
                return (record.get('panelType') == panel.panelType && record.get('panelId') == panel.panelId);
            });
            Ext.getStore("DiseaseStore").remove(query.items);

        }


    }

}
;

