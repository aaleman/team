package org.babelomics.team.lib.models;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class Mutation {
    public String chr;
    public int pos;
    public String ref;
    public String alt;
    public String phe;
    public String src;

    public Mutation() {
    }

    public String getChr() {
        return chr;
    }

    public void setChr(String chr) {
        this.chr = chr;
    }

    public int getPos() {
        return pos;
    }

    public void setPos(int pos) {
        this.pos = pos;
    }

    public String getRef() {
        return ref;
    }

    public void setRef(String ref) {
        this.ref = ref;
    }

    public String getAlt() {
        return alt;
    }

    public void setAlt(String alt) {
        this.alt = alt;
    }

    public String getPhe() {
        return phe;
    }

    public void setPhe(String phe) {
        this.phe = phe;
    }

    @Override
    public String toString() {
        return "Mutation{" +
                "chr='" + chr + '\'' +
                ", pos=" + pos +
                ", ref='" + ref + '\'' +
                ", alt='" + alt + '\'' +
                ", phe='" + phe + '\'' +
                '}';
    }

    public String getSrc() {
        return "TODO"; // TODO
//        return src;
    }

    public void setSrc(String src) {
        this.src = src;
    }
}
