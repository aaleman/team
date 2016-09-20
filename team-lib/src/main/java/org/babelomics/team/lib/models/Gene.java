package org.babelomics.team.lib.models;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class Gene {

    public int count;
    public String name;
    public String chr;
    public int start;
    public int end;


    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getChr() {
        if(this.chr == null){
            return null;
        }
        return this.chr.replace("chrom", "").replace("chro", "").replace("chr", "").replace("ch", "");
    }

    public void setChr(String chr) {
        this.chr = chr;
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public int getEnd() {
        return end;
    }

    public void setEnd(int end) {
        this.end = end;
    }

    public Gene() {
    }

    @Override
    public String toString() {
        return "Gene{" +
                "count=" + count +
                ", name='" + name + '\'' +
                ", chr='" + chr + '\'' +
                ", start=" + start +
                ", end=" + end +
                '}';
    }
}
