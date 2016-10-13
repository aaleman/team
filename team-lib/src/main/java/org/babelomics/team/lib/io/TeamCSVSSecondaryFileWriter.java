package org.babelomics.team.lib.io;

import org.babelomics.team.lib.models.TeamVariant;
import org.opencb.biodata.models.variant.StudyEntry;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.models.variant.avro.PopulationFrequency;
import org.opencb.opencga.catalog.models.Sample;

import java.util.Map;

/**
 * @author Alejandro Alemán Ramos <alejandro.aleman.ramos@gmail.com>
 */
public class TeamCSVSSecondaryFileWriter extends TeamCSVDiagnosticFileWriter {
    public TeamCSVSSecondaryFileWriter(Sample sample, String filename) {
        super(sample, filename);
    }

    @Override
    public boolean pre() {

        StringBuilder sb = new StringBuilder();
        sb.append("chr").append(SEPARATOR);
        sb.append("pos").append(SEPARATOR);
        sb.append("ref").append(SEPARATOR);
        sb.append("alt").append(SEPARATOR);
        sb.append("gt").append(SEPARATOR);

        sb.append("qual").append(SEPARATOR);
        sb.append("DP").append(SEPARATOR);

        sb.append("id").append(SEPARATOR);
        sb.append("gene").append(SEPARATOR);
        sb.append("ct").append(SEPARATOR);
        sb.append("phylop").append(SEPARATOR);
        sb.append("phastcons").append(SEPARATOR);
        sb.append("grep").append(SEPARATOR);
        sb.append("sift").append(SEPARATOR);
        sb.append("polyphen").append(SEPARATOR);
        sb.append("CADD").append(SEPARATOR);


        sb.append("MAF 1000G").append(SEPARATOR);
        sb.append("MAF 1000G (Allele)").append(SEPARATOR);
        sb.append("MAF 1000G Phase 3").append(SEPARATOR);
        sb.append("MAF 1000G Phase 3 (Allele)").append(SEPARATOR);
        sb.append("MAF ESP").append(SEPARATOR);
        sb.append("MAF ESP (Allele)").append(SEPARATOR);
        sb.append("MAF SPANISH").append(SEPARATOR);
        sb.append("MAF SPANISH (Allele)").append(SEPARATOR);
        sb.append("MAF EXAC").append(SEPARATOR);
        sb.append("MAF EXAC (Allele)").append(SEPARATOR);

        sb.append("Clinvar").append(SEPARATOR);
        sb.append("Cosmic").append(SEPARATOR);
        sb.append("GWAS").append(SEPARATOR);


        printer.println(sb.toString());

        return true;
    }

