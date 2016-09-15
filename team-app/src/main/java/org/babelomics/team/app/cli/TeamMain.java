package org.babelomics.team.app.cli;


import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Joiner;
import org.babelomics.team.lib.filters.TeamVariantGeneRegionFilter;
import org.babelomics.team.lib.filters.TeamVariantReferenceFitler;
import org.babelomics.team.lib.io.TeamCSVDiagnosticFileWriter;
import org.babelomics.team.lib.io.TeamCSVSSecondaryFileWriter;
import org.babelomics.team.lib.io.TeamVariantMongoReader;
import org.babelomics.team.lib.io.TeamVariantStdoutWriter;
import org.babelomics.team.lib.models.Gene;
import org.babelomics.team.lib.models.Mutation;
import org.babelomics.team.lib.models.Panel;
import org.babelomics.team.lib.models.TeamVariant;
import org.opencb.biodata.formats.variant.io.VariantReader;
import org.opencb.biodata.formats.variant.io.VariantWriter;
import org.opencb.biodata.models.core.Region;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.models.variant.avro.ClinVar;
import org.opencb.biodata.models.variant.avro.Cosmic;
import org.opencb.biodata.models.variant.avro.Gwas;
import org.opencb.biodata.models.variant.avro.VariantTraitAssociation;
import org.opencb.biodata.tools.variant.filtering.VariantFilter;
import org.opencb.commons.filters.FilterApplicator;
import org.opencb.commons.io.DataWriter;
// import org.opencb.datastore.core.QueryOptions;
import org.opencb.commons.datastore.core.QueryOptions;
// import org.opencb.opencga.catalog.CatalogManager;
import org.opencb.opencga.catalog.managers.CatalogManager;
import org.opencb.opencga.catalog.exceptions.CatalogException;
import org.opencb.opencga.catalog.models.Sample;
import org.opencb.opencga.core.common.Config;
// import org.opencb.opencga.storage.core.StorageManagerException;
import org.opencb.opencga.storage.core.exceptions.StorageManagerException;
import org.opencb.opencga.storage.core.config.StorageConfiguration;

