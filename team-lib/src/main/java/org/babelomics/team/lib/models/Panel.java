package org.babelomics.team.lib.models;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * @author Alejandro Alemán Ramos <aaleman@cipf.es>
 */
public class Panel {
    public boolean archived;
    public String author;
    public String date;
    public String description;
    public String name;
    public int version;
    public List<Disease> diseases = new ArrayList<>();
    public List<Gene> genes = new ArrayList<>();
    public List<Mutation> mutations = new ArrayList<>();
    public String id;
    public String disease;


    public Panel() {
    }


    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public List<Disease> getDiseases() {
        return diseases;
    }

    public void setDiseases(List<Disease> diseases) {
        this.diseases = diseases;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<Gene> getGenes() {
        return genes;
    }

    public void setGenes(List<Gene> genes) {
        this.genes = genes;
    }

    public List<Mutation> getMutations() {
        return mutations;
    }

    public void setMutations(List<Mutation> mutations) {
        this.mutations = mutations;
    }

    public String getDisease() {
        return disease;
    }

    public void setDisease(String disease) {
        this.disease = disease;
    }

    @Override
    public String toString() {

        String diseases = Arrays.asList(this.diseases).toString();
        String genes = Arrays.asList(this.genes).toString();
        String mutations = Arrays.asList(this.mutations).toString();

        return "Panel{" +
                "archived=" + archived +
                ", author='" + author + '\'' +
                ", disease='" + disease + '\'' +
                ", date='" + date + '\'' +
                ", description='" + description + '\'' +
                ", name='" + name + '\'' +
                ", version=" + version +
                ", diseases=" + diseases +
                ", genes=" + genes +
                ", mutations=" + mutations +
                ", id='" + id + '\'' +
                '}';
    }
}
