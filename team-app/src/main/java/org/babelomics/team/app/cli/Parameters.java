package org.babelomics.team.app.cli;

import com.beust.jcommander.Parameter;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class Parameters {


    @Parameter(names = {"--sampleId"}, description = "Sample Id", required = true)
    private int sampleId;

    @Parameter(names = {"--output", "-o"}, description = "Output", required = true)
    private String output;


    @Parameter(names = {"--panel", "-p"}, description = "panel", required = false)
    private String panel;


    @Parameter(names = {"--sessionId", "-s"}, description = "sessionId", required = true)
    private String sessionId;

    @Parameter(names = {"--studyId"}, description = "StudyId", required = true)
    private int studyId;


    @Parameter(names = {"-h", "--help"}, help = true)
    private boolean help;

    @Parameter(names = {"--opencga-home"}, help = true)
    private String opencgaHome = System.getenv("OPENCGA_HOME");


    public int getInput() {
        return sampleId;
    }

    public String getPanel() {
        return panel;
    }

    public boolean isHelp() {
        return help;
    }

    public String getOutput() {
        return output;
    }

    public String getSessionId() {
        return sessionId;
    }

    public int getStudyId() {
        return studyId;
    }

    public String getOpencgaHome() {
        return opencgaHome;
    }
}
