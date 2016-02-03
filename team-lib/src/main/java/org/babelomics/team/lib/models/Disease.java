package org.babelomics.team.lib.models;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class Disease {
    public String phenotype;
    public String source;
    public List<String> associatedGenes = new ArrayList<>();

    public Disease() {
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

    public List<String> getAssociatedGenes() {
        return associatedGenes;
    }

    public void setAssociatedGenes(List<String> associatedGenes) {
        this.associatedGenes = associatedGenes;
    }

    @Override
    public String toString() {
        return "Disease{" +
                "phenotype='" + phenotype + '\'' +
                ", source='" + source + '\'' +
                ", associatedGenes=" + Arrays.asList(associatedGenes).toString() +
                '}';
    }
}