    @Override
    public boolean write(TeamVariant teamVariant) {

//
        StringBuilder sb = new StringBuilder();

        Variant variant = teamVariant.getVariant();
//        System.out.println(variant);

        sb.append(variant.getChromosome()).append(SEPARATOR);
        sb.append(variant.getStart()).append(SEPARATOR);
        sb.append(variant.getReference()).append(SEPARATOR);
        sb.append(variant.getAlternate()).append(SEPARATOR);
        sb.append(teamVariant.getGenotype()).append(SEPARATOR);

        StudyEntry vse = variant.getStudies().get(0); // aaleman: Check this with 2 or more studies.

        String fileId = vse.getFiles().get(0).getFileId();


        String qualKey = fileId + "_QUAL";
        String dpKey = fileId + "_DP";

        String qual = vse.getAllAttributes().containsKey(qualKey) ? vse.getAllAttributes().get(qualKey) : ".";

        sb.append(qual).append(SEPARATOR);

        String dp = ".";

        if (vse.getSampleData(this.sample.getName()).containsKey("DP")) {
            dp = vse.getSampleData(this.sample.getName()).get("DP");
        } else if (vse.getAllAttributes().containsKey(dpKey)) {
            dp = vse.getAllAttributes().get(dpKey);
        }

        sb.append(dp).append(SEPARATOR);

        String id = (!variant.getIds().isEmpty()) ? variant.getIds().get(0) : ".";

        sb.append(id).append(SEPARATOR);

        String genes = getGenes(variant.getAnnotation().getConsequenceTypes());
        sb.append(genes).append(SEPARATOR);

        String cts = getConsequenceTypes(variant.getAnnotation().getConsequenceTypes());
        sb.append(cts).append(SEPARATOR);

        String phylop = getConservedRegionScore(variant.getAnnotation().getConservation(), "phylop");
        String phastCons = getConservedRegionScore(variant.getAnnotation().getConservation(), "phastcons");
        String grep = getConservedRegionScore(variant.getAnnotation().getConservation(), "grep");

        sb.append(phylop).append(SEPARATOR);
        sb.append(phastCons).append(SEPARATOR);
        sb.append(grep).append(SEPARATOR);

        String sift = getProteinSubstitutionScores(variant.getAnnotation().getConsequenceTypes(), "sift");
        String polyphen = getProteinSubstitutionScores(variant.getAnnotation().getConsequenceTypes(), "polyphen");

        sb.append(sift).append(SEPARATOR);
        sb.append(polyphen).append(SEPARATOR);


        String cadd = getConservedRegionScore(variant.getAnnotation().getFunctionalScore(), "cadd_raw");
        sb.append(cadd).append(SEPARATOR);

        Maf maf1000G = getMAF(variant.getAnnotation().getPopulationFrequencies(), "1000GENOMES_phase_1", "ALL");

        if (maf1000G != null) {
            sb.append(df.format(maf1000G.maf)).append(SEPARATOR);
            sb.append(maf1000G.allele).append(SEPARATOR);
        } else {
            sb.append(".").append(SEPARATOR);
            sb.append(".").append(SEPARATOR);
        }

        Maf maf1000GP3 = getMAF(variant.getAnnotation().getPopulationFrequencies(), "1000GENOMES_phase_3", "ALL");

        if (maf1000GP3 != null) {
            sb.append(df.format(maf1000GP3.maf)).append(SEPARATOR);
            sb.append(maf1000GP3.allele).append(SEPARATOR);
        } else {
            sb.append(".").append(SEPARATOR);
            sb.append(".").append(SEPARATOR);
        }

        Maf mafESPALL = getMAF(variant.getAnnotation().getPopulationFrequencies(), "ESP_6500", "ALL");

        if (mafESPALL != null) {
            sb.append(df.format(mafESPALL.maf)).append(SEPARATOR);
            sb.append(mafESPALL.allele).append(SEPARATOR);
        } else {
            sb.append(".").append(SEPARATOR);
            sb.append(".").append(SEPARATOR);
        }

        Maf spanishMaf = getSpanishMAF(variant.getChromosome(), variant.getStart(), variant.getReference(), variant.getAlternate());
        if (spanishMaf != null) {
            sb.append(df.format(spanishMaf.maf)).append(SEPARATOR);
            sb.append(spanishMaf.allele).append(SEPARATOR);
        } else {
            sb.append(".").append(SEPARATOR);
            sb.append(".").append(SEPARATOR);
        }

        Maf mafEXACALL = getMAF(variant.getAnnotation().getPopulationFrequencies(), "EXAC", "ALL");
        if (mafEXACALL != null) {
            sb.append(df.format(mafEXACALL.maf)).append(SEPARATOR);
            sb.append(mafEXACALL.allele).append(SEPARATOR);
        } else {
            sb.append(".").append(SEPARATOR);
            sb.append(".").append(SEPARATOR);
        }


        String clinvar = teamVariant.getClinvar() != null && !teamVariant.getClinvar().isEmpty() ? teamVariant.getClinvar() : ".";
        String cosmic = teamVariant.getCosmic() != null && !teamVariant.getCosmic().isEmpty() ? teamVariant.getCosmic() : ".";
        String gwas = teamVariant.getGwas() != null && !teamVariant.getGwas().isEmpty() ? teamVariant.getGwas() : ".";

        sb.append(clinvar).append(SEPARATOR);
        sb.append(cosmic).append(SEPARATOR);
        sb.append(gwas).append(SEPARATOR);


        printer.println(sb.toString());
        printer.flush();

        return true;
    }
}