import java.io.IOException;
import java.util.*;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamMain {

    public static void main(String[] args) throws IOException, CatalogException, IllegalAccessException, InstantiationException, ClassNotFoundException, StorageManagerException {

        Parameters parameters = new Parameters();
        ObjectMapper mapper = new ObjectMapper();
        JCommander jc = new JCommander(parameters);


        int sampleId;
        String outputFile;
        String panelFilename;
        String sessionId;
        String opencgaHome;
        int studyId;

        try {
            jc.parse(args);
        } catch (ParameterException e) {
            jc.usage();
            System.exit(-1);
        }


        sampleId = parameters.getInput();
        panelFilename = parameters.getPanel();
        outputFile = parameters.getOutput();
        sessionId = parameters.getSessionId();
        studyId = parameters.getStudyId();
        opencgaHome = parameters.getOpencgaHome();

        Config.setOpenCGAHome(opencgaHome);

        Properties catalogProp = new Properties();
        catalogProp.load(TeamMain.class.getClassLoader().getResourceAsStream("catalog.properties"));
        CatalogManager catalogManager = new CatalogManager(catalogProp);


        StorageConfiguration storageConfiguration = StorageConfiguration.load(TeamMain.class.getClassLoader().getResourceAsStream("storage-configuration.yml"));
//        System.out.println(storageConfiguration);
        int batchSize = 1000;

        List<Variant> batch;
        List<VariantFilter> filters = new ArrayList<>();
        List<TeamVariant> diagnosticVariants = new ArrayList<>();
        List<TeamVariant> secondaryFindingsVariants = new ArrayList<>();

        java.io.File jsonPanelFile;


        jsonPanelFile = new java.io.File(panelFilename);

        try {
            Panel panel = mapper.readValue(jsonPanelFile, Panel.class);
            List<Region> regionList = getRegionsFromPanel(panel);

            Sample sample = catalogManager.getSample(sampleId, new QueryOptions(), sessionId).getResult().get(0);

            VariantReader reader = new TeamVariantMongoReader(catalogManager, storageConfiguration, studyId, sessionId);


            DataWriter<TeamVariant> diagnosticWriter = new TeamCSVDiagnosticFileWriter(sample, outputFile + "/diagnostic.csv");
            DataWriter<TeamVariant> secondaryFindingsWriter = new TeamCSVSSecondaryFileWriter(sample, outputFile + "/secondary.csv");

//            diagnosticWriter = new TeamVariantStdoutWriter();
//            secondaryFindingsWriter = new TeamVariantStdoutWriter();


            VariantFilter regionFilter = new TeamVariantGeneRegionFilter(regionList);
            VariantFilter referenceFilter = new TeamVariantReferenceFitler(sample);

            filters.add(regionFilter);
            filters.add(referenceFilter);

            reader.open();
            diagnosticWriter.open();
            secondaryFindingsWriter.open();

            reader.pre();
            diagnosticWriter.pre();
            secondaryFindingsWriter.pre();

            batch = reader.read(batchSize);

            while (batch != null && !batch.isEmpty()) {

                FilterApplicator.filter(batch, filters);

                run(batch, panel, sample, diagnosticVariants, secondaryFindingsVariants);

                diagnosticWriter.write(diagnosticVariants);

                secondaryFindingsWriter.write(secondaryFindingsVariants);

                batch.clear();
                diagnosticVariants.clear();
                secondaryFindingsVariants.clear();

                batch = reader.read(batchSize);

            }

            reader.post();
            diagnosticWriter.post();
            secondaryFindingsWriter.post();

            reader.close();
            diagnosticWriter.close();
            secondaryFindingsWriter.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void run(List<Variant> batch, Panel panel, Sample sample, List<TeamVariant> diagnosticVariants, List<TeamVariant> secondaryFindingsVariants) {
        for (Variant variant : batch) {
            TeamVariant teamVariant = new TeamVariant(variant);

            String gt = variant.getStudies().get(0).getSampleData(sample.getName(), "GT");
            teamVariant.setGenotype(gt);
//            System.out.println("variant " + teamVariant + "/n");

            if (isDiagnosticVariant(teamVariant, panel)) {
                diagnosticVariants.add(teamVariant);
            } else {
                VariantTraitAssociation variantTraitAssociation = variant.getAnnotation().getVariantTraitAssociation();

                if (variantTraitAssociation == null) {
                    continue;
                }
                if (variantTraitAssociation.getClinvar() != null && !variantTraitAssociation.getClinvar().isEmpty()) {
                    Set<String> traits = new HashSet<>();
                    for (ClinVar clinvar : variantTraitAssociation.getClinvar()) {
                        for (String trait : clinvar.getTraits()) {
                            // Not Specified,not specified,AllHighlyPenetrant,not provided
                            if (!trait.equalsIgnoreCase("Not Specified") && !trait.equalsIgnoreCase("not provided") && !trait.equalsIgnoreCase("AllHighlyPenetrant") && !trait.contains("http")) {
                                traits.add(trait);
                            }
                        }
                    }
                    teamVariant.setClinvar(Joiner.on(",").join(traits));

                }
                if (variantTraitAssociation.getCosmic() != null && !variantTraitAssociation.getCosmic().isEmpty()) {
                    Set<String> traits = new HashSet<>();
                    for (Cosmic cosmic : variantTraitAssociation.getCosmic()) {
                        traits.add(cosmic.getPrimaryHistology());
                    }
                    teamVariant.setCosmic(Joiner.on(",").join(traits));
                }

                if (variantTraitAssociation.getGwas() != null && !variantTraitAssociation.getGwas().isEmpty()) {
                    Set<String> traits = new HashSet<>();
                    for (Gwas gwas : variantTraitAssociation.getGwas()) {
                        for (String trait : gwas.getTraits()) {
                            traits.add(trait);

                        }
                    }
                    teamVariant.setGwas(Joiner.on(",").join(traits));
                }
                secondaryFindingsVariants.add(teamVariant);
            }
        }
    }

    private static boolean isDiagnosticVariant(TeamVariant teamVariant, Panel panel) {
        Variant variant = teamVariant.getVariant();
        for (Mutation mutation : panel.getMutations()) {
            if (mutation.getChr().equalsIgnoreCase(variant.getChromosome()) &&
                    mutation.getPos() == variant.getStart() &&
                    mutation.getRef().equalsIgnoreCase(variant.getReference()) &&
                    mutation.getAlt().equalsIgnoreCase(variant.getAlternate())
                    ) {
                teamVariant.setPhenotype(mutation.getPhe());
                teamVariant.setSource(mutation.getSrc());
                return true;
            }
        }

        VariantTraitAssociation variantTraitAssociation = variant.getAnnotation().getVariantTraitAssociation();

//        for (Disease disease : panel.getDiseases()) {
//
//            // TODO aaleman: Check if the mutation is in the list of mutations (from the panel)
//            if (variantTraitAssociation == null) {
//                continue;
//            }
//            switch (disease.getSource().toLowerCase()) {
//                case "clinvar":
//                    if (variantTraitAssociation.getClinvar() != null && !variantTraitAssociation.getClinvar().isEmpty()) {
//                        for (ClinVar clinvar : variantTraitAssociation.getClinvar()) {
//                            for (String trait : clinvar.getTraits()) {
//                                if (trait.equalsIgnoreCase(disease.getPhenotype())) {
//                                    teamVariant.setPhenotype(disease.getPhenotype());
//                                    teamVariant.setSource("clinvar");
//                                    return true;
//                                }
//                            }
//                        }
//                    }
//                    break;
//                case "cosmic":
//                    if (variantTraitAssociation.getCosmic() != null && !variantTraitAssociation.getCosmic().isEmpty()) {
//                        for (Cosmic cosmic : variantTraitAssociation.getCosmic()) {
//                            if (cosmic.getPrimaryHistology().equalsIgnoreCase(disease.getPhenotype())) {
//                                teamVariant.setPhenotype(disease.getPhenotype());
//                                teamVariant.setSource("cosmic");
//                                return true;
//                            }
//                        }
//                    }
//                    break;
//                case "gwas":
//                    if (variantTraitAssociation.getGwas() != null && !variantTraitAssociation.getGwas().isEmpty()) {
//                        for (Gwas gwas : variantTraitAssociation.getGwas()) {
//                            for (String trait : gwas.getTraits()) {
//                                if (trait.equalsIgnoreCase(disease.getPhenotype())) {
//                                    teamVariant.setPhenotype(disease.getPhenotype());
//                                    teamVariant.setSource("gwas");
//                                    return true;
//                                }
//                            }
//                        }
//                    }
//                    break;
//            }
//        }

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
