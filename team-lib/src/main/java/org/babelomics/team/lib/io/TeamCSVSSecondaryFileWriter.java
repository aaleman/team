package org.babelomics.team.lib.io;

import org.babelomics.team.lib.models.TeamVariant;
import org.opencb.biodata.models.variant.StudyEntry;
import org.opencb.biodata.models.variant.Variant;
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
        sb.append("MAF ESP AA").append(SEPARATOR);
        sb.append("MAF ESP AA (Allele)").append(SEPARATOR);

        sb.append("MAF ESP EA").append(SEPARATOR);
        sb.append("MAF ESP EA (Allele)").append(SEPARATOR);

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

        sb.append(variant.getChromosome()).append(SEPARATOR);
        sb.append(variant.getStart()).append(SEPARATOR);
        sb.append(variant.getReference()).append(SEPARATOR);
        sb.append(variant.getAlternate()).append(SEPARATOR);

        StudyEntry vse = variant.getStudies().get(0); // aaleman: Check this with 2 or more studies.

        Map<String, String> attributes = vse.getSampleData(this.sample.getName());

        String qual = attributes.containsKey("QUAL") ? attributes.get("QUAL") : ".";
        sb.append(qual).append(SEPARATOR);

        String dp = attributes.containsKey("DP") ? attributes.get("DP") : ".";
        sb.append(dp).append(SEPARATOR);


        String id = (!variant.getIds().isEmpty()) ? variant.getIds().get(0) : ".";

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


        Maf mafESPAA = getMAF(variant.getAnnotation().getPopulationFrequencies(), "ESP_6500", "African_American");

        if (mafESPAA != null) {
            sb.append(df.format(mafESPAA.maf)).append(SEPARATOR);
            sb.append(mafESPAA.allele).append(SEPARATOR);
        } else {
            sb.append(".").append(SEPARATOR);
            sb.append(".").append(SEPARATOR);
        }

        Maf mafESPEA = getMAF(variant.getAnnotation().getPopulationFrequencies(), "ESP_6500", "European_American");

        if (mafESPEA != null) {
            sb.append(df.format(mafESPEA.maf)).append(SEPARATOR);
            sb.append(mafESPEA.allele).append(SEPARATOR);
        } else {
            sb.append(".").append(SEPARATOR);
            sb.append(".").append(SEPARATOR);
        }

        String clinvar = teamVariant.getClinvar() != null ? teamVariant.getClinvar() : ".";
        String cosmic = teamVariant.getCosmic() != null ? teamVariant.getCosmic() : ".";
        String gwas = teamVariant.getGwas() != null ? teamVariant.getGwas() : ".";
        sb.append(clinvar).append(SEPARATOR);
        sb.append(cosmic).append(SEPARATOR);
        sb.append(gwas).append(SEPARATOR);


        printer.println(sb.toString());
        printer.flush();

        return true;
    }
}
