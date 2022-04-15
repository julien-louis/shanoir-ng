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

package org.shanoir.uploader.nominativeData;

import java.io.File;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

import org.apache.log4j.Logger;

/**
 * This class manages NominativeDataUploadJob.
 * @author ifakhfakh
 *
 */
public class NominativeDataUploadJobManager {
	
	private static Logger logger = Logger.getLogger(NominativeDataUploadJobManager.class);

	public static final String NOMINATIVE_DATA_JOB_XML = "nominative-data-job.xml";

	private File nominativeDataJobFile; 
	
	/**
	 * Initialize UploadJobManager empty and reset uploadJobFile
	 * with method setUploadJobFile.
	 */
	public NominativeDataUploadJobManager() {
	}
	
	/**
	 * Initialize MoninativeDataUploadJobManager with current moninative date folder path.
	 * @param uploadFolder
	 */
	public NominativeDataUploadJobManager(final String uploadFolderPath) {
		this.nominativeDataJobFile = new File(
			uploadFolderPath
			+ File.separatorChar
			+ NOMINATIVE_DATA_JOB_XML);
		logger.debug("UploadJobManager initialized with file: "
			+ this.nominativeDataJobFile.getAbsolutePath());
	}
	
	/**
	 * Initialize UploadJobManager with UploadJob file.
	 * @param uploadFolder
	 */
	public NominativeDataUploadJobManager(final File uploadJobFile) {
		this.nominativeDataJobFile = uploadJobFile;
		logger.debug("UploadJobManager initialized with file: "
			+ this.nominativeDataJobFile.getAbsolutePath());
	}
	
	/* (non-Javadoc)
	 * @see org.shanoir.uploader.upload.IUploadJobManager#writeUploadJob(org.shanoir.uploader.upload.UploadJob)
	 */
	
	public void writeUploadDataJob(final NominativeDataUploadJob nominativeDataUploadJob) {
		JAXBContext jaxbContext;
		try {
			jaxbContext = JAXBContext.newInstance(NominativeDataUploadJob.class);
			Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
			jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
			jaxbMarshaller.marshal(nominativeDataUploadJob, nominativeDataJobFile);
		} catch (JAXBException e) {
			logger.error(e);
		}
	}

	/* (non-Javadoc)
	 * @see org.shanoir.uploader.upload.IUploadJobManager#readUploadJob()
	 */

	public NominativeDataUploadJob readUploadDataJob() {
		try {
			final JAXBContext jaxbContext = JAXBContext.newInstance(NominativeDataUploadJob.class);
			final Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
			final NominativeDataUploadJob uploadJob = (NominativeDataUploadJob) jaxbUnmarshaller.unmarshal(nominativeDataJobFile);
			return uploadJob;
		} catch (JAXBException e) {
			logger.error(e);
		}
		return null;
	}

	public File getUploadJobFile() {
		return nominativeDataJobFile;
	}

	public void setUploadJobFile(File uploadJobFile) {
		this.nominativeDataJobFile = uploadJobFile;
	}
	
}
