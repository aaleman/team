package org.babelomics.team.app.cli;

import com.beust.jcommander.Parameter;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class Parameters {


    @Parameter(names = {"--input"}, description = "Input", required = true)
    private String input;


    @Parameter(names = {"--panel"}, description = "panel", required = true)
    private String panel;


    @Parameter(names = {"-h", "--help"}, help = true)
    private boolean help;


    public String getInput() {
        return input;
    }

    public String getPanel() {
        return panel;
    }

    public boolean isHelp() {
        return help;
    }
}
