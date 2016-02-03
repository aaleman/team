package org.babelomics.team.lib.io;

import org.opencb.biodata.formats.variant.io.VariantWriter;
import org.opencb.biodata.models.variant.Variant;

import java.util.List;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamVariantStdoutWriter implements VariantWriter {
    @Override
    public void includeStats(boolean stats) {

    }

    @Override
    public void includeSamples(boolean samples) {

    }

    @Override
    public void includeEffect(boolean effect) {

    }

    @Override
    public boolean open() {
        return false;
    }

    @Override
    public boolean close() {
        return false;
    }

    @Override
    public boolean pre() {
        return false;
    }

    @Override
    public boolean post() {
        return false;
    }

    @Override
    public boolean write(Variant variant) {
        System.out.println("variant = " + variant);
        return true;
    }

    @Override
    public boolean write(List<Variant> list) {
        for (Variant v : list) {
            this.write(v);
        }
        return true;
    }
}
