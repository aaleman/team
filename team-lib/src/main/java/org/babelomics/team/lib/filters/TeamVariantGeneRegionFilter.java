package org.babelomics.team.lib.filters;

import org.opencb.biodata.models.core.Region;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.tools.variant.filtering.VariantFilter;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamVariantGeneRegionFilter extends VariantFilter {

    private List<Region> regionList;

    public TeamVariantGeneRegionFilter(String regions) {
        super();
        regionList = new ArrayList<>();

        String[] splits = regions.split(",");
        for (String split : splits) {
            regionList.add(new Region(split));
        }

        System.out.println("regionList = " + regionList);
    }

    public TeamVariantGeneRegionFilter(String regions, int priority) {
        super(priority);
        regionList = new ArrayList<>();

        String[] splits = regions.split(",");
        for (String split : splits) {
            regionList.add(new Region(split));
        }
    }

    public TeamVariantGeneRegionFilter(List<Region> regionList) {
        super();
        this.regionList = regionList;
    }

    @Override
    public boolean apply(Variant variant) {
        for (Region r : regionList) {
            if (r.contains(variant.getChromosome(), variant.getStart())) {
                return true;
            }
        }
        return false;

    }
}
