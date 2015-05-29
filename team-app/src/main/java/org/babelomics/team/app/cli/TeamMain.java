package org.babelomics.team.app.cli;


import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.babelomics.team.lib.filters.TeamVariantGeneRegionFilter;
import org.babelomics.team.lib.io.TeamVariantStdoutWriter;
import org.babelomics.team.lib.models.Gene;
import org.babelomics.team.lib.models.Panel;
import org.opencb.biodata.formats.variant.io.VariantReader;
import org.opencb.biodata.formats.variant.io.VariantWriter;
import org.opencb.biodata.formats.variant.vcf4.io.VariantVcfReader;
import org.opencb.biodata.models.feature.Region;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.models.variant.VariantSource;
import org.opencb.biodata.tools.variant.filtering.VariantFilter;
import org.opencb.commons.filters.FilterApplicator;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamMain {

    public static void main(String[] args) throws IOException {


        Parameters parameters = new Parameters();
        ObjectMapper mapper = new ObjectMapper();
        JCommander jc = new JCommander(parameters);

        Panel p = null;
        List<Variant> batch;
        List<VariantFilter> filters = new ArrayList<>();

        File jsonPanelFile;

        String inputFile;
        String panel;

        try {
            jc.parse(args);
        } catch (ParameterException e) {
            jc.usage();
        }


        inputFile = parameters.getInput();
        panel = parameters.getPanel();

        jsonPanelFile = new File(panel);

        try {
            p = mapper.readValue(jsonPanelFile, Panel.class);
        } catch (IOException e) {
            e.printStackTrace();
        }


        List<Region> regionList = getRegionsFromPanel(p);

        System.out.println("Arrays.asList(regionList).toString() = " + Arrays.asList(regionList).toString());


        VariantSource source = new VariantSource("file", "file", "file", "file");

        VariantReader reader = new VariantVcfReader(source, inputFile);
        VariantWriter writer = new TeamVariantStdoutWriter();

        VariantFilter regionFilter = new TeamVariantGeneRegionFilter(regionList);
        filters.add(regionFilter);

        reader.open();
        writer.open();

        reader.pre();
        writer.pre();


        while ((batch = reader.read()) != null) {

            FilterApplicator.filter(batch, filters);

            writer.write(batch);
            batch.clear();

        }

        reader.post();
        writer.post();

        reader.close();
        writer.close();


    }

    private static List<Region> getRegionsFromPanel(Panel p) {

        List<Region> list = new ArrayList<>();

        for (Gene g : p.getGenes()) {

            if (g.getChr() != null && !g.getChr().isEmpty()) {
                list.add(new Region(g.getChr(), g.getStart(), g.getEnd()));
            }
        }

        return list;
    }
}
