package org.shanoir.ng.importer.dto;

import java.util.List;

import org.shanoir.ng.datasetfile.DatasetFile;

public class ExpressionFormat {

	private String type;
	
	private List<DatasetFile> datasetFiles;

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public List<DatasetFile> getDatasetFiles() {
		return datasetFiles;
	}

	public void setDatasetFiles(List<DatasetFile> datasetFiles) {
		this.datasetFiles = datasetFiles;
	}
	
	
	
}
