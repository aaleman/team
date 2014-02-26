function Panel(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("Panel");

    this.panelType;
    this.panelId;
    this.name;
    this.primaryDiseases;
    this.secondaryDiseases;
    this.genes;

    _.extend(this, args);
}
Panel.prototype = {
    toJSON: function () {
        return {
            panelType: this.panelType,
            panelId: this.panelId,
            name: this.name,
            primaryDiseases: this.primaryDiseases,
            secondaryDiseases: this.secondaryDiseases,
            genes: this.genes
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
//    this.numExamples = 0;
//    this.numUserPanels = 0;

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
//            this.numExamples++;
        }
    }

    if (localStorage.bioinfo_panels_user_settings) {
        var userDefinedPanels = JSON.parse(localStorage.bioinfo_panels_user_settings);

        for (var i = 0; i < userDefinedPanels.length; i++) {
            var elem = userDefinedPanels[i];
            elem.panelType = 'user';
            elem.panelId = i;
            this.addPanel(elem);
//            this.numUserPanels++;
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
        for (var i = 0; i < this.userDefined.length; i++) {
            var p = this.userDefined[i];
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

