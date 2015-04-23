package org.babelomics.team.app.cli;

import org.babelomics.team.lib.filters.TeamVariantGeneRegionFilter;
import org.babelomics.team.lib.io.TeamVariantMongoReader;
import org.opencb.biodata.formats.variant.io.VariantReader;
import org.opencb.biodata.formats.variant.io.VariantWriter;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.models.variant.VariantSource;
import org.opencb.biodata.tools.variant.filtering.VariantFilter;
import org.opencb.biodata.tools.variant.tasks.VariantFilterTask;
import org.opencb.biodata.tools.variant.tasks.VariantRunner;
import org.opencb.commons.containers.list.SortedList;
import org.opencb.commons.run.Runner;
import org.opencb.commons.run.Task;
import org.opencb.opencga.lib.auth.OpenCGACredentials;
import org.opencb.opencga.storage.mongodb.utils.MongoCredentials;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class TeamMain {

    public static void main(String[] args) throws IOException {

        VariantSource source = new VariantSource("file", "file", "file", "file");

        Properties properties = new Properties();
        properties.load(new InputStreamReader(new FileInputStream("team.credentials")));
        OpenCGACredentials credentials = new MongoCredentials(properties);

        System.out.println("properties = " + properties);

        VariantReader reader = new TeamVariantMongoReader(credentials);

        List<Task<Variant>> taskList = new SortedList<>();
        List<VariantWriter> writerList = new ArrayList<>();

        List<VariantFilter> filterList = new ArrayList<>();

        VariantFilter geneRegionFilter = new TeamVariantGeneRegionFilter("1:1-20000");
        filterList.add(geneRegionFilter);

        Task<Variant> variantFilterTask = new VariantFilterTask(filterList);

        taskList.add(variantFilterTask);

        Runner<Variant> teamRunner = new VariantRunner(source, reader, null, writerList, taskList, 100);

        teamRunner.run();

    }
}
