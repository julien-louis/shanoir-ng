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

package org.shanoir.ng.shared.core.model;

import java.io.Serializable;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

/**
 * Generic class used to manage entities common data.
 * 
 * @author msimon
 *
 */
@MappedSuperclass
public abstract class AbstractEntity implements Serializable {

	/**
	 * UID
	 */
	private static final long serialVersionUID = -3276989363792089822L;

	@Id
    @GeneratedValue(
    		strategy = GenerationType.SEQUENCE,
    		generator = "sequence-generator"
    )
    @GenericGenerator(
    		name = "sequence-generator",
    		type = org.hibernate.id.enhanced.SequenceStyleGenerator.class,
    		parameters = {
    				@Parameter(name = "increment_size", value = "1")
    		}
    )
	private Long id;

	/**
	 * @return the id
	 */
	public Long getId() {
		return id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(Long id) {
		this.id = id;
	}

}
