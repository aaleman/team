package org.babelomics.team.lib.models;

import org.opencb.biodata.models.variant.Variant;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamVariant {

    private String phenotype;
    private String source;
    private Variant variant;

    public TeamVariant(Variant v) {
        this.variant = v;
    }

    public String getPhenotype() {
        return phenotype;
    }

    public void setPhenotype(String phenotype) {
        this.phenotype = phenotype;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;

    }

    public Variant getVariant() {
        return variant;
    }
}
