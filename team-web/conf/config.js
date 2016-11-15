// CELLBASE_HOST = "http://bioinfo.hpc.cam.ac.uk/cellbase";
CELLBASE_HOST ="http://ws.babelomics.org/cellbase";
CELLBASE_VERSION = "v4";

// OPENCGA_HOST = "http://test.babelomics.org/opencga-0.7-new";
OPENCGA_HOST = "http://test.babelomics.org/opencga-0.7-dev";

CONTACT_MAIL = 'bioinfo.notifications@cipf.es';

VCF_VALIDATOR = true;

CONSEQUENCE_TYPES = [{
    "name": "transcript_ablation",
    "text": "Transcript ablation",
    "value": 1893,
    "description": "A feature ablation whereby the deleted region includes a transcript feature",
    "impact":"high"
}, {
    "name": "splice_acceptor_variant",
    "text": "Splice acceptor variant",
    "value": 1574,
    "description": "A splice variant that changes the 2 base region at the 3' end of an intron",
    "impact":"high"
}, {
    "name": "splice_donor_variant",
    "text": "Splice donor variant",
    "value": 1575,
    "description": "A splice variant that changes the 2 base region at the 5' end of an intron",
    "impact":"high"
}, {
    "name": "stop_gained",
    "text": "Stop gained",
    "value": 1587,
    "description": "A sequence variant whereby at least one base of a codon is changed, resulting in a premature stop codon, leading to a shortened transcrip",
    "impact":"high"
}, {
    "name": "frameshift_variant",
    "text": "Frameshift variant",
    "value": 1589,
    "description": "A sequence variant which causes a disruption of the translational reading frame, because the number of nucleotides inserted or deleted is not a multiple of three",
    "impact":"high"
}, {
    "name": "stop_lost",
    "text": "Stop lost",
    "value": 1578,
    "description": "A sequence variant where at least one base of the terminator codon (stop) is changed, resulting in an elongated transcript",
    "impact":"high"
}, {
    "name": "start_lost",
    "text": "Start lost",
    "value": 2012,
    "description": "A codon variant that changes at least one base of the canonical start codo",
    "impact":"high"
}, {
    "name": "transcript_amplification",
    "text": "Transcript amplification",
    "value": 1889,
    "description": "A feature amplification of a region containing a transcript",
    "impact":"high"
}, {
    "name": "inframe_insertion",
    "text": "Inframe insertion",
    "value": 1821,
    "description": "An inframe non synonymous variant that inserts bases into in the coding sequenc",
    "impact":"moderate"
}, {
    "name": "inframe_deletion",
    "text": "Inframe deletion",
    "value": 1822,
    "description": "An inframe non synonymous variant that deletes bases from the coding sequenc",
    "impact":"moderate"
}, {
    "name": "missense_variant",
    "text": "Missense variant",
    "value": 1583,
    "description": "A sequence variant, that changes one or more bases, resulting in a different amino acid sequence but where the length is preserved",
    "impact":"moderate"
}, {
    "name": "protein_altering_variant",
    "text": "Protein altering variant",
    "value": 1818,
    "description": "A sequence_variant which is predicted to change the protein encoded in the coding sequence",
    "impact":"moderate"
}, {
    "name": "splice_region_variant",
    "text": "Splice region variant",
    "value": 1630,
    "description": "A sequence variant in which a change has occurred within the region of the splice site, either within 1-3 bases of the exon or 3-8 bases of the intron",
    "impact":"low"
}, {
    "name": "incomplete_terminal_codon_variant",
    "text": "Incomplete terminal codon variant",
    "value": 1626,
    "description": "A sequence variant where at least one base of the final codon of an incompletely annotated transcript is changed",
    "impact":"low"
}, {
    "name": "stop_retained_variant",
    "text": "Stop retained variant",
    "value": 1567,
    "description": "A sequence variant where at least one base in the terminator codon is changed, but the terminator remains",
    "impact":"low"
}, {
    "name": "synonymous_variant",
    "text": "Synonymous variant",
    "value": 1819,
    "description": "A sequence variant where there is no resulting change to the encoded amino acid",
    "impact":"low"
}, {
    "name": "coding_sequence_variant",
    "text": "Coding sequence variant",
    "value": 1580,
    "description": "A sequence variant that changes the coding sequence",
    "impact":"modifier"
}, {
    "name": "mature_miRNA_variant",
    "text": "Mature miRNA variant",
    "value": 1620,
    "description": "A transcript variant located with the sequence of the mature miRNA",
    "impact":"modifier"
}, {
    "name": "5_prime_UTR variant",
    "text": "5 prime UTR variant",
    "value": 1623,
    "description": "A UTR variant of the 5' UTR",
    "impact":"modifier"
}, {
    "name": "3_prime_UTR variant",
    "text": "3 prime UTR variant",
    "value": 1624,
    "description": "A UTR variant of the 3' UTR",
    "impact":"modifier"
}, {
    "name": "non_coding_transcript_exon_variant",
    "text": "Non coding transcript exon variant",
    "value": 1792,
    "description": "A sequence variant that changes non-coding exon sequence in a non-coding transcript",
    "impact":"modifier"
}, {
    "name": "intron_variant",
    "text": "Intron variant",
    "value": 1627,
    "description": "A transcript variant occurring within an intron",
    "impact":"modifier"
}, {
    "name": "NMD_transcript_variant",
    "text": "NMD transcript variant",
    "value": 1621,
    "description": "A variant in a transcript that is the target of NMD",
    "impact":"modifier"
}, {
    "name": "non_coding_transcript variant",
    "text": "Non coding transcript variant",
    "value": 1619,
    "description": "A transcript variant of a non coding RNA gene",
    "impact":"modifier"
}, {
    "name": "upstream_gene_variant",
    "text": "Upstream gene variant",
    "value": 1631,
    "description": "A sequence variant located 5' of a gene",
    "impact":"modifier"
}, {
    "name": "downstream_gene_variant",
    "text": "Downstream gene variant",
    "value": 1632,
    "description": "A sequence variant located 3' of a gene",
    "impact":"modifier"
}, {
    "name": "TFBS_ablation",
    "text": "TFBS ablation",
    "value": 1895,
    "description": "A feature ablation whereby the deleted region includes a transcription factor binding site",
    "impact":"modifier"
}, {
    "name": "TFBS_amplification",
    "text": "TFBS amplification",
    "value": 1892,
    "description": "A feature amplification of a region containing a transcription factor binding site",
    "impact":"modifier"
}, {
    "name": "TF_binding_site variant",
    "text": "TF binding site variant",
    "value": 1782,
    "description": "A sequence variant located within a transcription factor binding site",
    "impact":"modifier"
}, {
    "name": "regulatory_region_ablation",
    "text": "Regulatory region ablation",
    "value": 1894,
    "description": "A feature ablation whereby the deleted region includes a regulatory region",
    "impact":"moderate"
}, {
    "name": "regulatory_region_amplification",
    "text": "Regulatory region amplification",
    "value": 1891,
    "description": "A feature amplification of a region containing a regulatory region",
    "impact":"modifier"
}, {
    "name": "feature_elongation",
    "text": "Feature elongation",
    "value": 1907,
    "description": "A sequence variant located within a regulatory region",
    "impact":"modifier"
}, {
    "name": "regulatory_region_variant",
    "text": "Regulatory region variant",
    "value": 1566,
    "description": "A sequence variant located within a regulatory region",
    "impact":"modifier"
}, {
    "name": "feature_truncation",
    "text": "Feature truncation",
    "value": 1906,
    "description": "A sequence variant that causes the reduction of a genomic feature, with regard to the reference sequence",
    "impact":"modifier"
}, {
    "name": "intergenic_variant",
    "text": "Intergenic variant",
    "value": 1628,
    "description": "A sequence variant located in the intergenic region, between genes",
    "impact":"modifier"
}, {
    "name": "initiator_codon_variant",
    "text": "Initiator codon variant",
    "value": 1582,
    "description": "A codon variant that changes at least one base of the first codon of a transcript",
    "impact":"modifier"
}, {
    "name": "incomplete_terminal_codon variant",
    "text": "Incomplete terminal codon variant",
    "value": 1626,
    "description": "A sequence variant where at least one base of the final codon of an incompletely annotated transcript is changed",
    "impact":"modifier"
}, {
    "name": "miRNA",
    "text": "MiRNA",
    "value": 276,
    "description": "Small, ~22-nt, RNA molecule that is the endogenous transcript of a miRNA gene (or the product of modifier non coding RNA genes. Micro RNAs are produced from precursor molecules (SO:0000647) that can form local hairpin structures, which ordinarily are processed (usually via the Dicer pathway) such that a single miRNA molecule accumulates from one arm of a hairpin precursor molecule. Micro RNAs may trigger the cleavage of their target molecules or act as translational repressors",
    "impact":"modifier"
}, {
    "name": "miRNA_target_site",
    "text": "MiRNA target site",
    "value": 934,
    "description": "A miRNA target site is a binding site where the molecule is a micro RNA",
    "impact":"modifier"
}, {
    "name": "exon_variant",
    "text": "Exon variant",
    "value": 1791,
    "description": "A miRNA target site is a binding site where the molecule is a micro RNA",
    "impact":"modifier"
}, {
    "name": "lincRNA",
    "text": "LincRNA",
    "value": 1463,
    "description": "A multiexonic non-coding RNA transcribed by RNA polymerase II",
    "impact":"modifier"
}, {
    "name": "5KB_downstream_variant",
    "text": "5KB downstream variant",
    "value": 1633,
    "description": "A sequence variant located within 5 KB of the end of a gene",
    "impact":"modifier"
}, {
    "name": "5KB_upstream_variant",
    "text": "5KB upstream variant",
    "value": 1635,
    "description": "A sequence variant located within 5KB 5' of a gene",
    "impact":"modifier"
}, {
    "name": "SNV",
    "text": "SNV",
    "value": 1483,
    "description": "SNVs are single nucleotide positions in genomic DNA at which different sequence alternatives exist",
    "impact":"modifier"
}, {
    "name": "SNP",
    "text": "SNP",
    "value": 694,
    "description": "SNPs are single base pair positions in genomic DNA at which different sequence alternatives exist in normal individuals in some population(s), wherein the least frequent variant has an abundance of 1% or greater",
    "impact":"modifier"
}, {
    "name": "RNA_polymerase_promoter",
    "text": "RNA polymerase promoter",
    "value": 1203,
    "description": "A region (DNA) to which RNA polymerase binds, to begin transcription",
    "impact":"modifier"
}, {
    "name": "CpG_island",
    "text": "CpG island",
    "value": 307,
    "description": "Regions of a few hundred to a few thousand bases in vertebrate genomes that are relatively GC and CpG rich; they are typically unmethylated and often found near the 5' ends of genes",
    "impact":"modifier"
}, {
    "name": "DNAseI_hypersensitive_site",
    "text": "DNAseI hypersensitive site",
    "value": 685,
    "description": "",
    "impact":"modifier"
}, {
    "name": "polypeptide_variation_site",
    "text": "Polypeptide variation site",
    "value": 336,
    "description": "A sequence that closely resembles a known functional gene, at anmodifier locus within a genome, that is non-functional as a consequence of (usually several) mutations that prevent either its transcription or translation (or both). In general, pseudogenes result from either reverse transcription of a transcript of their 'normal' paralog (SO:0000043) (in which case the pseudogene typically lacks introns and includes a poly(A) tail) or from recombination (SO:0000044) (in which case the pseudogene is typically a tandem duplication of its 'normal' paralog)",
    "impact":"modifier"
}];
