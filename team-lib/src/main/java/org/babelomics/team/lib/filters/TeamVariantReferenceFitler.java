package org.babelomics.team.lib.filters;

import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.tools.variant.filtering.VariantFilter;
import org.opencb.opencga.catalog.CatalogManager;
import org.opencb.opencga.catalog.exceptions.CatalogException;
import org.opencb.opencga.catalog.models.Sample;

/**
 * @author Alejandro Alemán Ramos <alejandro.aleman.ramos@gmail.com>
 */
public class TeamVariantReferenceFitler extends VariantFilter {
    private Sample sample;
    private CatalogManager catalogManager;

    public TeamVariantReferenceFitler(Sample sampleId) throws CatalogException {

        this.sample = sampleId;

    }

    @Override
    public boolean apply(Variant v) {

        String gt = v.getStudies().get(0).getSampleData(this.sample.getName(), "GT");

        return !(gt.equals("0/0") || gt.equals("0|0") || gt.contains("."));

    }
}
