/**
 * Shanoir NG - Import, manage and share neuroimaging data
 * Copyright (C) 2009-2019 Inria - https://www.inria.fr/
 * Contact us on https://project.inria.fr/shanoir/
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/gpl-3.0.html
 */

<<<<<<< HEAD:shanoir-ng-studies/src/main/java/org/shanoir/ng/manufacturermodel/dto/ManufacturerModelDTO.java
package org.shanoir.ng.manufacturermodel.dto;

import org.shanoir.ng.manufacturermodel.model.DatasetModalityType;
=======
package org.shanoir.ng.manufacturermodel;
>>>>>>> upstream/develop:shanoir-ng-studies/src/main/java/org/shanoir/ng/manufacturermodel/ManufacturerModelDTO.java

/**
 * DTO for manufacturer models.
 * 
 * @author msimon
 *
 */
public class ManufacturerModelDTO {

	private DatasetModalityType datasetModalityType;

	private Double magneticField;

	private String manufacturerName;

	private String name;

	/**
	 * @return the datasetModalityType
	 */
	public DatasetModalityType getDatasetModalityType() {
		return datasetModalityType;
	}

	/**
	 * @param datasetModalityType
	 *            the datasetModalityType to set
	 */
	public void setDatasetModalityType(DatasetModalityType datasetModalityType) {
		this.datasetModalityType = datasetModalityType;
	}

	/**
	 * @return the magneticField
	 */
	public Double getMagneticField() {
		return magneticField;
	}

	/**
	 * @param magneticField
	 *            the magneticField to set
	 */
	public void setMagneticField(Double magneticField) {
		this.magneticField = magneticField;
	}

	/**
	 * @return the manufacturerName
	 */
	public String getManufacturerName() {
		return manufacturerName;
	}

	/**
	 * @param manufacturerName
	 *            the manufacturerName to set
	 */
	public void setManufacturerName(String manufacturerName) {
		this.manufacturerName = manufacturerName;
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

}
