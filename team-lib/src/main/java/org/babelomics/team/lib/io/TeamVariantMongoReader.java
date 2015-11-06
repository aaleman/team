package org.babelomics.team.lib.io;

import org.opencb.biodata.formats.variant.io.VariantReader;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.opencga.analysis.storage.AnalysisFileIndexer;
import org.opencb.opencga.catalog.CatalogManager;
import org.opencb.opencga.catalog.exceptions.CatalogException;
import org.opencb.opencga.catalog.models.DataStore;
import org.opencb.opencga.catalog.models.File;
import org.opencb.opencga.catalog.models.Study;
import org.opencb.opencga.storage.core.StorageManagerException;
import org.opencb.opencga.storage.core.StorageManagerFactory;
import org.opencb.opencga.storage.core.config.StorageConfiguration;
import org.opencb.opencga.storage.core.variant.VariantStorageManager;
import org.opencb.opencga.storage.core.variant.adaptors.VariantDBAdaptor;
import org.opencb.opencga.storage.core.variant.adaptors.VariantDBIterator;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamVariantMongoReader implements VariantReader {

    private Properties catalogProp;
    private StorageConfiguration storageConfiguration;
    private CatalogManager catalogManager;
    private DataStore dataStore;
    private int studyId;
    private String sessionId;
    private String storageEngine;
    private String dbName;
    private StorageManagerFactory storageManagerFactory;
    private VariantStorageManager storageManager;
    private VariantDBAdaptor dbAdaptor;
    private VariantDBIterator iterator;

    public TeamVariantMongoReader(Properties catalogProp, StorageConfiguration storageConfiguration, int studyId, String sessionId) {


        this.catalogProp = catalogProp;
        this.storageConfiguration = storageConfiguration;
        this.studyId = studyId;
        this.sessionId = sessionId;
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
        boolean res = true;
        try {
            CatalogManager catalogManager = new CatalogManager(catalogProp);
            dataStore = AnalysisFileIndexer.getDataStore(catalogManager, studyId, File.Bioformat.VARIANT, sessionId);
            storageEngine = dataStore.getStorageEngine();
            dbName = dataStore.getDbName();
            storageManagerFactory = new StorageManagerFactory(storageConfiguration);

            storageManager = storageManagerFactory.getVariantStorageManager(storageEngine);
            dbAdaptor = storageManager.getDBAdaptor(dbName);

            iterator = dbAdaptor.iterator();


            Study study = catalogManager.getStudy(studyId, sessionId).getResult().get(0);

        } catch (CatalogException | ClassNotFoundException | StorageManagerException | IllegalAccessException | InstantiationException e) {
            e.printStackTrace();
            res = false;
        }

        return res;
    }

    @Override
    public boolean close() {
        return true;
    }

    @Override
    public boolean pre() {

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
        while (iterator.hasNext() && cont < batchSize) {
            Variant v = iterator.next();
            res.add(v);
            cont++;
        }

        return res;
    }
}
