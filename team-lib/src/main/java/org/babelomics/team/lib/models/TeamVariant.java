package org.babelomics.team.lib.models;

import org.opencb.biodata.models.variant.Variant;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamVariant {

    private String phenotype;
    private String source;

    private Variant variant;

    private String clinvar;
    private String gwas;
    private String cosmic;

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


    public String getClinvar() {
        return clinvar;
    }

    public void setClinvar(String clinvar) {
        this.clinvar = clinvar;
    }

    public String getGwas() {
        return gwas;
    }

    public void setGwas(String gwas) {
        this.gwas = gwas;
    }

    public String getCosmic() {
        return cosmic;
    }

    public void setCosmic(String cosmic) {
        this.cosmic = cosmic;
    }
}
