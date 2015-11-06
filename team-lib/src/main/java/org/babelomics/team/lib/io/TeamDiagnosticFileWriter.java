package org.babelomics.team.lib.io;

import com.google.common.base.Joiner;
import org.babelomics.team.lib.models.TeamVariant;
import org.opencb.biodata.models.variant.StudyEntry;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.models.variant.avro.*;
import org.opencb.commons.io.DataWriter;

import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.text.DecimalFormat;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamDiagnosticFileWriter implements DataWriter<TeamVariant> {

    private PrintWriter printer;
    private String fileId;
    private String filename;
    private static final String SEPARATOR = "\t";
    private DecimalFormat df;


    public TeamDiagnosticFileWriter(String fileId, String filename) {
        this.fileId = fileId;

        this.filename = filename;
        df = new DecimalFormat("#.####");
    }

    @Override
    public boolean open() {
        try {
            printer = new PrintWriter(this.filename);
        } catch (FileNotFoundException e) {
            return false;
        }
        return true;
    }

    @Override
    public boolean close() {
        printer.close();
        return true;
    }

    @Override
    public boolean pre() {

        StringBuilder sb = new StringBuilder();
        sb.append("chr").append(SEPARATOR);
        sb.append("pos").append(SEPARATOR);
        sb.append("ref").append(SEPARATOR);
        sb.append("alt").append(SEPARATOR);

        sb.append("qual").append(SEPARATOR);
        sb.append("DP").append(SEPARATOR);

        sb.append("id").append(SEPARATOR);
        sb.append("gene").append(SEPARATOR);
        sb.append("ct").append(SEPARATOR);
        sb.append("phylop").append(SEPARATOR);
        sb.append("phastcons").append(SEPARATOR);
        sb.append("sift").append(SEPARATOR);
        sb.append("polyphen").append(SEPARATOR);

        sb.append("MAF 1000G").append(SEPARATOR);
        sb.append("MAF 1000G (Allele)").append(SEPARATOR);
        sb.append("MAF 1000G Phase 3").append(SEPARATOR);
        sb.append("MAF 1000G Phase 3 (Allele)").append(SEPARATOR);

        sb.append("phenotype").append(SEPARATOR);
        sb.append("source").append(SEPARATOR);

//        sb.append("MAF EVS").append(SEPARATOR);
//        sb.append("MAF EVS (Allele)").append(SEPARATOR);

        printer.println(sb.toString());

        return true;
    }

    @Override
    public boolean post() {
        return true;
    }

    @Override
    public boolean write(TeamVariant teamVariant) {

//
        StringBuilder sb = new StringBuilder();

        Variant variant = teamVariant.getVariant();

        sb.append(variant.getChromosome()).append(SEPARATOR);
        sb.append(variant.getStart()).append(SEPARATOR);
        sb.append(variant.getReference()).append(SEPARATOR);
        sb.append(variant.getAlternate()).append(SEPARATOR);


        StudyEntry vse = variant.getStudies().get(0); // aaleman: Check this with 2 or more studies.

        FileEntry currentFile = vse.getFile(this.fileId);
        Map<String, String> attributes = currentFile.getAttributes();


        String qual = attributes.containsKey("QUAL") ? attributes.get("QUAL") : ".";
        sb.append(qual).append(SEPARATOR);

        String dp = ".";
//
//
//        for (Map.Entry<String, Map<String, String>> elem : vse.getSamplesData().entrySet()) {
//
//            Map<String, String> data = elem.getValue();
//
//            dp = data.containsKey("DP") ? data.get("DP") : ".";
//            break;
//        }
//
        sb.append(dp).append(SEPARATOR);


        String id = variant.getAnnotation().getId();
        if (id == null || id.isEmpty()) {
            id = ".";
        }
        sb.append(id).append(SEPARATOR);

        String genes = getGenes(variant.getAnnotation().getConsequenceTypes());
        sb.append(genes).append(SEPARATOR);

        String cts = getConsequenceTypes(variant.getAnnotation().getConsequenceTypes());
        sb.append(cts).append(SEPARATOR);

        String phylop = getConservedRegionScore(variant.getAnnotation().getConservation(), "phylop");
        String phastCons = getConservedRegionScore(variant.getAnnotation().getConservation(), "phastcons");

        sb.append(phylop).append(SEPARATOR);
        sb.append(phastCons).append(SEPARATOR);

        String sift = getProteinSubstitutionScores(variant.getAnnotation().getConsequenceTypes(), "sift");
        String polyphen = getProteinSubstitutionScores(variant.getAnnotation().getConsequenceTypes(), "polyphen");

        sb.append(sift).append(SEPARATOR);
        sb.append(polyphen).append(SEPARATOR);

        Maf maf1000G = getMAF(variant.getAnnotation().getPopulationFrequencies(), "1000GENOMES", "phase_1_ALL");

        if (maf1000G != null) {
            sb.append(df.format(maf1000G.maf)).append(SEPARATOR);
            sb.append(maf1000G.allele).append(SEPARATOR);
        } else {
            sb.append(".").append(SEPARATOR);
            sb.append(".").append(SEPARATOR);
        }

        Maf maf1000GP3 = getMAF(variant.getAnnotation().getPopulationFrequencies(), "1000G_PHASE_3", "1000G_PHASE_3_ALL");

        if (maf1000GP3 != null) {
            sb.append(df.format(maf1000GP3.maf)).append(SEPARATOR);
            sb.append(maf1000GP3.allele).append(SEPARATOR);
        } else {
            sb.append(".").append(SEPARATOR);
            sb.append(".").append(SEPARATOR);
        }

        String phe = teamVariant.getPhenotype() != null ? teamVariant.getPhenotype() : ".";
        String src = teamVariant.getSource() != null ? teamVariant.getSource() : ".";
        sb.append(phe).append(SEPARATOR);
        sb.append(src).append(SEPARATOR);


        printer.println(sb.toString());
        printer.flush();

        return true;
    }

    private Maf getMAF(List<PopulationFrequency> popFreqs, String study, String population) {

        if (popFreqs != null && popFreqs.size() > 0) {
            for (PopulationFrequency pf : popFreqs) {
                if (pf.getStudy().equals(study) && pf.getPopulation().equalsIgnoreCase(population)) {
                    if (pf.getRefAlleleFreq() < pf.getAltAlleleFreq()) {
                        return new Maf(pf.getRefAllele(), pf.getRefAlleleFreq());
                    } else {
                        return new Maf(pf.getAltAllele(), pf.getAltAlleleFreq());
                    }
                }
            }
        }
        return null;
    }

    private String getProteinSubstitutionScores(List<ConsequenceType> consequenceTypes, String source) {

        if (consequenceTypes != null && consequenceTypes.size() > 0) {
            for (ConsequenceType consequenceType : consequenceTypes) {
                if (consequenceType.getProteinVariantAnnotation() != null && consequenceType.getProteinVariantAnnotation().getSubstitutionScores() != null && !consequenceType.getProteinVariantAnnotation().getSubstitutionScores().isEmpty()) {
                    for (Score score : consequenceType.getProteinVariantAnnotation().getSubstitutionScores()) {
                        if (score.getSource().equalsIgnoreCase(source)) {
                            return String.valueOf(df.format(score.getScore()));
                        }
                    }
                }
            }


        }
        return ".";
    }

    private String getConservedRegionScore(List<Score> conservedRegionScores, String source) {
        if (conservedRegionScores != null && conservedRegionScores.size() > 0) {
            for (Score score : conservedRegionScores) {
                if (score.getSource().equalsIgnoreCase(source)) {
                    return String.valueOf(df.format(score.getScore()));
                }
            }
        }
        return ".";
    }

    private String getConsequenceTypes(List<ConsequenceType> consequenceTypes) {
        if (consequenceTypes != null && consequenceTypes.size() > 0) {
            Set<String> cts = new HashSet<>();
            for (ConsequenceType ct : consequenceTypes) {
                for (SequenceOntologyTerm sot : ct.getSequenceOntologyTerms()) {
                    cts.add(sot.getName());
                }
            }
            return Joiner.on(",").join(cts);
        }
        return ".";
    }

    private String getGenes(List<ConsequenceType> consequenceTypes) {
        if (consequenceTypes != null && consequenceTypes.size() > 0) {
            Set<String> genes = new HashSet<>();
            for (ConsequenceType ct : consequenceTypes) {
                if (ct.getGeneName() != null && !ct.getGeneName().isEmpty()) {
                    genes.add(ct.getGeneName());
                }
            }
            return Joiner.on(",").join(genes);
        }
        return ".";
    }

    @Override
    public boolean write(List<TeamVariant> batch) {
        for (TeamVariant record : batch) {
            this.write(record);
        }
        return true;
    }


    private class Maf {
        public String allele;
        public double maf;

        public Maf(String allele, double maf) {
            this.allele = allele;
            this.maf = maf;
        }
    }
}
