package org.babelomics.team.lib.io;

import org.opencb.biodata.formats.variant.io.VariantReader;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.opencga.core.auth.OpenCGACredentials;
import org.opencb.opencga.storage.core.variant.adaptors.VariantDBAdaptor;
import org.opencb.opencga.storage.mongodb.utils.MongoCredentials;
import org.opencb.opencga.storage.mongodb.variant.VariantMongoDBAdaptor;

import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamVariantMongoReader implements VariantReader {
    private VariantDBAdaptor variantDBAdaptor;
    private OpenCGACredentials credentials;
    private Iterator<Variant> it;

    public TeamVariantMongoReader(OpenCGACredentials credentials) {
        this.credentials = credentials;
    }

    @Override
    public List<String> getSampleNames() {
        return null;
    }

    @Override
    public String getHeader() {
        return null;
    }

    @Override
    public boolean open() {
        try {
            variantDBAdaptor = new VariantMongoDBAdaptor((MongoCredentials) credentials, "variants", "files");
        } catch (UnknownHostException e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    @Override
    public boolean close() {
        return variantDBAdaptor.close();
    }

    @Override
    public boolean pre() {
        it = variantDBAdaptor.iterator();
        return true;
    }

    @Override
    public boolean post() {
        return true;
    }

    @Override
    public List<Variant> read() {
        return this.read(1);
    }

    @Override
    public List<Variant> read(int batchSize) {

        int cont = 0;
        List<Variant> res = new ArrayList<>();
        while (it.hasNext() && cont < batchSize) {
            Variant v = it.next();
            res.add(v);
            cont++;
        }
        return res;
    }
}
