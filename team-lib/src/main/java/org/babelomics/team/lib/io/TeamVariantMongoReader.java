package org.babelomics.team.lib.io;

import org.opencb.biodata.formats.variant.io.VariantReader;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.datastore.core.Query;
import org.opencb.datastore.core.QueryOptions;
import org.opencb.opencga.analysis.storage.AnalysisFileIndexer;
import org.opencb.opencga.catalog.CatalogManager;
import org.opencb.opencga.catalog.exceptions.CatalogException;
import org.opencb.opencga.catalog.models.DataStore;
import org.opencb.opencga.catalog.models.File;
import org.opencb.opencga.storage.core.StorageManagerException;
import org.opencb.opencga.storage.core.StorageManagerFactory;
import org.opencb.opencga.storage.core.config.StorageConfiguration;
import org.opencb.opencga.storage.core.variant.VariantStorageManager;
import org.opencb.opencga.storage.core.variant.adaptors.VariantDBAdaptor;
import org.opencb.opencga.storage.core.variant.adaptors.VariantDBIterator;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamVariantMongoReader implements VariantReader {

    private StorageConfiguration storageConfiguration;
    private CatalogManager catalogManager;
    private int studyId;
    private String sessionId;
    private VariantDBIterator iterator;

    public TeamVariantMongoReader(CatalogManager catalogManager, StorageConfiguration storageConfiguration, int studyId, String sessionId) {
        this.storageConfiguration = storageConfiguration;
        this.studyId = studyId;
        this.sessionId = sessionId;
        this.catalogManager = catalogManager;
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

            DataStore dataStore = AnalysisFileIndexer.getDataStore(catalogManager, studyId, File.Bioformat.VARIANT, sessionId);
            String storageEngine = dataStore.getStorageEngine();
            String dbName = dataStore.getDbName();
            StorageManagerFactory storageManagerFactory = new StorageManagerFactory(storageConfiguration);

            VariantStorageManager storageManager = storageManagerFactory.getVariantStorageManager(storageEngine);
            VariantDBAdaptor dbAdaptor = storageManager.getDBAdaptor(dbName);

            Query q = new Query();

            q.append(String.valueOf(VariantDBAdaptor.VariantQueryParams.RETURNED_STUDIES), this.studyId);

            iterator = dbAdaptor.iterator(new QueryOptions());

        } catch (CatalogException | ClassNotFoundException  | IllegalAccessException | InstantiationException e) {
            e.printStackTrace();
            res = false;
        } catch (StorageManagerException e) {
            e.printStackTrace();
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
