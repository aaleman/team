package org.babelomics.team.lib;

import org.apache.commons.lang.StringUtils;
import org.babelomics.team.lib.models.Gene;
import org.babelomics.team.lib.models.Panel;
import org.babelomics.team.lib.models.TeamVariant;
import org.opencb.biodata.models.feature.Region;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.models.variant.annotation.VariantAnnotation;
import org.opencb.biodata.models.variation.GenomicVariant;
import org.opencb.cellbase.core.client.CellBaseClient;
import org.opencb.datastore.core.QueryOptions;
import org.opencb.datastore.core.QueryResponse;
import org.opencb.datastore.core.QueryResult;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamVariantAnnotator {

    private CellBaseClient cellBaseClient;


    public TeamVariantAnnotator() throws URISyntaxException {

        URI cellbaseUri = new URI("http://bioinfo.hpc.cam.ac.uk/cellbase/webservices/rest");
        this.cellBaseClient = new CellBaseClient(cellbaseUri, "v3", "hsapiens");
    }

    public List<TeamVariant> annotate(List<Variant> variantList) {

        List<GenomicVariant> batch = convertVariantsToGenomicVariants(variantList);

        List<TeamVariant> res = new ArrayList<>();

        if (batch.isEmpty()) {
            return res;
        }


        QueryResponse<QueryResult<VariantAnnotation>> response;

        VariantAnnotation va = new VariantAnnotation();
        try {

            response = cellBaseClient.getFullAnnotation(CellBaseClient.Category.genomic,
                    CellBaseClient.SubCategory.variant, batch, new QueryOptions("post", true));
            if (response != null) {
                List<QueryResult<VariantAnnotation>> qr = response.getResponse();
                if (!qr.isEmpty()) {
                    QueryResult<VariantAnnotation> variantAnnotationQueryResult = qr.get(0);
                    if (!variantAnnotationQueryResult.getResult().isEmpty()) {
                        va = variantAnnotationQueryResult.getResult().get(0);
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (!variantList.isEmpty()) {
            Variant v = variantList.get(0);
            v.setAnnotation(va);

            TeamVariant tv = new TeamVariant(v);

            res.add(tv);
        }
        return res;
    }


    private List<Region> getRegionsFromPanel(Panel p) {

        List<Region> list = new ArrayList<>();

        for (Gene g : p.getGenes()) {

            if (g.getChr() != null && !g.getChr().isEmpty()) {
                list.add(new Region(g.getChr(), g.getStart(), g.getEnd()));
            }
        }

        return list;
    }


    private List<GenomicVariant> convertVariantsToGenomicVariants(List<Variant> vcfBatch) {
        List<GenomicVariant> genomicVariants = new ArrayList<>(vcfBatch.size());
        for (Variant variant : vcfBatch) {
            GenomicVariant genomicVariant;
            if ((genomicVariant = getGenomicVariant(variant)) != null) {
                genomicVariants.add(genomicVariant);
            }
        }
        return genomicVariants;
    }

    // TODO: use a external class for this (this method could be added to GenomicVariant class)
    private GenomicVariant getGenomicVariant(Variant variant) {
        if (variant.getAlternate().equals(".")) {  // reference positions are not variants
            return null;
        } else {
            String ref;
            if (variant.getAlternate().equals("<DEL>")) {  // large deletion
                int end = Integer.valueOf(variant.getSourceEntries().get("_").getAttributes().get("END"));  // .get("_") because studyId and fileId are empty strings when VariantSource is initialized at readInputFile
                ref = StringUtils.repeat("N", end - variant.getStart());
            } else {
                ref = variant.getReference().equals("") ? "-" : variant.getReference();
            }
            return new GenomicVariant(variant.getChromosome(), variant.getStart(),
                    ref, variant.getAlternate().equals("") ? "-" : variant.getAlternate());
            //        return new GenomicVariant(variant.getChromosome(), ensemblPos, ref, alt);
        }
    }
}
