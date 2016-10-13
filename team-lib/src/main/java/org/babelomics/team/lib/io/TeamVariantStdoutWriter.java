package org.babelomics.team.lib.io;

import org.babelomics.team.lib.models.TeamVariant;
import org.opencb.biodata.formats.variant.io.VariantWriter;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.commons.io.DataWriter;

import java.util.List;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamVariantStdoutWriter implements DataWriter<TeamVariant> {


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
    public boolean write(TeamVariant variant) {
        System.out.println("Team Variant = " + variant);
        return true;
    }

    @Override
    public boolean write(List<TeamVariant> list) {
        for (TeamVariant v : list) {
            this.write(v);
        }
        return true;
    }
}
