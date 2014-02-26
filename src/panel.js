function Panel(args) {
    _.extend(this, Backbone.Events);

    // Default values
    this.id = Utils.genId("Grid");
    this.data = [];
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
                genes: panel.genes
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
Panel.prototype = {

    addPanel: function (args) { // CHECK MAX
        var elem = {
            panelType: "user",
            panelId: this.max++,
            name: args.name,
            primaryDiseases: args.primaryDiseases,
            secondaryDiseases: args.secondaryDiseases,
            genes: args.genes
        };
        this.data.push(elem);
        Ext.getStore("UserExampleStore").add(args);
        Ext.getStore("DiseaseStore").add(args);
    },
    save: function () {
        var aux = [];

        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].panelType == "user") {
                aux.push(this.data[i]);
            }
        }
        localStorage.bioinfo_panels_user_settings = JSON.stringify(aux);
    },
    addExamplePanel: function (args) {
        var elem = {
            panelType: "example",
            panelId: args.panelId,
            name: args.name,
            primaryDiseases: args.primaryDiseases,
            secondaryDiseases: args.secondaryDiseases,
            genes: args.genes
        };
        this.data.push(elem);
        Ext.getStore("ExampleStore").add(args);
        Ext.getStore("DiseaseStore").add(args);

    },
    getData: function () {
        return this.data;
    },
    isExampleDataEmpty: function () {

        for (var i = 0; i < this.data.length; i++) {
            var elem = this.data[i];
            if (elem.panelType == "user") {
                return false;
            }
        }
        return true;
    },
    clear: function () {

        var newData = [];
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].panelType == "example") {
                newData.push(this.data[i]);
            }
        }

        this.data = newData;

        var storeAux = Ext.getStore("DiseaseStore").query("panelType", "user");
        Ext.getStore("DiseaseStore").remove(storeAux.items);

        delete localStorage.bioinfo_panels_user_settings;
    },
    getUserPanels: function () {

        var aux = [];

        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].panelType == "user") {
                aux.push(this.data[i]);
            }
        }
        return aux;
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

        for (var i = 0; i < this.data.length; i++) {
            var p = this.data[i];
            if (p.panelType == panelType && p.panelId == panelId) {
                return p;
            }
        }

        return null;

    },
    getGenes: function (panel) {

        var p = this.get(panel.panelType, panel.panelId);

        return p.genes;

    },
    getPrimaryDiseases: function (panel) {
        var p = this.get(panel.panelType, panel.panelId);
        return p.primaryDiseases;
    },
    remove: function (panel) {

        var elem = -1;
        for (var i = 0; i < this.data.length; i++) {
            var p = this.data[i];
            if (p.panelType == panel.panelType && p.panelId == panel.panelId) {
                elem = i;
                break;
            }
        }

        if (elem != -1) {
            this.data.splice(elem, 1);
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