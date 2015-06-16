package org.babelomics.team.app.cli;


import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.babelomics.team.lib.TeamVariantAnnotator;
import org.babelomics.team.lib.filters.TeamVariantGeneRegionFilter;
import org.babelomics.team.lib.io.TeamDiagnosticFileWriter;
import org.babelomics.team.lib.io.TeamSecondaryFindingsFileWriter;
import org.babelomics.team.lib.io.TeamVariantStdoutWriter;
import org.babelomics.team.lib.models.Gene;
import org.babelomics.team.lib.models.Mutation;
import org.babelomics.team.lib.models.Panel;
import org.babelomics.team.lib.models.TeamVariant;
import org.opencb.biodata.formats.variant.io.VariantReader;
import org.opencb.biodata.formats.variant.io.VariantWriter;
import org.opencb.biodata.formats.variant.vcf4.io.VariantVcfReader;
import org.opencb.biodata.models.feature.Region;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.models.variant.VariantSource;
import org.opencb.biodata.tools.variant.filtering.VariantFilter;
import org.opencb.commons.io.DataWriter;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamMain {

    public static void main(String[] args) {


        Parameters parameters = new Parameters();
        ObjectMapper mapper = new ObjectMapper();
        JCommander jc = new JCommander(parameters);

        Panel panel = null;
        TeamVariantAnnotator annotator;

        int batchSize = 1;

        List<Variant> batch;
        List<VariantFilter> filters = new ArrayList<>();
        List<TeamVariant> diagnosticVariants = new ArrayList<>();
        List<TeamVariant> secondaryFindingsVariants = new ArrayList<>();

        File jsonPanelFile;

        String inputFile;
        String outputFile;
        String panelFilename;

        try {
            jc.parse(args);
        } catch (ParameterException e) {
            jc.usage();
        }


        inputFile = parameters.getInput();
        panelFilename = parameters.getPanel();
        outputFile = parameters.getOutput();

        jsonPanelFile = new File(panelFilename);

        try {
            panel = mapper.readValue(jsonPanelFile, Panel.class);

            annotator = new TeamVariantAnnotator();

            List<Region> regionList = getRegionsFromPanel(panel);

            VariantSource source = new VariantSource("file", "file", "file", "file");

            VariantReader reader = new VariantVcfReader(source, inputFile);
            VariantWriter writer = new TeamVariantStdoutWriter();
            DataWriter<TeamVariant> diagnosticWriter = new TeamDiagnosticFileWriter(outputFile + "/diagnostic.csv");
            DataWriter<TeamVariant> secondaryFindingsWriter = new TeamSecondaryFindingsFileWriter(outputFile + "/secondary.csv");

            VariantFilter regionFilter = new TeamVariantGeneRegionFilter(regionList);

            filters.add(regionFilter);

            reader.open();
            writer.open();
            diagnosticWriter.open();
            secondaryFindingsWriter.open();

            reader.pre();
            writer.pre();
            diagnosticWriter.pre();
            secondaryFindingsWriter.pre();


            batch = reader.read(batchSize);

            while (batch != null && !batch.isEmpty()) {

//                FilterApplicator.filter(batch, filters);
                List<TeamVariant> teamBatch = annotator.annotate(batch);

                run(teamBatch, panel, diagnosticVariants, secondaryFindingsVariants);

                diagnosticWriter.write(diagnosticVariants);
                secondaryFindingsWriter.write(secondaryFindingsVariants);

                batch.clear();
                diagnosticVariants.clear();
                secondaryFindingsVariants.clear();

                batch = reader.read(batchSize);

            }

            reader.post();
            writer.post();
            diagnosticWriter.post();
            secondaryFindingsWriter.post();

            reader.close();
            writer.close();
            diagnosticWriter.close();
            secondaryFindingsWriter.close();

        } catch (IOException | URISyntaxException e) {
            e.printStackTrace();
        }


    }

    private static void run(List<TeamVariant> batch, Panel panel, List<TeamVariant> diagnosticVariants, List<TeamVariant> secondaryFindingsVariants) {
        for (TeamVariant variant : batch) {
            if (isDiagnosticVariant(variant, panel)) {
                diagnosticVariants.add(variant);
            } else {
                secondaryFindingsVariants.add(variant);
            }
        }

    }

    private static boolean isDiagnosticVariant(TeamVariant teamVariant, Panel panel) {
        Variant variant = teamVariant.getVariant();
        for (Mutation m : panel.getMutations()) {
            if (variant.getChromosome().equals(m.getChr()) &&
                    variant.getStart() == m.getPos() &&
                    variant.getReference().equals(m.getRef()) &&
                    variant.getAlternate().equals(m.getAlt())) {
                teamVariant.setPhenotype(m.getPhe());
                teamVariant.setSource(m.getSrc());
                return true;
            }
        }
        return false;
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
