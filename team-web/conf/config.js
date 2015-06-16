CELLBASE_HOST = "http://www.ebi.ac.uk/cellbase/webservices/rest"
CELLBASE_HOST = "http://bioinfo.hpc.cam.ac.uk/cellbase/webservices/rest";
CELLBASE_VERSION = "v3";

OPENCGA_HOST = "http://test.babelomics.org/opencga";
//OPENCGA_HOST = "http://bioinfoint.hpc.cam.ac.uk/opencga/rest";

var POPULAR_SPECIES = ["Homo sapiens", "Mus musculus", "Danio rerio", "Drosophila melanogaster", "Saccharomyces cerevisiae", "Plasmodium falciparum", "Arabidopsis thaliana", "Citrus Clementina"];

var AVAILABLE_SPECIES = {
    "text": "Species",
    "items": [
        {
            "text": "Vertebrates",
            "items": [
                {
                    "text": "Bos taurus",
                    "assembly": "UMD3.1",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "X", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Canis familiaris",
                    "assembly": "CanFam3.1",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "X", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Ciona intestinalis",
                    "assembly": "KH",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Danio rerio",
                    "assembly": "Zv9",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "X", "Y", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Equus caballus",
                    "assembly": "EquCab2",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "X", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Felis catus",
                    "assembly": "Felis_catus_6.2",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4", "E1", "E2", "E3", "F1", "F2", "X", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Gallus gallus",
                    "assembly": "Galgal4",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "32", "W", "Z", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Gorilla gorilla",
                    "assembly": "gorGor3.1",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2a", "2b", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Homo sapiens",
                    "assembly": "GRCh37.p10",
                    "region": {"chromosome": "13", "start": 32889611, "end": 32973805},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                //                {"text": "Homo sapiens", "assembly": "GRCh37.p10", "region": {"chromosome": "13", "start": 32889599, "end": 32889739}, "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT"], "url": "ftp://ftp.ensembl.org/pub/release-71/"},
                //                {"text": "Homo sapiens", "assembly": "GRCh37.p10", "region": {"chromosome": "20", "start": 32878277, "end": 32878277}, "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT"], "url": "ftp://ftp.ensembl.org/pub/release-71/"},
                //                {"text": "Homo sapiens", "assembly": "GRCh37.p10", "region": {"chromosome": "1", "start": 32877109, "end": 32882337}, "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT"], "url": "ftp://ftp.ensembl.org/pub/release-71/"},
                {
                    "text": "Macaca mulatta",
                    "assembly": "MMUL_1.0",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "X", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Mus musculus",
                    "assembly": "GRCm38.p1",
                    "region": {"chromosome": "1", "start": 18422009, "end": 18422009},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "X", "Y", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Oryctolagus cuniculus",
                    "assembly": "oryCun2",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "X", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Pan troglodytes",
                    "assembly": "CHIMP2.1.4",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2A", "2B", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Pongo abelii",
                    "assembly": "PPYG2",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2a", "2b", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Un", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Rattus norvegicus",
                    "assembly": "Rnor_5.0",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "X", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                },
                {
                    "text": "Sus scrofa",
                    "assembly": "Sscrofa10.2",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "X", "Y", "MT"],
                    "url": "ftp://ftp.ensembl.org/pub/release-71/"
                }
            ]
        },
        {
            "text": "Metazoa",
            "items": [
                {
                    "text": "Anopheles gambiae",
                    "assembly": "AgamP3",
                    "region": {"chromosome": "2L", "start": 1000000, "end": 1000000},
                    "chromosomes": ["2L", "2R", "3L", "3R", "X"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/metazoa/release-18/"
                },
                {
                    "text": "Caenorhabditis elegans",
                    "assembly": "WBcel235",
                    "region": {"chromosome": "I", "start": 1000000, "end": 1000000},
                    "chromosomes": ["I", "II", "III", "IV", "V", "X", "MtDNA"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/metazoa/release-18/fasta/"
                },
                {
                    "text": "Drosophila melanogaster",
                    "assembly": "BDGP5",
                    "region": {"chromosome": "2L", "start": 1000000, "end": 1000000},
                    "chromosomes": ["2L", "2LHet", "2R", "2RHet", "3L", "3LHet", "3R", "3RHet", "4", "U", "Uextra", "X", "XHet", "YHet", "dmel_mitochondrion_genome"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/metazoa/release-18/"
                },
                {
                    "text": "Drosophila simulans",
                    "assembly": "WUGSC1",
                    "region": {"chromosome": "2L", "start": 1000000, "end": 1000000},
                    "chromosomes": ["2L", "2R", "3L", "3R", "4", "X"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/metazoa/release-18/"
                },
                {
                    "text": "Drosophila yakuba",
                    "assembly": "dyak_r1.3",
                    "region": {"chromosome": "2L", "start": 1000000, "end": 1000000},
                    "chromosomes": ["2L", "2R", "3L", "3R", "4", "chr2h", "chr3h", "chrXh", "chrYh", "X"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/metazoa/release-18/"
                }
            ]
        },
        {
            "text": "Fungi",
            "items": [
                {
                    "text": "Aspergillus fumigatus",
                    "assembly": "CADRE",
                    "region": {"chromosome": "I", "start": 1000000, "end": 1000000},
                    "chromosomes": ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "MT"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/fungi/release-18/"
                },
                {
                    "text": "Aspergillus nidulans",
                    "assembly": "ASM1142v1",
                    "region": {"chromosome": "I", "start": 1000000, "end": 1000000},
                    "chromosomes": ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/fungi/release-18/"
                },
                {
                    "text": "Aspergillus niger",
                    "assembly": "CADRE",
                    "region": {"chromosome": "I", "start": 1000000, "end": 1000000},
                    "chromosomes": ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/fungi/release-18/"
                },
                {
                    "text": "Aspergillus oryzae",
                    "assembly": "CADRE2",
                    "region": {"chromosome": "I", "start": 1000000, "end": 1000000},
                    "chromosomes": ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/fungi/release-18/"
                },
                {
                    "text": "Saccharomyces cerevisiae",
                    "assembly": "SacCer_Apr2011",
                    "region": {"chromosome": "I", "start": 1000000, "end": 1000000},
                    "chromosomes": ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "Mito"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/fungi/release-18/"
                },
                {
                    "text": "Schizosaccharomyces pombe",
                    "assembly": "ASM294v1",
                    "region": {"chromosome": "I", "start": 1000000, "end": 1000000},
                    "chromosomes": ["AB325691", "I", "II", "III", "MT", "MTR"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/fungi/release-18/"
                }
            ]
        },
        {
            "text": "Protist",
            "items": [
                {
                    "text": "Leishmania major",
                    "assembly": "ASM272v2",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/protists/release-18/"
                },
                {
                    "text": "Plasmodium falciparum",
                    "assembly": "ASM276v1",
                    "region": {"chromosome": "01", "start": 1000000, "end": 1000000},
                    "chromosomes": ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/protists/release-18/"
                }
            ]
        },
        {
            "text": "Plants",
            "items": [
                {
                    "text": "Arabidopsis lyrata",
                    "assembly": "v.1.0",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/plants/release-18/"
                },
                {
                    "text": "Arabidopsis thaliana",
                    "assembly": "TAIR10",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "Mt", "Pt"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/plants/release-18/"
                },
                {
                    "text": "Brachypodium distachyon",
                    "assembly": "v1.0",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/plants/release-18/"
                },
                {
                    "text": "Glycine max",
                    "assembly": "V1.0",
                    "region": {"chromosome": "Gm01", "start": 1000000, "end": 1000000},
                    "chromosomes": ["Gm01", "Gm02", "Gm03", "Gm04", "Gm05", "Gm06", "Gm07", "Gm08", "Gm09", "Gm10", "Gm11", "Gm12", "Gm13", "Gm14", "Gm15", "Gm16", "Gm17", "Gm18", "Gm19", "Gm20"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/plants/release-18/"
                },
                {
                    "text": "Oryza sativa",
                    "assembly": "MSU6",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Mt", "Pt", "Sy", "Un"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/plants/release-18/"
                },
                {
                    "text": "Vitis vinifera",
                    "assembly": "IGGP_12x",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "Un"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/plants/release-18/"
                },
                {
                    "text": "Zea mays",
                    "assembly": "AGPv3",
                    "region": {"chromosome": "1", "start": 1000000, "end": 1000000},
                    "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Mt", "Pt"],
                    "url": "ftp://ftp.ensemblgenomes.org/pub/plants/release-18/"
                }
                //                  {"text": "Citrus Clementina", "assembly": "1.0", "region":{"chromosome":"scaffold_1","start":233423,"end":236969},   "chromosomes": [], "url": ""}
            ]
        }
    ]
};


/** Reference to a species from the list to be shown at start **/
var DEFAULT_SPECIES = AVAILABLE_SPECIES.items[0].items[8];
CONSEQUENCE_TYPES = [
    {name: "transcript ablation", text: "Transcript ablation", value: 1893},
    {name: "splice donor variant", text: "Splice donor variant", value: 1575},
    {name: "splice acceptor variant", text: "Splice acceptor variant", value: 1574},
    {name: "stop gained", text: "Stop gained", value: 1587},
    {name: "frameshift variant", text: "Frameshift variant", value: 1589},
    {name: "stop lost", text: "Stop lost", value: 1578},
    {name: "initiator codon variant", text: "Initiator codon variant", value: 1582},
    {name: "inframe insertion", text: "Inframe insertion", value: 1821},
    {name: "inframe deletion", text: "Inframe deletion", value: 1822},
    {name: "missense variant", text: "Missense variant", value: 1583},
    {name: "transcript amplification", text: "Transcript amplification", value: 1889},
    {name: "splice region variant", text: "Splice region variant", value: 1630},
    {name: "incomplete terminal codon variant", text: "Incomplete terminal codon variant", value: 1626},
    {name: "synonymous variant", text: "Synonymous variant", value: 1819},
    {name: "stop retained variant", text: "Stop retained variant", value: 1567},
    {name: "coding sequence variant", text: "Coding sequence variant", value: 1580},
    {name: "miRNA", text: "MiRNA", value: 276},
    {name: "miRNA target site", text: "MiRNA target site", value: 934},
    {name: "mature miRNA variant", text: "Mature miRNA variant", value: 1620},
    {name: "5 prime UTR variant", text: "5 prime UTR variant", value: 1623},
    {name: "3 prime UTR variant", text: "3 prime UTR variant", value: 1624},
    {name: "exon variant", text: "Exon variant", value: 1791},
    {name: "non coding exon variant", text: "Non coding exon variant", value: 1792},
    {name: "non coding transcript variant", text: "Non coding transcript variant", value: 1619},
    {name: "intron variant", text: "Intron variant", value: 1627},
    {name: "NMD transcript variant", text: "NMD transcript variant", value: 1621},
    {name: "upstream gene variant", text: "Upstream gene variant", value: 1631},
    {name: "downstream gene variant", text: "Downstream gene variant", value: 1632},
    {name: "TFBS ablation", text: "TFBS ablation", value: 1895},
    {name: "TFBS amplification", text: "TFBS amplification", value: 1892},
    {name: "TF binding site variant", text: "TF binding site variant", value: 1782},
    {name: "regulatory region variant", text: "Regulatory region variant", value: 1566},
    {name: "regulatory region ablation", text: "Regulatory region ablation", value: 1894},
    {name: "regulatory region amplification", text: "Regulatory region amplification", value: 1891},
    {name: "feature elongation", text: "Feature elongation", value: 1907},
    {name: "feature truncation", text: "Feature truncation", value: 1906},
    {name: "intergenic variant", text: "Intergenic variant", value: 1628},
    {name: "lincRNA", text: "LincRNA", value: 1463},
    {name: "5KB downstream variant", text: "5KB downstream variant", value: 1633},
    {name: "5KB upstream variant", text: "5KB upstream variant", value: 1635},
    {name: "SNV", text: "SNV", value: 1483},
    {name: "SNP", text: "SNP", value: 694},
    {name: "RNA polymerase promoter", text: "RNA polymerase promoter", value: 1203},
    {name: "CpG island", text: "CpG island", value: 307},
    {name: "DNAseI hypersensitive site", text: "DNAseI hypersensitive site", value: 685},
    {name: "polypeptide variation site", text: "Polypeptide variation site", value: 336}
];